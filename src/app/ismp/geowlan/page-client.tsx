"use client";

import { useState, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, MapPin } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Note: Google Maps integration will need to be implemented
// This is a simplified version without the map component
export function GeowlanPageClient() {
  const [geowlanToEdit, setGeowlanToEdit] = useState<any | undefined>(
    undefined,
  );
  const [geowlanToDelete, setGeowlanToDelete] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [geowlanFormOpen, setGeowlanFormOpen] = useState(false);

  const { data: geowlanData, isLoading } = api.geowlan.aps.getAll.useQuery();

  const utils = api.useUtils();
  const { mutateAsync: deleteGeowlan } = api.geowlan.aps.delete.useMutation({
    onSuccess: () => {
      utils.geowlan.aps.getAll.invalidate();
      toast.success("Успех", {
        description: "Geowlan точката е успешно изтрита.",
      });
      setGeowlanToDelete(null);
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Грешка", {
        description:
          error.message || "Възникна грешка при изтриването. Опитайте отново.",
      });
    },
  });

  const handleEdit = (geowlan: any) => {
    setGeowlanToEdit(geowlan);
    setGeowlanFormOpen(true);
  };

  const handleDelete = (geowlan: any) => {
    setGeowlanToDelete(geowlan);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (geowlanToDelete) {
      try {
        await deleteGeowlan({ id: geowlanToDelete.id });
      } catch (error) {
        console.error("Error deleting geowlan:", error);
      }
    }
  };

  const onFormSubmit = () => {
    setGeowlanToEdit(undefined);
    setGeowlanFormOpen(false);
    utils.geowlan.aps.getAll.invalidate();
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      setGeowlanToEdit(undefined);
    }
    setGeowlanFormOpen(open);
  };

  const handleExportToKML = async () => {
    if (!geowlanData || geowlanData.length === 0) {
      toast.error("Няма данни за експорт");
      return;
    }

    toast.info("Функционалността за експорт в KML ще бъде имплементирана скоро");
  };

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
            <Button
              onClick={() => setGeowlanFormOpen(true)}
              variant="default"
            >
              Добави точка
            </Button>
          </div>
        </div>
      </div>
      <Separator />

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" label="Зареждане..." showLabel />
        </div>
      )}

      {/* Google Maps Integration Placeholder */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Интеграцията с Google Maps ще бъде имплементирана в следващ етап.
          Необходими са: @react-google-maps/api библиотека и Google Maps API ключ.
        </AlertDescription>
      </Alert>

      <div id="map-geowlan" className="h-[600px] w-full rounded-lg border bg-muted">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          Картата ще бъде имплементирана тук
        </div>
      </div>

      {/* Table Section */}
      {!isLoading && geowlanData && geowlanData.length > 0 && (
        <div className="text-muted-foreground">
          Таблицата с данни ще бъде имплементирана в следващ етап.
        </div>
      )}

      {!isLoading && (!geowlanData || geowlanData.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          Няма намерени Geowlan точки
        </div>
      )}

      {/* Form Dialog Placeholder */}
      {geowlanFormOpen && (
        <Alert>
          <AlertDescription>
            Формата за създаване/редактиране на Geowlan точки ще бъде
            имплементирана в следващ етап.
          </AlertDescription>
        </Alert>
      )}

      {/* Delete Dialog */}
      {deleteDialogOpen && geowlanToDelete && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Сигурни ли сте, че искате да изтриете "{geowlanToDelete.name}"?
            <div className="mt-4 flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
              >
                Потвърди
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setGeowlanToDelete(null);
                }}
              >
                Отказ
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

