"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";
import { CalendarIcon, Save, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/toast";
import { EquipmentSelector, type SelectedEquipment } from "./EquipmentSelector";
import { RepairReasonsPanel } from "./RepairReasonsPanel";

type EquipmentInput = {
  content: string;
  notes: string;
  holes?: string;
};

type RequestRepairsFormProps = {
  onSuccess?: () => void;
  isReadOnly?: boolean;
};

export function RequestRepairsForm({
  onSuccess,
  isReadOnly = false,
}: RequestRepairsFormProps) {
  const [requestDate, setRequestDate] = useState<Date | undefined>(undefined);
  const [selectedEquipment, setSelectedEquipment] = useState<
    SelectedEquipment[]
  >([]);
  const [activeEquipment, setActiveEquipment] = useState<string | null>(null);
  const [equipmentInputs, setEquipmentInputs] = useState<
    Record<string, EquipmentInput>
  >({});

  const utils = api.useUtils();

  const { mutateAsync: createRequests, isPending } =
    api.dispatcher.repairs.createRequests.useMutation({
      onSuccess: () => {
        toast({
          title: "Успех",
          description: "Заявките за ремонт са записани успешно.",
        });
        void utils.dispatcher.repairs.getRequests.invalidate();
        // Reset form
        setRequestDate(undefined);
        setSelectedEquipment([]);
        setActiveEquipment(null);
        setEquipmentInputs({});
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          variant: "destructive",
          description:
            error.message ||
            "Възникна грешка при записването на заявките. Опитайте отново.",
        });
      },
    });

  const handleSelectionChange = (equipment: SelectedEquipment[]) => {
    setSelectedEquipment(equipment);
    // Initialize inputs for new equipment
    equipment.forEach((e) => {
      if (!equipmentInputs[e.id]) {
        setEquipmentInputs((prev) => ({
          ...prev,
          [e.id]: { content: "", notes: "", holes: "" },
        }));
      }
    });
    // Remove inputs for deselected equipment
    const selectedIds = new Set(equipment.map((e) => e.id));
    setEquipmentInputs((prev) => {
      const newInputs = { ...prev };
      Object.keys(newInputs).forEach((key) => {
        if (!selectedIds.has(key)) {
          delete newInputs[key];
        }
      });
      return newInputs;
    });
  };

  const handleInputChange = (
    equipmentId: string,
    field: keyof EquipmentInput,
    value: string,
  ) => {
    setEquipmentInputs((prev) => ({
      ...prev,
      [equipmentId]: {
        ...prev[equipmentId]!,
        [field]: value,
      },
    }));
  };

  const handleReasonSelect = useCallback(
    (reason: string) => {
      if (!activeEquipment) return;
      setEquipmentInputs((prev) => {
        const current = prev[activeEquipment]?.content ?? "";
        const newContent =
          current.length === 0 ? reason : `${current};${reason}`;
        return {
          ...prev,
          [activeEquipment]: {
            ...prev[activeEquipment]!,
            content: newContent,
          },
        };
      });
    },
    [activeEquipment],
  );

  const handleRemoveEquipment = (equipmentId: string) => {
    setSelectedEquipment((prev) => prev.filter((e) => e.id !== equipmentId));
    setEquipmentInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[equipmentId];
      return newInputs;
    });
    if (activeEquipment === equipmentId) {
      const remaining = selectedEquipment.filter((e) => e.id !== equipmentId);
      setActiveEquipment(
        remaining.length > 0 ? remaining[remaining.length - 1]!.id : null,
      );
    }
  };

  const getActiveEquipmentData = (): SelectedEquipment | null => {
    if (!activeEquipment) return null;
    return selectedEquipment.find((e) => e.id === activeEquipment) ?? null;
  };

  const canSubmit = () => {
    if (!requestDate) return false;
    if (selectedEquipment.length === 0) return false;

    // At least one equipment must have content, notes, or holes
    return selectedEquipment.some((e) => {
      const input = equipmentInputs[e.id];
      return (
        input &&
        (input.content.trim().length > 0 ||
          input.notes.trim().length > 0 ||
          (input.holes && input.holes.trim().length > 0))
      );
    });
  };

  const handleSubmit = async () => {
    if (!requestDate) {
      toast({
        title: "Грешка",
        description: "Моля, изберете дата.",
        variant: "destructive",
      });
      return;
    }

    const requests: {
      RequestDate: string;
      Equipment: string;
      EquipmentType: string | null;
      RequestRemont: string | null;
      DrillHoles_type: string | null;
    }[] = [];

    const formattedDate = format(requestDate, "yyyy-MM-dd");

    selectedEquipment.forEach((equipment) => {
      const input = equipmentInputs[equipment.id];
      if (!input) return;

      // Skip if no content
      if (
        !input.content.trim() &&
        !input.notes.trim() &&
        !input.holes?.trim()
      ) {
        return;
      }

      // Combine content and notes with "is||mp" separator as in PHP
      let requestRemont = input.content.trim().toUpperCase();
      if (input.notes.trim()) {
        if (requestRemont) {
          requestRemont += "is||mp" + input.notes.trim().toUpperCase();
        } else {
          requestRemont = input.notes.trim().toUpperCase();
        }
      }

      requests.push({
        RequestDate: formattedDate,
        Equipment: equipment.id,
        EquipmentType: equipment.typeCode,
        RequestRemont: requestRemont ?? null,
        DrillHoles_type:
          equipment.type === "drill" && input.holes?.trim()
            ? input.holes.trim()
            : null,
      });
    });

    if (requests.length === 0) {
      toast({
        title: "Грешка",
        description: "Моля, въведете поне една заявка за ремонт.",
        variant: "destructive",
      });
      return;
    }

    await createRequests(requests);
  };

  // Group selected equipment by type
  const selectedExcavators = selectedEquipment.filter(
    (e) => e.type === "excavator",
  );
  const selectedDrills = selectedEquipment.filter((e) => e.type === "drill");
  const selectedOther = selectedEquipment.filter((e) => e.type === "other");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Date and Equipment Selection */}
        <div className="space-y-6 lg:col-span-2">
          {/* Date Picker */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label>
                За дата <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isReadOnly}
                    className={cn(
                      "mt-2 w-full justify-start text-left font-normal",
                      !requestDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {requestDate
                      ? format(requestDate, "yyyy-MM-dd", { locale: bg })
                      : "Въведете дата"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={requestDate}
                    onSelect={setRequestDate}
                    disabled={(date) => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      yesterday.setHours(0, 0, 0, 0);
                      return date < yesterday;
                    }}
                    locale={bg}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isReadOnly || isPending || !canSubmit()}
            >
              <Save className="mr-2 h-4 w-4" />
              {isPending ? "Записване..." : "Запиши"}
            </Button>
          </div>

          {/* Equipment Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Избор на машини</CardTitle>
              <CardDescription>
                Изберете машините, за които ще създавате заявки
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EquipmentSelector
                selectedEquipment={selectedEquipment}
                onSelectionChange={handleSelectionChange}
                activeEquipment={activeEquipment}
                onActiveChange={setActiveEquipment}
              />
            </CardContent>
          </Card>

          {/* Selected Equipment Input Fields */}
          {selectedEquipment.length > 0 && (
            <div className="space-y-4">
              {/* Excavators */}
              {selectedExcavators.length > 0 && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-800">
                      Багери{" "}
                      <span className="text-sm font-normal text-red-500">
                        (За нова заявка се слага разделител ;)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedExcavators.map((equipment) => (
                      <div
                        key={equipment.id}
                        className={cn(
                          "rounded-lg border p-4 transition-all",
                          activeEquipment === equipment.id
                            ? "border-blue-500 bg-white ring-2 ring-blue-500/20"
                            : "border-blue-200 bg-white",
                        )}
                        onClick={() => setActiveEquipment(equipment.id)}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <Label className="font-medium">
                            {equipment.name}
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveEquipment(equipment.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="grid gap-2">
                          <Textarea
                            placeholder="Въведете заявка за ремонт..."
                            value={equipmentInputs[equipment.id]?.content ?? ""}
                            onChange={(e) =>
                              handleInputChange(
                                equipment.id,
                                "content",
                                e.target.value,
                              )
                            }
                            rows={2}
                          />
                          <Input
                            placeholder="Въведете заявка, която да не се записва..."
                            value={equipmentInputs[equipment.id]?.notes ?? ""}
                            onChange={(e) =>
                              handleInputChange(
                                equipment.id,
                                "notes",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Drills */}
              {selectedDrills.length > 0 && (
                <Card className="border-gray-300 bg-gray-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-800">
                      Сонди{" "}
                      <span className="text-sm font-normal text-red-500">
                        (За нова заявка се слага разделител ;)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedDrills.map((equipment) => (
                      <div
                        key={equipment.id}
                        className={cn(
                          "rounded-lg border p-4 transition-all",
                          activeEquipment === equipment.id
                            ? "border-gray-500 bg-white ring-2 ring-gray-500/20"
                            : "border-gray-200 bg-white",
                        )}
                        onClick={() => setActiveEquipment(equipment.id)}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <Label className="font-medium">
                            {equipment.name}
                          </Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveEquipment(equipment.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="grid gap-2">
                          <Textarea
                            placeholder="Въведете заявка за ремонт..."
                            value={equipmentInputs[equipment.id]?.content ?? ""}
                            onChange={(e) =>
                              handleInputChange(
                                equipment.id,
                                "content",
                                e.target.value,
                              )
                            }
                            rows={2}
                          />
                          <Input
                            placeholder="Въведете сондажи и тип на сондажното поле..."
                            value={equipmentInputs[equipment.id]?.holes ?? ""}
                            onChange={(e) =>
                              handleInputChange(
                                equipment.id,
                                "holes",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            placeholder="Въведете заявка, която да не се записва..."
                            value={equipmentInputs[equipment.id]?.notes ?? ""}
                            onChange={(e) =>
                              handleInputChange(
                                equipment.id,
                                "notes",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Other */}
              {selectedOther.length > 0 && (
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-800">
                      Други{" "}
                      <span className="text-sm font-normal text-red-500">
                        (Свободен текст на заявката описваща за коя машина се
                        отнася!)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOther.map((equipment) => (
                      <div
                        key={equipment.id}
                        className={cn(
                          "rounded-lg border p-4 transition-all",
                          activeEquipment === equipment.id
                            ? "border-green-500 bg-white ring-2 ring-green-500/20"
                            : "border-green-200 bg-white",
                        )}
                        onClick={() => setActiveEquipment(equipment.id)}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <Label className="font-medium">Други</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveEquipment(equipment.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Въведете свободен текст за заявката..."
                          value={equipmentInputs[equipment.id]?.content ?? ""}
                          onChange={(e) =>
                            handleInputChange(
                              equipment.id,
                              "content",
                              e.target.value,
                            )
                          }
                          rows={3}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Repair Reasons */}
        {selectedEquipment.length > 0 &&
          (selectedExcavators.length > 0 || selectedDrills.length > 0) && (
            <div className="lg:col-span-1">
              <RepairReasonsPanel
                activeEquipment={getActiveEquipmentData()}
                onReasonSelect={handleReasonSelect}
              />
            </div>
          )}
      </div>
    </div>
  );
}
