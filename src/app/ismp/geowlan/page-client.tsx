"use client";

import { useState, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, MapPin } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { GeowlanAP } from "@/server/repositories/geowlan";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { DataTableGeowlan } from "@/components/geowlan/tableGeowlan";
import { geowlanColumns } from "@/components/geowlan/columnsGeowlan";
import { GeowlanDeleteDialog } from "@/components/geowlan/deleteDialogGeowlan";
import { GeowlanForm } from "@/components/geowlan/formGeowlan";
import { convertLocalCoordToGlobal } from "@/lib/geowlanCoordinatesConverter";
import {
  exportGeowlanToKML,
  validateGeowlanPointsForExport,
} from "@/lib/kmlExporter";

export function GeowlanPageClient() {
  const { data: geowlanData, isLoading } = api.geowlan.aps.getAll.useQuery();
  const [geowlanToEdit, setGeowlanToEdit] = useState<GeowlanAP | undefined>(
    undefined,
  );
  const [selected, setSelected] = useState<
    | { g: GeowlanAP; pos: google.maps.LatLng | google.maps.LatLngLiteral }
    | undefined
  >(undefined);
  const [geowlanToDelete, setGeowlanToDelete] = useState<GeowlanAP | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [geowlanFormOpen, setGeowlanFormOpen] = useState(false);

  const handleEdit = (geowlan: GeowlanAP) => {
    setGeowlanToEdit(geowlan);
    setGeowlanFormOpen(true);
  };

  const handleDelete = (geowlan: GeowlanAP) => {
    setGeowlanToDelete(geowlan);
    setDeleteDialogOpen(true);
  };

  const onFormSubmit = () => {
    setGeowlanToEdit(undefined);
    setGeowlanFormOpen(false);
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      setGeowlanToEdit(undefined);
    }
    setGeowlanFormOpen(open);
  };

  const onDeleteSuccess = () => {
    setGeowlanToDelete(null);
  };

  const handleExportToKML = async () => {
    if (!geowlanData || geowlanData.length === 0) {
      toast.error("Няма данни за експорт");
      return;
    }

    try {
      // Validate data before export
      const validation = validateGeowlanPointsForExport(geowlanData);
      if (!validation.isValid) {
        toast.error(`Грешка при валидация: ${validation.errors.join(", ")}`);
        return;
      }

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `geowlan_points_${currentDate}.kml`;

      await exportGeowlanToKML(geowlanData, filename);

      toast.success(
        `Успешно експортирани ${geowlanData.length} точки в Google Earth формат`,
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Възникна грешка при експорта");
    }
  };

  const handleShowOnMap = (geowlan: GeowlanAP) => {
    if (map && geowlan.x && geowlan.y) {
      const position = convertLocalCoordToGlobal(geowlan.x, geowlan.y);
      map.panTo(position);
      map.setZoom(16);
      document
        .querySelector("#map-geowlan")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
  });

  const centerGoogle = useMemo(() => ({ lat: 42.751111, lng: 24.030556 }), []);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <MapPin className="h-6 w-6" />
            Geowlan Точки
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={handleExportToKML}
              variant="outline"
              size="default"
              disabled={!geowlanData || geowlanData.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Експорт за Google Earth
            </Button>
            <GeowlanForm
              open={geowlanFormOpen}
              geowlanToEdit={geowlanToEdit}
              setOpen={handleFormOpenChange}
              onFormSubmit={onFormSubmit}
            />
          </div>
        </div>
      </div>
      <Separator />

      {(isLoading || !isMapLoaded) && (
        <LoadingSpinner size="lg" label="Зареждане..." showLabel />
      )}

      <div id="map-geowlan" className="h-[800px] w-full">
        {isMapLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "800px" }}
            center={centerGoogle}
            zoom={14}
            mapTypeId="satellite"
            onLoad={(map) => {
              setMap(map);
            }}
            onUnmount={() => {
              setMap(null);
            }}
          >
            {geowlanData
              ? geowlanData.map((geowlan) => {
                  if (!geowlan.x || !geowlan.y) return null;
                  return (
                    <Marker
                      key={geowlan.id}
                      position={convertLocalCoordToGlobal(geowlan.x, geowlan.y)}
                      onClick={(e) =>
                        setSelected({
                          g: geowlan as GeowlanAP,
                          pos: e.latLng!,
                        })
                      }
                    />
                  );
                })
              : null}
            {selected && (
              <InfoWindow
                position={selected.pos}
                onCloseClick={() => setSelected(undefined)}
              >
                <div className="p-2">
                  <h3 className="font-bold">{selected.g.name}</h3>
                  <p>
                    X: {selected.g.x}, Y: {selected.g.y}
                  </p>
                  <button
                    onClick={() => handleEdit(selected.g)}
                    className="mt-2 rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                  >
                    Редактирай
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>

      {!isLoading && geowlanData && (
        <DataTableGeowlan
          columns={geowlanColumns({
            actions: {
              edit: handleEdit,
              delete: handleDelete,
              showOnMap: handleShowOnMap,
            },
          })}
          data={[...(geowlanData as GeowlanAP[])]}
        />
      )}

      <GeowlanDeleteDialog
        geowlanAP={geowlanToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleteSuccess={onDeleteSuccess}
      />
    </div>
  );
}

