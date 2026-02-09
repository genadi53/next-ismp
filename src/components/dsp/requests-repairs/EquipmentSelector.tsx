"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";

// Hardcoded drills list as per PHP implementation
const DRILLS = [
  "A7",
  "A8",
  "A9",
  "A10",
  "C4",
  "C5",
  "C11",
  "SK1",
  "SK2",
  "SK3",
  "SK6",
  "S12",
  "S13",
  "C14",
];

type EquipmentType = "excavator" | "drill" | "other";

export type SelectedEquipment = {
  id: string;
  name: string;
  type: EquipmentType;
  typeCode: string;
};

type EquipmentSelectorProps = {
  selectedEquipment: SelectedEquipment[];
  onSelectionChange: (equipment: SelectedEquipment[]) => void;
  activeEquipment: string | null;
  onActiveChange: (equipmentId: string | null) => void;
};

export function EquipmentSelector({
  selectedEquipment,
  onSelectionChange,
  activeEquipment,
  onActiveChange,
}: EquipmentSelectorProps) {
  const { data: excavators, isLoading } =
    api.dispatcher.repairs.getExcavators.useQuery();

  const [showOther, setShowOther] = useState(
    selectedEquipment.some((e) => e.type === "other"),
  );

  const handleExcavatorToggle = (fieldId: string, checked: boolean) => {
    if (checked) {
      const newEquipment: SelectedEquipment = {
        id: fieldId,
        name: fieldId,
        type: "excavator",
        typeCode: "1",
      };
      onSelectionChange([...selectedEquipment, newEquipment]);
      onActiveChange(fieldId);
    } else {
      onSelectionChange(selectedEquipment.filter((e) => e.id !== fieldId));
      if (activeEquipment === fieldId) {
        const remaining = selectedEquipment.filter((e) => e.id !== fieldId);
        onActiveChange(
          remaining.length > 0 ? remaining[remaining.length - 1]!.id : null,
        );
      }
    }
  };

  const handleDrillToggle = (drillId: string, checked: boolean) => {
    if (checked) {
      const newEquipment: SelectedEquipment = {
        id: drillId,
        name: drillId,
        type: "drill",
        typeCode: "2",
      };
      onSelectionChange([...selectedEquipment, newEquipment]);
      onActiveChange(drillId);
    } else {
      onSelectionChange(selectedEquipment.filter((e) => e.id !== drillId));
      if (activeEquipment === drillId) {
        const remaining = selectedEquipment.filter((e) => e.id !== drillId);
        onActiveChange(
          remaining.length > 0 ? remaining[remaining.length - 1]!.id : null,
        );
      }
    }
  };

  const handleOtherToggle = (checked: boolean) => {
    setShowOther(checked);
    if (checked) {
      const newEquipment: SelectedEquipment = {
        id: "ДРУГИ",
        name: "Други",
        type: "other",
        typeCode: "3",
      };
      onSelectionChange([...selectedEquipment, newEquipment]);
      onActiveChange("ДРУГИ");
    } else {
      onSelectionChange(selectedEquipment.filter((e) => e.type !== "other"));
      if (activeEquipment === "ДРУГИ") {
        const remaining = selectedEquipment.filter((e) => e.type !== "other");
        onActiveChange(
          remaining.length > 0 ? remaining[remaining.length - 1]!.id : null,
        );
      }
    }
  };

  const isSelected = (id: string) => selectedEquipment.some((e) => e.id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  // Group excavators: 2B* and 3B*
  const excavators2B =
    excavators?.filter((e) => e.FieldId.startsWith("2B")) ?? [];
  const excavators3B =
    excavators?.filter((e) => e.FieldId.startsWith("3B")) ?? [];
  const excavators3L =
    excavators?.filter((e) => e.FieldId.startsWith("3L")) ?? [];
  const otherExcavators =
    excavators?.filter(
      (e) =>
        !e.FieldId.startsWith("2B") &&
        !e.FieldId.startsWith("3B") &&
        !e.FieldId.startsWith("3L"),
    ) ?? [];

  // Group drills
  const drillsA = DRILLS.filter((d) => d.startsWith("A"));
  const drillsC = DRILLS.filter((d) => d.startsWith("C"));
  const drillsSK = DRILLS.filter((d) => d.startsWith("SK"));
  const drillsS = DRILLS.filter(
    (d) => d.startsWith("S") && !d.startsWith("SK"),
  );

  return (
    <div className="space-y-6">
      {/* Excavators Section */}
      <div>
        <Label className="text-sm font-medium">
          Багери <span className="text-red-500">*</span>
        </Label>
        <div className="mt-2 space-y-2">
          {/* 2B Excavators */}
          {excavators2B.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {excavators2B.map((excavator) => (
                <button
                  key={excavator.FieldId}
                  type="button"
                  onClick={() =>
                    handleExcavatorToggle(
                      excavator.FieldId,
                      !isSelected(excavator.FieldId),
                    )
                  }
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
                    isSelected(excavator.FieldId)
                      ? "border-blue-500 bg-blue-100 text-blue-800"
                      : "border-gray-300 bg-white hover:bg-gray-50",
                    activeEquipment === excavator.FieldId &&
                      "ring-2 ring-blue-500 ring-offset-1",
                  )}
                >
                  <Checkbox
                    checked={isSelected(excavator.FieldId)}
                    onCheckedChange={(checked) =>
                      handleExcavatorToggle(excavator.FieldId, !!checked)
                    }
                  />
                  {excavator.FieldId}
                </button>
              ))}
            </div>
          )}

          {/* 3B and 3L Excavators */}
          {(excavators3B.length > 0 || excavators3L.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {[...excavators3B, ...excavators3L].map((excavator) => (
                <button
                  key={excavator.FieldId}
                  type="button"
                  onClick={() =>
                    handleExcavatorToggle(
                      excavator.FieldId,
                      !isSelected(excavator.FieldId),
                    )
                  }
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
                    isSelected(excavator.FieldId)
                      ? "border-blue-500 bg-blue-100 text-blue-800"
                      : "border-gray-300 bg-white hover:bg-gray-50",
                    activeEquipment === excavator.FieldId &&
                      "ring-2 ring-blue-500 ring-offset-1",
                  )}
                >
                  <Checkbox
                    checked={isSelected(excavator.FieldId)}
                    onCheckedChange={(checked) =>
                      handleExcavatorToggle(excavator.FieldId, !!checked)
                    }
                  />
                  {excavator.FieldId}
                </button>
              ))}
            </div>
          )}

          {/* Other Excavators */}
          {otherExcavators.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {otherExcavators.map((excavator) => (
                <button
                  key={excavator.FieldId}
                  type="button"
                  onClick={() =>
                    handleExcavatorToggle(
                      excavator.FieldId,
                      !isSelected(excavator.FieldId),
                    )
                  }
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
                    isSelected(excavator.FieldId)
                      ? "border-blue-500 bg-blue-100 text-blue-800"
                      : "border-gray-300 bg-white hover:bg-gray-50",
                    activeEquipment === excavator.FieldId &&
                      "ring-2 ring-blue-500 ring-offset-1",
                  )}
                >
                  <Checkbox
                    checked={isSelected(excavator.FieldId)}
                    onCheckedChange={(checked) =>
                      handleExcavatorToggle(excavator.FieldId, !!checked)
                    }
                  />
                  {excavator.FieldId}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drills Section */}
      <div>
        <Label className="text-sm font-medium">Сонди</Label>
        <div className="mt-2 space-y-2">
          {/* A Series */}
          <div className="flex flex-wrap gap-2">
            {drillsA.map((drill) => (
              <button
                key={drill}
                type="button"
                onClick={() => handleDrillToggle(drill, !isSelected(drill))}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
                  isSelected(drill)
                    ? "border-gray-600 bg-gray-200 text-gray-800"
                    : "border-gray-300 bg-white hover:bg-gray-50",
                  activeEquipment === drill &&
                    "ring-2 ring-gray-500 ring-offset-1",
                )}
              >
                <Checkbox
                  checked={isSelected(drill)}
                  onCheckedChange={(checked) =>
                    handleDrillToggle(drill, !!checked)
                  }
                />
                {drill}
              </button>
            ))}
          </div>

          {/* C Series */}
          <div className="flex flex-wrap gap-2">
            {drillsC.map((drill) => (
              <button
                key={drill}
                type="button"
                onClick={() => handleDrillToggle(drill, !isSelected(drill))}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
                  isSelected(drill)
                    ? "border-gray-600 bg-gray-200 text-gray-800"
                    : "border-gray-300 bg-white hover:bg-gray-50",
                  activeEquipment === drill &&
                    "ring-2 ring-gray-500 ring-offset-1",
                )}
              >
                <Checkbox
                  checked={isSelected(drill)}
                  onCheckedChange={(checked) =>
                    handleDrillToggle(drill, !!checked)
                  }
                />
                {drill}
              </button>
            ))}
          </div>

          {/* SK and S Series */}
          <div className="flex flex-wrap gap-2">
            {[...drillsSK, ...drillsS].map((drill) => (
              <button
                key={drill}
                type="button"
                onClick={() => handleDrillToggle(drill, !isSelected(drill))}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
                  isSelected(drill)
                    ? "border-gray-600 bg-gray-200 text-gray-800"
                    : "border-gray-300 bg-white hover:bg-gray-50",
                  activeEquipment === drill &&
                    "ring-2 ring-gray-500 ring-offset-1",
                )}
              >
                <Checkbox
                  checked={isSelected(drill)}
                  onCheckedChange={(checked) =>
                    handleDrillToggle(drill, !!checked)
                  }
                />
                {drill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Other Section */}
      <div>
        <Label className="text-sm font-medium">Други машини</Label>
        <div className="mt-2">
          <button
            type="button"
            onClick={() => handleOtherToggle(!showOther)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
              showOther
                ? "border-green-600 bg-green-100 text-green-800"
                : "border-gray-300 bg-white hover:bg-gray-50",
              activeEquipment === "ДРУГИ" &&
                "ring-2 ring-green-500 ring-offset-1",
            )}
          >
            <Checkbox
              checked={showOther}
              onCheckedChange={(checked) => handleOtherToggle(!!checked)}
            />
            Други
          </button>
        </div>
      </div>
    </div>
  );
}
