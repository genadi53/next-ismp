"use client";

import {
  blastingRapportSchema,
  type BlastinReportFormData,
  FieldConditions,
  PercentValues,
  SMOKE_PRESENCE_OPTIONS,
  SCATTERING_OPTIONS,
  STATE_BLAST_MATERIAL_OPTIONS,
  PRESENCE_NEGABARIT_OPTIONS,
  STATE_BLAST_SITE_AFTER_OPTIONS,
  type SmokePresence,
  type StateBlastMaterial,
  type StateBlastSiteAfter,
  type Initiate,
} from "@/schemas/blastingRapport.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { format } from "date-fns";
import { CalendarIcon, Save, RotateCcw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/toast";
import type { CreateBlastReportInput } from "@/server/repositories/pvr";

const toOneString = (strArray: string[]) => {
  return strArray.reduce(
    (result, str, idx) =>
      idx === 0 ? result.concat(`${str}`) : result.concat(`;${str}`),
    "",
  );
};

const getDefaultFormValues = (): BlastinReportFormData => ({
  ShiftDate: new Date(),
  VP_num: 0,
  Horiz: 0,
  site_conditon: "",
  quality_do_1m: -1,
  quality_nad_1m: -1,
  quality_zone_prosip: -1,
  water_presence_drilling: -1,
  water_presence_fueling: -1,
  ANFO: -1,
  E1100: -1,
  E3400: -1,
  non_retaining: -1,
  quality_explosive: "",
  quality_zatapka: -1,
  smoke_presence: [] as SmokePresence[],
  scattering: "",
  presence_negabarit: "",
  state_blast_material: [] as StateBlastMaterial[],
  state_blast_site_after: [] as StateBlastSiteAfter[],
  non_blasted_num: -1,
  Initiate: "",
});

export function BlastingRapportForm() {
  const utils = api.useUtils();
  const { mutateAsync: createRapport, isPending: isCreating } =
    api.pvr.raport.create.useMutation({
      onSuccess: () => {
        toast({
          title: "Успех",
          description: "Рапортът е успешно създаден.",
        });
        utils.pvr.raport.getAll.invalidate();
        form.reset(getDefaultFormValues());
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          variant: "destructive",
          description:
            error.message ||
            "Възникна грешка при създаване на записа. Опитайте отново, или се обадете на администратор.",
        });
      },
    });


  const form = useForm<BlastinReportFormData>({
    resolver: zodResolver(blastingRapportSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: getDefaultFormValues(),
  });

  const onSubmit = async (data: BlastinReportFormData) => {
    try {
      // Transform the form data to match the backend API expectations
      const transformedData = {
        ShiftDate: data.ShiftDate.toISOString().split("T")[0],
        VP_num: data.VP_num.toString(),
        Horiz: data.Horiz.toString(),
        site_conditon: data.site_conditon,
        quality_do_1m: data.quality_do_1m.toString(),
        quality_nad_1m: data.quality_nad_1m.toString(),
        quality_zone_prosip: data.quality_zone_prosip.toString(),
        water_presence_drilling: data.water_presence_drilling.toString(),
        water_presence_fueling: data.water_presence_fueling.toString(),
        E3400: data.E3400,
        ANFO: data.ANFO,
        E1100: data.E1100,
        non_retaining: data.non_retaining,
        quality_explosive: data.quality_explosive,
        quality_zatapka: data.quality_zatapka.toString(),
        smoke_presence: toOneString(data.smoke_presence),
        scattering: data.scattering,
        presence_negabarit: data.presence_negabarit,
        state_blast_material: toOneString(data.state_blast_material),
        state_blast_site_after: toOneString(data.state_blast_site_after),
        non_blasted_num: data.non_blasted_num,
        Initiate: data.Initiate,
        CreatedFrom: null,
        EditedFrom: null,
      };

      await createRapport(transformedData as CreateBlastReportInput);
    } catch (error) {
      console.error("Error creating rapport:", error);
    }
  };

  // Watch fueling values for validation
  const ANFO = form.watch("ANFO");
  const E1100 = form.watch("E1100");
  const E3400 = form.watch("E3400");

  // Trigger validation when fueling values change
  React.useEffect(() => {
    // Only validate if at least one field has a valid value (not -1 or undefined)
    if (
      (ANFO !== undefined && ANFO !== -1) ||
      (E1100 !== undefined && E1100 !== -1) ||
      (E3400 !== undefined && E3400 !== -1)
    ) {
      form.trigger(["ANFO", "E1100", "E3400"]);
    }
  }, [ANFO, E1100, E3400, form]);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Формуляр за рапорт</CardTitle>
        <CardDescription>
          Попълнете всички полета за създаване на рапорт
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
              {/* LEFT SIDE */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                  <FormField
                    control={form.control}
                    name="ShiftDate"
                    render={({ field }) => (
                      <FormItem className="col-span-1 flex flex-col lg:col-span-2">
                        <FormLabel>За Дата</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full min-w-0 pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>dd/mm/yyyy</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("1900-01-01")}
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="VP_num"
                    render={({ field }) => (
                      <FormItem className="col-span-1 lg:col-span-2">
                        <FormLabel>ВП №</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full min-w-0"
                            type="number"
                            placeholder="Номер ВП"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Horiz"
                    render={({ field }) => (
                      <FormItem className="col-span-1 lg:col-span-2">
                        <FormLabel>Хоризонт</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full min-w-0"
                            type="number"
                            placeholder="Номер на Хоризонт"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Site Condition */}
                <div>
                  <h4 className="col-span-1 mb-4 text-lg font-semibold text-slate-900 lg:col-span-6 dark:text-slate-100">
                    Състояние на площадката
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-6">
                    <FormField
                      control={form.control}
                      name="site_conditon"
                      render={({ field }) => (
                        <FormItem className="col-span-1 lg:col-span-3">
                          <FormLabel>Състояние на площадката</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full min-w-0">
                                <SelectValue placeholder="Моля изберете" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {FieldConditions.map((condition) => (
                                <SelectItem key={condition} value={condition}>
                                  {condition}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Drilling Quality */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Качество на сондиране
                  </h4>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                    <FormField
                      control={form.control}
                      name="quality_do_1m"
                      render={({ field }) => (
                        <FormItem className="col-span-1 lg:col-span-2">
                          <FormLabel>Сондажи с разбито устие до 1 m</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={
                              field.value === -1 ? "" : field.value?.toString()
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="w-full min-w-0">
                                <SelectValue placeholder="Моля изберете" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(PercentValues).map(
                                ([label, value]) => (
                                  <SelectItem
                                    key={value}
                                    value={value.toString()}
                                  >
                                    {label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quality_nad_1m"
                      render={({ field }) => (
                        <FormItem className="col-span-1 lg:col-span-2">
                          <FormLabel>Сондажи с разбито устие над 1 m</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={
                              field.value === -1 ? "" : field.value?.toString()
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="w-full min-w-0">
                                <SelectValue placeholder="Моля изберете" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(PercentValues).map(
                                ([label, value]) => (
                                  <SelectItem
                                    key={value}
                                    value={value.toString()}
                                  >
                                    {label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quality_zone_prosip"
                      render={({ field }) => (
                        <FormItem className="col-span-1 lg:col-span-2">
                          <FormLabel>Сондажи със зони на пропадане</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={
                              field.value === -1 ? "" : field.value?.toString()
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="w-full min-w-0">
                                <SelectValue placeholder="Моля изберете" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(PercentValues).map(
                                ([label, value]) => (
                                  <SelectItem
                                    key={value}
                                    value={value.toString()}
                                  >
                                    {label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Water Presence */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Наличие на вода в сондажите
                  </h4>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                    <FormField
                      control={form.control}
                      name="water_presence_drilling"
                      render={({ field }) => (
                        <FormItem className="col-span-1 lg:col-span-3">
                          <FormLabel>По време на сондиране</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={
                              field.value === -1 ? "" : field.value?.toString()
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="w-full min-w-0">
                                <SelectValue placeholder="Моля изберете" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(PercentValues).map(
                                ([label, value]) => (
                                  <SelectItem
                                    key={value}
                                    value={value.toString()}
                                  >
                                    {label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="water_presence_fueling"
                      render={({ field }) => (
                        <FormItem className="col-span-1 lg:col-span-3">
                          <FormLabel>По време на зареждане</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={
                              field.value === -1 ? "" : field.value?.toString()
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="w-full min-w-0">
                                <SelectValue placeholder="Моля изберете" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(PercentValues).map(
                                ([label, value]) => (
                                  <SelectItem
                                    key={value}
                                    value={value.toString()}
                                  >
                                    {label}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Blasting */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Взривяване
                  </h4>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                    <div className="col-span-1 lg:col-span-3">
                      <FormLabel>Наличие на пушеци</FormLabel>
                      <div className="mt-2 space-y-2">
                        {SMOKE_PRESENCE_OPTIONS.map((option) => (
                          <div
                            key={option}
                            className="flex w-full items-center space-x-2"
                          >
                            <Checkbox
                              id={`smoke_${option}`}
                              checked={form
                                .watch("smoke_presence")
                                .includes(option)}
                              onCheckedChange={(checked) => {
                                const currentValues =
                                  form.watch("smoke_presence");
                                if (checked) {
                                  form.setValue("smoke_presence", [
                                    ...currentValues,
                                    option,
                                  ]);
                                } else {
                                  form.setValue(
                                    "smoke_presence",
                                    currentValues.filter(
                                      (item) => item !== option,
                                    ),
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`smoke_${option}`}
                              className="text-sm font-medium"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="scattering"
                      render={({ field }) => (
                        <FormItem className="col-span-1 self-start lg:col-span-3">
                          <FormLabel>Наличие на разлет на късове</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full min-w-0">
                                <SelectValue placeholder="Моля изберете" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SCATTERING_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Blast Field Inspection */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Оглед на взривното поле след взривяване
                  </h4>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
                    <div className="col-span-1 lg:col-span-6">
                      <FormLabel>Състояние на взривения материал</FormLabel>
                      <div className="mt-2 space-y-2">
                        {STATE_BLAST_MATERIAL_OPTIONS.map((option) => (
                          <div
                            key={option}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`material_${option}`}
                              checked={form
                                .watch("state_blast_material")
                                .includes(option)}
                              onCheckedChange={(checked) => {
                                const currentValues = form.watch(
                                  "state_blast_material",
                                );
                                if (checked) {
                                  form.setValue("state_blast_material", [
                                    ...currentValues,
                                    option,
                                  ]);
                                } else {
                                  form.setValue(
                                    "state_blast_material",
                                    currentValues.filter(
                                      (item) => item !== option,
                                    ),
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`material_${option}`}
                              className="text-sm font-medium"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="presence_negabarit"
                      render={({ field }) => (
                        <FormItem className="col-span-1 lg:col-span-6">
                          <FormLabel>Наличие на негабарити</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full min-w-0">
                                <SelectValue placeholder="Моля изберете" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PRESENCE_NEGABARIT_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="space-y-6">
                {/* Fueling */}
                <div>
                  <h4 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Зареждане
                  </h4>
                  {form.formState.errors.E3400 && (
                    <p className="mb-2 text-sm text-destructive">
                      {form.formState.errors.E3400.message}
                    </p>
                  )}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                    <div className="col-span-1 lg:col-span-2">
                      <FormField
                        control={form.control}
                        name="E3400"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>E3400</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => {
                                  field.onChange(Number(value));
                                }}
                                value={
                                  field.value === -1
                                    ? ""
                                    : field.value?.toString()
                                }
                                className="flex flex-col"
                              >
                                {Object.entries(PercentValues).map(
                                  ([label, value]) => (
                                    <FormItem
                                      key={`E3400-${value}`}
                                      className="flex items-center gap-3"
                                    >
                                      <FormControl>
                                        <RadioGroupItem
                                          value={value.toString()}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {label}
                                      </FormLabel>
                                    </FormItem>
                                  ),
                                )}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                      <FormField
                        control={form.control}
                        name="ANFO"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>АНФО</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => {
                                  field.onChange(Number(value));
                                }}
                                value={
                                  field.value === -1
                                    ? ""
                                    : field.value?.toString()
                                }
                                className="flex flex-col"
                              >
                                {Object.entries(PercentValues).map(
                                  ([label, value]) => (
                                    <FormItem
                                      key={`ANFO-${value}`}
                                      className="flex items-center gap-3"
                                    >
                                      <FormControl>
                                        <RadioGroupItem
                                          value={value.toString()}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {label}
                                      </FormLabel>
                                    </FormItem>
                                  ),
                                )}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                      <FormField
                        control={form.control}
                        name="E1100"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>E1100</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={(value) => {
                                  field.onChange(Number(value));
                                }}
                                value={
                                  field.value === -1
                                    ? ""
                                    : field.value?.toString()
                                }
                                className="flex flex-col"
                              >
                                {Object.entries(PercentValues).map(
                                  ([label, value]) => (
                                    <FormItem
                                      key={`E1100-${value}`}
                                      className="flex items-center gap-3"
                                    >
                                      <FormControl>
                                        <RadioGroupItem
                                          value={value.toString()}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {label}
                                      </FormLabel>
                                    </FormItem>
                                  ),
                                )}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                  <FormField
                    control={form.control}
                    name="non_retaining"
                    render={({ field }) => (
                      <FormItem className="col-span-1 lg:col-span-4">
                        <FormLabel>Наличие на незадържащи сондажи</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full min-w-0">
                              <SelectValue placeholder="Моля изберете" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(PercentValues).map(
                              ([label, value]) => (
                                <SelectItem
                                  key={value}
                                  value={value.toString()}
                                >
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quality_explosive"
                    render={({ field }) => (
                      <FormItem className="col-span-1 lg:col-span-4">
                        <FormLabel>Качество на използваното ВВ</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full min-w-0">
                              <SelectValue placeholder="Моля изберете" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FieldConditions.slice(0, 3).map((condition) => (
                              <SelectItem key={condition} value={condition}>
                                {condition}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quality_zatapka"
                    render={({ field }) => (
                      <FormItem className="col-span-1 lg:col-span-4">
                        <FormLabel>Правилно изпълнение на затапката</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full min-w-0">
                              <SelectValue placeholder="Моля изберете" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(PercentValues).map(
                              ([label, value]) => (
                                <SelectItem
                                  key={value}
                                  value={value.toString()}
                                >
                                  {label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                  <div className="col-span-1 lg:col-span-4">
                    <FormLabel>
                      Състояние на площадката след взривяване
                    </FormLabel>
                    <div className="mt-2 space-y-2">
                      {STATE_BLAST_SITE_AFTER_OPTIONS.map((option) => (
                        <div
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`site_after_${option}`}
                            checked={form
                              .watch("state_blast_site_after")
                              .includes(option)}
                            onCheckedChange={(checked) => {
                              const currentValues = form.watch(
                                "state_blast_site_after",
                              );
                              if (checked) {
                                form.setValue("state_blast_site_after", [
                                  ...currentValues,
                                  option,
                                ]);
                              } else {
                                form.setValue(
                                  "state_blast_site_after",
                                  currentValues.filter(
                                    (item) => item !== option,
                                  ),
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`site_after_${option}`}
                            className="text-sm font-medium"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                  <FormField
                    control={form.control}
                    name="non_blasted_num"
                    render={({ field }) => (
                      <FormItem className="col-span-1 lg:col-span-4">
                        <FormLabel>Наличие на невзривени сондажи</FormLabel>
                        <FormControl>
                          <Input
                            className="w-full min-w-0"
                            type="number"
                            placeholder="Брой Невзривени"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            value={field.value === -1 ? "" : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="Initiate"
                    render={({ field }) => (
                      <FormItem className="col-span-1 lg:col-span-4">
                        <FormLabel>Иницииране</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value as Initiate);
                            }}
                            value={field.value}
                          >
                            <div className="flex flex-row items-center gap-4">
                              <div className="flex items-center gap-3">
                                <FormControl>
                                  <RadioGroupItem value="НОНЕЛ" />
                                </FormControl>
                                <FormLabel className="font-semibold">
                                  НОНЕЛ
                                </FormLabel>
                              </div>

                              <div className="flex items-center gap-3">
                                <FormControl>
                                  <RadioGroupItem value="Електронно" />
                                </FormControl>
                                <FormLabel className="font-semibold">
                                  Електронно
                                </FormLabel>
                              </div>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="mt-8 flex justify-end gap-4 border-t pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset(getDefaultFormValues())}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Изчисти
              </Button>
              <Button
                type="submit"
                variant="ell"
                className="gap-2"
                disabled={!form.formState.isValid || isCreating}
              >
                <Save className="h-4 w-4" />
                {isCreating ? "Запазване..." : "Запази рапорт"}
              </Button>
            </div>
          </form>
        </Form>
        {form.formState.errors && (
          <div className="mt-4 text-red-500">
            {Object.values(form.formState.errors).map((error) => (
              <p key={error.message}>{error.message}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}