"use client";

import { format } from "date-fns";
import { bg } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  planGasSchema,
  type PlanGasDataType,
  PLAN_GASES,
} from "@/schemas/blastingPlanGas.schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { useState, useMemo, useEffect } from "react";
import { TimeInput } from "@/components/ui/time-input";
import { toast } from "sonner";
import type { GasMeasurement } from "@/server/repositories/pvr";
import { api } from "@/trpc/react";

export function PlanGasForm({
  measurementsToupdate,
}: {
  measurementsToupdate?: GasMeasurement[];
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: references } = api.pvr.gas.getReferences.useQuery();
  const { data: details } = api.pvr.gas.getSamplerDetails.useQuery();

  const utils = api.useUtils();
  const { mutateAsync: createGasMeasurement, isPending: isCreating } =
    api.pvr.gas.create.useMutation({
      onSuccess: () => {
        toast.success("Успех", {
          description: "Измерванията на газове са успешно записани.",
        });
        utils.pvr.gas.getAll.invalidate();
        handleReset();
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message ||
            "Възникна грешка при записване на измерванията. Опитайте отново.",
        });
      },
    });

  const { mutateAsync: updateGasMeasurements, isPending: isUpdating } =
    api.pvr.gas.update.useMutation({
      onSuccess: () => {
        toast.success("Успех", {
          description: "Измерванията на газове са успешно обновени.",
        });
        utils.pvr.gas.getAll.invalidate();
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message ||
            "Възникна грешка при обновяване на измерванията. Опитайте отново.",
        });
      },
    });

  const isSubmitting = isCreating || isUpdating;
  const isEditMode = !!measurementsToupdate && measurementsToupdate.length > 0;

  // Initialize form with default values
  const getDefaultValues = (): PlanGasDataType => {
    if (isEditMode && measurementsToupdate && measurementsToupdate.length > 0) {
      // Extract date and time from first measurement (all should have same date/time)
      const firstMeasurement = measurementsToupdate[0];
      const measuredOnDate =
        firstMeasurement && firstMeasurement.MeasuredOn
          ? new Date(firstMeasurement.MeasuredOn)
          : new Date();

      // Create a map of GasID to measurement for efficient lookup
      const measurementMap = new Map<number, GasMeasurement>();
      measurementsToupdate.forEach((m) => {
        measurementMap.set(m.GasID, m);
      });

      // Build measurements array matching the form structure
      const measurements = references
        ? [...references]
            .sort((a, b) => a.GasId - b.GasId)
            .map((ref) => {
              const existingMeasurement = measurementMap.get(ref.GasId);
              return {
                GasID: ref.GasId,
                gasName: ref.gasName || "",
                gasType: ref.gasType || "",
                Dimension: ref.Dimension || "",
                GasValue: existingMeasurement?.GasValue ?? 0,
              };
            })
        : PLAN_GASES;

      return {
        MeasuredDateOn: measuredOnDate,
        MeasuredTimeOn:
          firstMeasurement && firstMeasurement.MeasuredOn
            ? format(measuredOnDate, "HH:mm")
            : format(new Date(), "HH:mm"),
        Horizont:
          (firstMeasurement && firstMeasurement.Horizont?.toString()) || "",
        MeasuredFrom: (firstMeasurement && firstMeasurement.MeasuredFrom) || "",
        MeasuredDuty: (firstMeasurement && firstMeasurement.MeasuredDuty) || "",
        measurements:
          measurements.length === 6
            ? (measurements as PlanGasDataType["measurements"])
            : (PLAN_GASES.map((g) => ({
                ...g,
                GasValue: 0,
              })) as PlanGasDataType["measurements"]),
      };
    }

    // Default values for new measurement
    return {
      MeasuredDateOn: date ? new Date(date) : new Date(),
      MeasuredTimeOn: format(new Date(), "HH:mm"),
      Horizont: "",
      MeasuredFrom: "",
      MeasuredDuty: "",
      measurements: PLAN_GASES.map((g) => ({ ...g, GasValue: 0 })),
    };
  };

  const form = useForm<PlanGasDataType>({
    resolver: zodResolver(planGasSchema),
    mode: "onChange",
    defaultValues: getDefaultValues(),
  });

  // Update form when measurementsToupdate or references change
  useEffect(() => {
    if (
      isEditMode &&
      measurementsToupdate &&
      measurementsToupdate.length > 0 &&
      references
    ) {
      const defaultValues = getDefaultValues();
      form.reset(defaultValues);
      if (defaultValues.MeasuredDateOn) {
        setDate(defaultValues.MeasuredDateOn);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurementsToupdate, references, isEditMode]);

  const handleFormSubmit = async (data: PlanGasDataType) => {
    try {
      const measuredOn = `${format(data.MeasuredDateOn, "yyyy-MM-dd")} ${
        data.MeasuredTimeOn
      }`;

      if (
        isEditMode &&
        measurementsToupdate &&
        measurementsToupdate.length > 0
      ) {
        // Update existing measurements
        const oldMeasuredOn = measurementsToupdate[0]?.MeasuredOn || "";

        const transformedData = data.measurements.map((measurement) => {
          // Find the original measurement to preserve other fields
          const originalMeasurement =
            measurementsToupdate.find((m) => m.GasID === measurement.GasID) ||
            measurementsToupdate[0];

          return {
            GasID: measurement.GasID,
            GasValue: measurement.GasValue,
            MeasuredFrom: data.MeasuredFrom,
            MeasuredDuty: data.MeasuredDuty,
            MeasuredOn: measuredOn,
            Horizont: Number(data.Horizont),
            lrdFrom: originalMeasurement?.lrdFrom || "",
            OldMeasuredOn: oldMeasuredOn,
          };
        });

        await updateGasMeasurements(transformedData);
      } else {
        // Create new measurements
        const transformedData = data.measurements.map((measurement) => ({
          GasID: measurement.GasID,
          GasValue: measurement.GasValue,
          MeasuredFrom: data.MeasuredFrom,
          MeasuredDuty: data.MeasuredDuty,
          MeasuredOn: measuredOn,
          Horizont: Number(data.Horizont),
          lrdFrom: null,
        }));

        await createGasMeasurement(transformedData);
      }
    } catch (error) {
      console.error("Error submitting measurement:", error);
    }
  };

  const handleReset = () => {
    setDate(new Date());
    form.reset(getDefaultValues());
  };

  // Create a map of GasID to measurement index for efficient lookup
  const gasIdToIndexMap = useMemo(() => {
    const measurements = form.getValues("measurements");
    const map = new Map<number, number>();
    measurements.forEach((measurement, index) => {
      map.set(measurement.GasID, index);
    });
    return map;
  }, [form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditMode
            ? "Редакция на измерване на газове"
            : "Ново измерване на газове"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            {/* Date and Time Selection, Horizont */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="MeasuredDateOn"
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
                          selected={field.value ? new Date(field.value) : date}
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              setDate(selectedDate);
                              field.onChange(selectedDate);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="MeasuredTimeOn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Час <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <TimeInput
                        placeholder="00:00"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Horizont"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Хоризонт <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Въведете хоризонт"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Gas Measurements Table */}
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-700">
                        Химичен агент във въздуха
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-700">
                        Работа 8 часа
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-700">
                        Работа 7 часа
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-700">
                        Работа 6 часа
                      </th>
                      <th className="border border-gray-300 bg-red-50 px-3 py-2 text-left dark:border-gray-700 dark:bg-red-950">
                        <strong>Аларма 1</strong>
                        <br />
                        Работа 5 часа
                      </th>
                      <th className="border border-gray-300 bg-red-50 px-3 py-2 text-left dark:border-gray-700 dark:bg-red-950">
                        <strong>Аларма 2</strong>
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-700">
                        Дименсия
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left dark:border-gray-700">
                        Замер
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {references &&
                      [...references]
                        .sort((a, b) => a.GasId - b.GasId)
                        .map((reference) => {
                          // Find the correct measurement index by matching GasID
                          const measurementIndex = gasIdToIndexMap.get(
                            reference.GasId,
                          );

                          // Fallback if not found (shouldn't happen, but safety check)
                          if (measurementIndex === undefined) {
                            return null;
                          }

                          return (
                            <tr
                              key={reference.GasId}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              <FormField
                                control={form.control}
                                name={`measurements.${measurementIndex}.GasID`}
                                render={() => <></>}
                              />
                              <td className="border border-gray-300 px-3 py-2 dark:border-gray-700">
                                <FormField
                                  control={form.control}
                                  name={`measurements.${measurementIndex}.gasName`}
                                  render={() => (
                                    <FormItem>
                                      <FormControl>
                                        <span>{reference.gasName}</span>
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`measurements.${measurementIndex}.gasType`}
                                  render={() => (
                                    <FormItem>
                                      <FormControl>
                                        <span>{reference.gasType}</span>
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </td>

                              <td className="border border-gray-300 px-3 py-2 dark:border-gray-700">
                                {reference.work8 || "-"}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 dark:border-gray-700">
                                {reference.work7 || "-"}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 dark:border-gray-700">
                                {reference.work6 || "-"}
                              </td>
                              <td className="border border-gray-300 bg-red-50 px-3 py-2 dark:border-gray-700 dark:bg-red-950">
                                {reference.work5 || "-"}
                              </td>
                              <td className="border border-gray-300 bg-red-50 px-3 py-2 dark:border-gray-700 dark:bg-red-950">
                                {reference.work2 || "-"}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 dark:border-gray-700">
                                <FormField
                                  control={form.control}
                                  name={`measurements.${measurementIndex}.Dimension`}
                                  render={() => (
                                    <FormItem>
                                      <FormControl>
                                        <span>{reference.Dimension}</span>
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </td>
                              <td className="border border-gray-300 px-3 py-2 dark:border-gray-700">
                                <FormField
                                  control={form.control}
                                  name={`measurements.${measurementIndex}.GasValue`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          step="0.01"
                                          placeholder="0.00"
                                          className="w-20"
                                          value={field.value ?? ""}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value) || 0,
                                            )
                                          }
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="MeasuredFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Взел пробата / Име, Фамилия{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Въведете Име, Фамилия"
                        {...field}
                        list="sampler-names"
                      />
                    </FormControl>
                    <datalist id="sampler-names">
                      {details?.names &&
                        details.names.map((name, index) => (
                          <option key={index} value={name} />
                        ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="MeasuredDuty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Длъжност <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Въведете Длъжност"
                        {...field}
                        list="sampler-duties"
                      />
                    </FormControl>
                    <datalist id="sampler-duties">
                      {details?.duties &&
                        details.duties.map((duty, index) => (
                          <option key={index} value={duty} />
                        ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit and Reset Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Изчисти
              </Button>
              <Button type="submit" variant="ell" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? "Обновяване..."
                    : "Записване..."
                  : isEditMode
                    ? "Обнови"
                    : "Запиши"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
