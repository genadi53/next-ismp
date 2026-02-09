"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { bg } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { BlastingPlan } from "@/server/repositories/pvr";
import {
  TYPE_BLAST_OPTIONS,
  DRILL_SIZES,
} from "@/server/repositories/pvr";
import {
  blastingPlanSchema,
  type BlastingPlanDataType,
} from "@/schemas/blastingPlan.schemas";
import type { DrillType } from "@/types/global.types";
import { DRILLS_TYPES } from "@/lib/constants";

interface BlastingPlanFormProps {
  editingPlan?: BlastingPlan | null;
  onSubmit: (data: BlastingPlanDataType) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BlastingPlanForm({
  editingPlan,
  onSubmit,
  onCancel,
  isLoading = false,
}: BlastingPlanFormProps) {
  // Convert date from dd.mm.yyyy (SQL format 104) to yyyy-MM-dd
  const convertDateFormat = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    try {
      // Try to parse dd.mm.yyyy format
      const parsedDate = parse(dateString, "dd.MM.yyyy", new Date());
      if (isNaN(parsedDate.getTime())) {
        // If parsing fails, try to parse as yyyy-MM-dd (already in correct format)
        const altParsed = new Date(dateString);
        if (isNaN(altParsed.getTime())) {
          return "";
        }
        return format(altParsed, "yyyy-MM-dd");
      }
      return format(parsedDate, "yyyy-MM-dd");
    } catch {
      return "";
    }
  };

  const form = useForm<BlastingPlanDataType>({
    resolver: zodResolver(blastingPlanSchema),
    defaultValues: {
      date: "",
      BlastingField: "",
      Horiz1: "",
      Horiz2: "",
      Drill: [],
      TypeBlast: "Поле",
      Holes: 0,
      Konturi: 0,
      MineVolume: 0,
      Disabled: 0,
      Note: "",
    },
  });

  const watchedTypeBlast = form.watch("TypeBlast");
  const watchedDate = form.watch("date");
  const watchedDrill = form.watch("Drill");
  const isInitializingRef = React.useRef(false);

  React.useEffect(() => {
    if (editingPlan) {
      isInitializingRef.current = true;
      form.reset({
        date: convertDateFormat(editingPlan.OperDate),
        BlastingField: editingPlan.BlastingField ?? "",
        Horiz1: editingPlan.Horizont1 ?? "",
        Horiz2: editingPlan.Horizont2 ?? "",
        Drill:
          editingPlan.Drill && typeof editingPlan.Drill === "string"
            ? editingPlan.Drill.split("_").filter(Boolean)
            : [],
        TypeBlast:
          (editingPlan.TypeBlast as
            | "Контур"
            | "Поле"
            | "Поле-Контур"
            | "Проби") ?? "Поле",
        Holes: editingPlan.Holes ?? 0,
        Konturi: editingPlan.Konturi ?? 0,
        MineVolume: editingPlan.MineVolume ?? 0,
        Disabled: editingPlan.Disabled ? 1 : 0,
        Note: editingPlan.Note ?? "",
      });
      // Reset the flag after a delay to allow the form to settle and prevent TypeBlast effect from clearing values
      setTimeout(() => {
        isInitializingRef.current = false;
      }, 100);
    } else {
      form.reset({
        date: "",
        BlastingField: "",
        Horiz1: "",
        Horiz2: "",
        Drill: [],
        TypeBlast: "Поле",
        Holes: 0,
        Konturi: 0,
        MineVolume: 0,
        Disabled: 0,
        Note: "",
      });
    }
  }, [editingPlan, form]);

  // Handle type blast change
  React.useEffect(() => {
    // Skip clearing BlastingField during initialization from editingPlan
    if (isInitializingRef.current) {
      return;
    }

    // Don't clear values if we have an editingPlan (user is editing, not creating new)
    if (editingPlan) {
      return;
    }

    if (watchedTypeBlast === "Проби" && watchedDate) {
      const probiText = `Проби за дата ${watchedDate}`;
      form.setValue("BlastingField", probiText);
      form.setValue("Note", probiText);
      form.setValue("Horiz1", "");
      form.setValue("Horiz2", "");
      form.setValue("Drill", []);
      form.setValue("Konturi", 0);
      form.setValue("MineVolume", 0);
    } else if (watchedTypeBlast !== "Проби") {
      form.setValue("BlastingField", "");
      form.setValue("Note", "");
    }
  }, [watchedTypeBlast, watchedDate, form, editingPlan]);

  const handleSubmit = async (data: BlastingPlanDataType) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const getDrillSizeInfo = () => {
    const drillInfo = watchedDrill
      .map((drill) => `${drill}(${DRILL_SIZES[drill as DrillType]}mm)`)
      .join("+");
    return drillInfo ?? "";
  };

  const addDrill = (drill: string) => {
    const currentDrills = form.getValues("Drill");
    if (!currentDrills.includes(drill as DrillType)) {
      form.setValue("Drill", [...currentDrills, drill as DrillType]);
    }
  };

  const removeDrill = (index: number) => {
    const currentDrills = form.getValues("Drill");
    form.setValue(
      "Drill",
      currentDrills.filter((_, i) => i !== index),
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    За дата <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "PPP", {
                                locale: bg,
                              })
                            : "Избери дата"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(date) =>
                          field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="BlastingField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Взривно Поле</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Въведете име на взривно поле"
                      disabled={watchedTypeBlast === "Проби"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="Horiz1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      От хоризонт <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Въведете хоризонт"
                        disabled={watchedTypeBlast === "Проби"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Horiz2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      За хоризонт <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Въведете хоризонт"
                        disabled={watchedTypeBlast === "Проби"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 items-start">
              <FormField
                control={form.control}
                name="Drill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Сонда <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex flex-col">
                      <div className="shrink-0">
                        <Select value="" onValueChange={addDrill}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Изберете сонда" />
                          </SelectTrigger>
                          <SelectContent>
                            {DRILLS_TYPES.map((drill) => (
                              <SelectItem key={drill} value={drill}>
                                {drill} {field.value.includes(drill) ? "✓" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {field.value.length > 0 &&
                          field.value.map((drill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeDrill(index)}
                            >
                              {drill} ({DRILL_SIZES[drill as DrillType]}mm) ×
                            </Badge>
                          ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="TypeBlast"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Вид поле <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPE_BLAST_OPTIONS.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="Holes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Сондажи <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Брой сондажи"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Konturi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Контури <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Контури"
                        disabled={watchedTypeBlast === "Проби"}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="MineVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Обем Минна маса <span className="text-orange-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Обем на минна маса"
                        disabled={watchedTypeBlast === "Проби"}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="Disabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Изключен</FormLabel>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="disabled-yes"
                        checked={field.value === 1}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 1 : 0)
                        }
                      />
                      <FormLabel htmlFor="disabled-yes">Да</FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="disabled-no"
                        checked={field.value === 0}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 0 : 1)
                        }
                      />
                      <FormLabel htmlFor="disabled-no">Не</FormLabel>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="Note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Забележка</FormLabel>

                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Когато сондата е една и си въвел брой сондажи не пиши нищо в полето"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Важно:</strong> Когато въвеждате колко сондажа са големи
                и колко са малки, ги въведете според сондата:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <li>• за сонди A8, A9, C4, C5 - 165mm</li>
                <li>• за сонди A7 - 142mm</li>
                <li>• за сонди SK2, SK3, SK6, A10, C11, C14 - 250mm</li>
              </ul>
              <p className="mt-2 text-sm text-yellow-800 dark:text-yellow-200">
                <strong>ПРИМЕР:</strong> ако полето е работено от сонди SK3-50
                сондажа и A9-30 сондажа, в полето забележка въвеждате:{" "}
                <strong>50(250mm)+30(165mm)</strong>
              </p>
            </div>

            {watchedDrill.length > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Информация за сондите:</strong>
                </p>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  {getDrillSizeInfo()}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            className="w-36"
            onClick={onCancel}
          >
            {editingPlan ? "Отказ" : "Изчисти"}
          </Button>
          <Button
            type="submit"
            variant="ell"
            className="w-36"
            disabled={isLoading}
          >
            {isLoading ? "Зареждане..." : editingPlan ? "Промени" : "Запиши"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
