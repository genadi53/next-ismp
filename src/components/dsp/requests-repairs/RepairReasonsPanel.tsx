"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/trpc/react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import { Search } from "lucide-react";
import type { SelectedEquipment } from "./EquipmentSelector";

type RepairReasonsPanelProps = {
  activeEquipment: SelectedEquipment | null;
  onReasonSelect: (reason: string) => void;
};

export function RepairReasonsPanel({
  activeEquipment,
  onReasonSelect,
}: RepairReasonsPanelProps) {
  const [excavatorSearch, setExcavatorSearch] = useState("");
  const [drillSearch, setDrillSearch] = useState("");

  const { data: excavatorReasons, isLoading: loadingExcavator } =
    api.dispatcher.repairs.getExcavatorReasons.useQuery();
  const { data: drillReasons, isLoading: loadingDrill } =
    api.dispatcher.repairs.getDrillReasons.useQuery();

  const filteredExcavatorReasons = useMemo(() => {
    if (!excavatorReasons) return [];
    if (!excavatorSearch.trim()) return excavatorReasons;
    const search = excavatorSearch.toUpperCase();
    return excavatorReasons.filter((r) => r.toUpperCase().includes(search));
  }, [excavatorReasons, excavatorSearch]);

  const filteredDrillReasons = useMemo(() => {
    if (!drillReasons) return [];
    if (!drillSearch.trim()) return drillReasons;
    const search = drillSearch.toUpperCase();
    return drillReasons.filter((r) => r.toUpperCase().includes(search));
  }, [drillReasons, drillSearch]);

  const handleReasonDoubleClick = (reason: string) => {
    if (activeEquipment) {
      onReasonSelect(reason);
    }
  };

  // Show excavator panel if there's an active excavator or no active equipment
  const showExcavator =
    !activeEquipment || activeEquipment.type === "excavator";
  // Show drill panel if there's an active drill or no active equipment
  const showDrill = !activeEquipment || activeEquipment.type === "drill";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Excavator Reasons */}
      {showExcavator && (
        <div
          className={cn(
            "rounded-lg border p-4",
            activeEquipment?.type === "excavator"
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200",
          )}
        >
          <div className="mb-3">
            <Label className="text-sm font-medium">
              Заявки за Багери{" "}
              <span className="text-red-500">(Двоен клик на мишка)</span>
            </Label>
            <div className="relative mt-2">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Търси..."
                value={excavatorSearch}
                onChange={(e) => setExcavatorSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loadingExcavator ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {filteredExcavatorReasons.map((reason, index) => (
                  <button
                    key={`excavator-${index}-${reason}`}
                    type="button"
                    onDoubleClick={() => handleReasonDoubleClick(reason)}
                    disabled={activeEquipment?.type !== "excavator"}
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      activeEquipment?.type === "excavator"
                        ? "cursor-pointer border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-200"
                        : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400",
                    )}
                  >
                    {reason}
                  </button>
                ))}
                {filteredExcavatorReasons.length === 0 && (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    Няма намерени заявки
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Drill Reasons */}
      {showDrill && (
        <div
          className={cn(
            "rounded-lg border p-4",
            activeEquipment?.type === "drill"
              ? "border-gray-400 bg-gray-50"
              : "border-gray-200",
          )}
        >
          <div className="mb-3">
            <Label className="text-sm font-medium">
              Заявки за Сонди{" "}
              <span className="text-red-500">(Двоен клик на мишка)</span>
            </Label>
            <div className="relative mt-2">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Търси..."
                value={drillSearch}
                onChange={(e) => setDrillSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loadingDrill ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-1">
                {filteredDrillReasons.map((reason, index) => (
                  <button
                    key={`drill-${index}-${reason}`}
                    type="button"
                    onDoubleClick={() => handleReasonDoubleClick(reason)}
                    disabled={activeEquipment?.type !== "drill"}
                    className={cn(
                      "w-full rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      activeEquipment?.type === "drill"
                        ? "cursor-pointer border-gray-300 bg-white hover:bg-gray-100"
                        : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400",
                    )}
                  >
                    {reason}
                  </button>
                ))}
                {filteredDrillReasons.length === 0 && (
                  <p className="text-muted-foreground py-4 text-center text-sm">
                    Няма намерени заявки
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}
