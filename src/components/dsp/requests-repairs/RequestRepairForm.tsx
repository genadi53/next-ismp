"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import { cn } from "@/lib/cn";
import { z } from "zod";
import { DRILLS_TYPES, SHOVELS, LOADERS } from "@/lib/constants";
import { api } from "@/trpc/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";

const requestRepairFormSchema = z.object({
  RequestDate: z.date({ required_error: "Въведете дата" }),
  repairRequests: z.array(
    z.object({
      Equipment: z.string(),
      EquipmentType: z.string(),
      RequestRemont: z.string().optional(),
      DrillHoles_type: z.string().optional(),
    }),
  ),
});

type RequestRepairFormData = z.infer<typeof requestRepairFormSchema>;

const EquipmentTypeMapper = {
  excav: "1",
  drill: "2",
  other: "3",
};

type RequestState = {
  name: string;
  text: string;
  id: number;
};

export function RequestRepairForm() {
  const utils = api.useUtils();
  const { mutateAsync: createRepairRequest, isPending } =
    api.dispatcher.repairs.createRequests.useMutation({
      onSuccess: () => {
        toast({
          title: "Успех",
          description: "Заявката е успешно записана.",
        });
        void utils.dispatcher.repairs.getRequests.invalidate();
        form.reset();
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          description:
            error.message ||
            "Възникна грешка при записване на заявката. Опитайте отново.",
          variant: "destructive",
        });
      },
    });

  const { data: excavatorReasons } =
    api.dispatcher.repairs.getExcavatorReasons.useQuery();
  const { data: drillReasons } =
    api.dispatcher.repairs.getDrillReasons.useQuery();

  const form = useForm<RequestRepairFormData>({
    resolver: zodResolver(requestRepairFormSchema),
    defaultValues: {
      RequestDate: new Date(),
      repairRequests: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "repairRequests",
    rules: {
      minLength: 0,
    },
  });

  const [searchReasonExcav, setSearchExcavReason] = useState<string>("");
  const [reasonsExcav, setReasonsExcav] = useState<string[] | undefined>(
    undefined,
  );

  const [searchReasonDrill, setSearchDrillReason] = useState<string>("");
  const [reasonsDrill, setReasonsDrill] = useState<string[] | undefined>(
    undefined,
  );

  useEffect(() => {
    if (excavatorReasons) {
      setReasonsExcav(excavatorReasons);
    }
  }, [excavatorReasons]);

  useEffect(() => {
    if (drillReasons) {
      setReasonsDrill(drillReasons);
    }
  }, [drillReasons]);

  const [excav, setExcav] = useState<RequestState>({
    name: "",
    text: "",
    id: 0,
  });
  const [drill, setDrill] = useState<RequestState>({
    name: "",
    text: "",
    id: 0,
  });

  async function onSubmit(values: RequestRepairFormData) {
    try {
      await createRepairRequest(
        values.repairRequests.map((repairReq) => ({
          Equipment: repairReq.Equipment,
          EquipmentType: repairReq.EquipmentType,
          RequestDate: format(values.RequestDate, "yyyy-MM-dd"),
          RequestRemont: repairReq.RequestRemont ?? null,
          DrillHoles_type: repairReq.DrillHoles_type ?? null,
        })),
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Error is handled by mutation onError
    }
  }

  return (
    <div className="rounded-xl p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Date Selection */}
          <div className="">
            <FormField
              control={form.control}
              name="RequestDate"
              render={({ field }) => (
                <FormItem className="max-w-xl">
                  <FormLabel>Дата на заявката *</FormLabel>
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
                            ? format(field.value, "yyyy-MM-dd", { locale: bg })
                            : "Изберете дата"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={bg}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Select badges on top */}
          <div className="mt-4 flex flex-row">
            <div className="flex w-1/2 flex-col gap-2">
              <h2>Багери</h2>
              <div className="flex h-fit w-full flex-row flex-wrap items-start gap-1">
                {[...SHOVELS, ...LOADERS].map((shovel) => (
                  <div
                    key={shovel}
                    className="flex flex-row items-center gap-2"
                  >
                    <Badge
                      variant="default"
                      className="bg-primary p-2 text-white"
                    >
                      <Checkbox
                        className="bg-white"
                        id={shovel}
                        checked={fields.some(
                          (field) => field.Equipment === shovel,
                        )}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            append(
                              {
                                Equipment: shovel,
                                DrillHoles_type: "",
                                EquipmentType: EquipmentTypeMapper.excav,
                                RequestRemont: "",
                              },
                              { shouldFocus: false },
                            );
                            setExcav((prevExcav) => {
                              return prevExcav.name === ""
                                ? { ...prevExcav, name: shovel }
                                : prevExcav;
                            });
                          } else {
                            const fieldIndex = fields.findIndex(
                              (field) => field.Equipment === shovel,
                            );
                            if (fieldIndex !== -1) {
                              remove(fieldIndex);
                            }
                          }
                        }}
                      />
                      <Label htmlFor={shovel} className="cursor-pointer">
                        {shovel}
                      </Label>
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex w-1/2 flex-col gap-2">
              <h2>Сонди</h2>
              <div className="flex h-fit w-full flex-row flex-wrap items-start gap-1">
                {DRILLS_TYPES.map((drill) => (
                  <div key={drill} className="flex flex-row items-center gap-2">
                    <Badge
                      variant="default"
                      className="bg-emerald-600 p-2 text-white"
                    >
                      <Checkbox
                        className="bg-white"
                        id={drill}
                        checked={fields.some(
                          (field) => field.Equipment === drill,
                        )}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            append(
                              {
                                Equipment: drill,
                                DrillHoles_type: "",
                                EquipmentType: EquipmentTypeMapper.drill,
                                RequestRemont: "",
                              },
                              { shouldFocus: false },
                            );

                            setDrill((prevDrill) => {
                              return prevDrill.name === ""
                                ? { ...prevDrill, name: drill }
                                : prevDrill;
                            });
                          } else {
                            const fieldIndex = fields.findIndex(
                              (field) => field.Equipment === drill,
                            );
                            if (fieldIndex !== -1) {
                              remove(fieldIndex);
                            }
                          }
                        }}
                      />
                      <Label htmlFor={drill} className="cursor-pointer">
                        {drill}
                      </Label>
                    </Badge>
                  </div>
                ))}
                <div className="flex flex-row items-center gap-2">
                  <Badge
                    variant="default"
                    className="bg-gray-700 p-2 text-white"
                  >
                    <Checkbox
                      className="bg-white"
                      id={"others"}
                      checked={fields.some(
                        (field) => field.Equipment === "ДРУГИ",
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          append(
                            {
                              Equipment: "ДРУГИ",
                              DrillHoles_type: "",
                              EquipmentType: EquipmentTypeMapper.other,
                              RequestRemont: "",
                            },
                            { shouldFocus: false },
                          );
                        } else {
                          const fieldIndex = fields.findIndex(
                            (field) => field.Equipment === "ДРУГИ",
                          );
                          if (fieldIndex !== -1) {
                            remove(fieldIndex);
                          }
                        }
                      }}
                    />
                    <Label htmlFor={"others"} className="cursor-pointer">
                      {"ДРУГИ"}
                    </Label>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Content area with left selections and right scrollable suggestions */}
          {(() => {
            const hasExcav = fields.some(
              (f) => f.EquipmentType === EquipmentTypeMapper.excav,
            );
            const hasDrill = fields.some(
              (f) => f.EquipmentType === EquipmentTypeMapper.drill,
            );
            const hasOther = fields.some(
              (f) => f.EquipmentType === EquipmentTypeMapper.other,
            );
            const hasAnySelected = fields.length > 0;
            return (
              <div className="relative mt-4 flex w-full flex-col gap-4 md:flex-row">
                {hasAnySelected && (
                  <div className="flex min-w-0 flex-1 flex-col gap-8">
                    {/* Excavs */}
                    {hasExcav && (
                      <div className="flex flex-col gap-2">
                        {fields
                          .filter(
                            (f) =>
                              f.EquipmentType === EquipmentTypeMapper.excav,
                          )
                          .map((field) => {
                            const field_id = fields.indexOf(field);
                            return (
                              <Card
                                onClick={() => {
                                  setExcav({
                                    name: field.Equipment,
                                    text: field.RequestRemont ?? "",
                                    id: field_id,
                                  });
                                }}
                                key={field.id}
                                className={cn(
                                  "cursor-pointer py-2",
                                  excav.name === field.Equipment
                                    ? "border-primary border-2"
                                    : "",
                                )}
                              >
                                <CardContent className="px-2">
                                  <div className="flex flex-row gap-2">
                                    <div className="flex w-[30px] items-center justify-center">
                                      <Label>{field.Equipment}</Label>
                                    </div>
                                    <div className="w-full">
                                      <FormField
                                        control={form.control}
                                        name={`repairRequests.${field_id}.RequestRemont`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <Textarea
                                                placeholder="Въведете заявка за ремонт..."
                                                className="resize-none"
                                                rows={4}
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    )}

                    {/* Drills */}
                    {hasDrill && (
                      <div className="flex flex-col gap-2">
                        {fields
                          .filter(
                            (f) =>
                              f.EquipmentType === EquipmentTypeMapper.drill,
                          )
                          .map((field) => {
                            const field_id = fields.indexOf(field);
                            return (
                              <Card
                                onClick={() => {
                                  setDrill({
                                    name: field.Equipment,
                                    text: field.RequestRemont ?? "",
                                    id: field_id,
                                  });
                                }}
                                key={field.id}
                                className={cn(
                                  "cursor-pointer py-2",
                                  drill.name === field.Equipment
                                    ? "border-2 border-emerald-600"
                                    : "",
                                )}
                              >
                                <CardContent className="px-2">
                                  <div className="flex flex-row gap-2">
                                    <div className="flex w-[30px] items-center justify-center">
                                      <Label>{field.Equipment}</Label>
                                    </div>
                                    <div className="w-full">
                                      <FormField
                                        control={form.control}
                                        name={`repairRequests.${field_id}.RequestRemont`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <Textarea
                                                placeholder="Въведете заявка за ремонт..."
                                                className="resize-none"
                                                rows={4}
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      {/* Drill Holes (only for drills) */}
                                      <FormField
                                        control={form.control}
                                        name={`repairRequests.${field_id}.DrillHoles_type`}
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormControl>
                                              <Input
                                                placeholder="Въведете сондажи  и тип на сондажното поле"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    )}

                    {/* Others */}
                    {hasOther && (
                      <div className="col-span-4">
                        {fields
                          .filter(
                            (f) =>
                              f.EquipmentType === EquipmentTypeMapper.other,
                          )
                          .map((field) => (
                            <Card key={field.id} className="py-2">
                              <CardContent className="px-2">
                                <div className="flex flex-row gap-2">
                                  <div className="flex w-[40px] items-center justify-center">
                                    <Label>{field.Equipment}</Label>
                                  </div>
                                  <div className="w-full">
                                    <FormField
                                      control={form.control}
                                      name={`repairRequests.${fields.indexOf(
                                        field,
                                      )}.RequestRemont`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Textarea
                                              placeholder="Въведете заявка за ремонт..."
                                              className="resize-none"
                                              rows={4}
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Right sidebar with scrollable areas */}
                {hasAnySelected && (
                  <div
                    className={cn(
                      "sticky top-16 z-10 flex max-h-[650px] flex-col gap-4",
                      hasAnySelected ? "w-full md:w-[35%]" : "w-full",
                    )}
                  >
                    {/* Excavator suggestions */}
                    {hasExcav && (
                      <>
                        <div
                          id="excavator-reasons-search"
                          className="rounded-lg border-blue-300 bg-blue-100 p-2 text-blue-800"
                        >
                          <p>Заявки за Багер</p>
                          <p>
                            (
                            <span className="text-semibold text-red-500">
                              Двоен клик на мишка
                            </span>
                            ) за добавяне на заявка
                          </p>
                          <Input
                            className="mt-1 bg-white"
                            value={searchReasonExcav}
                            placeholder="Търси..."
                            onChange={(e) => {
                              e.preventDefault();
                              setSearchExcavReason(e.target.value);
                              setReasonsExcav(() => {
                                return excavatorReasons?.filter(
                                  (reason: string) =>
                                    reason
                                      .toLowerCase()
                                      .includes(e.target.value.toLowerCase()),
                                );
                              });
                            }}
                          />
                        </div>
                        {reasonsExcav && (
                          <ScrollArea className="h-full min-h-[220px] w-full rounded-md border p-4">
                            {reasonsExcav.map((reason, idx) => (
                              <div
                                key={idx}
                                className="cursor-pointer hover:bg-blue-400/60"
                                onDoubleClick={(e) => {
                                  const currentText = form.getValues(
                                    `repairRequests.${excav.id}.RequestRemont`,
                                  );
                                  form.setValue(
                                    `repairRequests.${excav.id}.RequestRemont`,
                                    currentText
                                      ? `${currentText};${
                                          (e.target as HTMLDivElement).innerText
                                        }`
                                      : `${
                                          (e.target as HTMLDivElement).innerText
                                        }`,
                                  );
                                }}
                              >
                                {reason}
                              </div>
                            ))}
                          </ScrollArea>
                        )}
                      </>
                    )}

                    {/* Drill suggestions */}
                    {hasDrill && (
                      <>
                        <div className="rounded-lg border-blue-300 bg-blue-100 p-2 text-blue-800">
                          <p>Заявки за Сонди</p>
                          <p>
                            (
                            <span className="text-semibold text-red-500">
                              Двоен клик на мишка
                            </span>
                            ) за добавяне на заявка
                          </p>
                          <Input
                            value={searchReasonDrill}
                            placeholder="Търси..."
                            className="mt-1 bg-white"
                            onChange={(e) => {
                              e.preventDefault();
                              setSearchDrillReason(e.target.value);
                              setReasonsDrill(() => {
                                return drillReasons?.filter((reason: string) =>
                                  reason
                                    .toLowerCase()
                                    .includes(e.target.value.toLowerCase()),
                                );
                              });
                            }}
                          />
                        </div>
                        {reasonsDrill && (
                          <ScrollArea className="h-full min-h-[220px] w-full rounded-md border p-4">
                            {reasonsDrill.map((reason, idx) => (
                              <div
                                key={idx}
                                className="cursor-pointer hover:bg-blue-400/60"
                                onDoubleClick={(e) => {
                                  const currentText = form.getValues(
                                    `repairRequests.${drill.id}.RequestRemont`,
                                  );
                                  form.setValue(
                                    `repairRequests.${drill.id}.RequestRemont`,
                                    currentText
                                      ? `${currentText};${
                                          (e.target as HTMLDivElement).innerText
                                        }`
                                      : `${
                                          (e.target as HTMLDivElement).innerText
                                        }`,
                                  );
                                }}
                              >
                                {reason}
                              </div>
                            ))}
                          </ScrollArea>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          <div className="col-span-2 col-start-5 row-start-4">
            <div className="flex w-lg flex-row items-center gap-4">
              <Button
                className="w-24"
                variant="outline"
                type="reset"
                disabled={isPending}
                onClick={(e) => {
                  e.preventDefault();
                  form.reset();
                }}
              >
                Изчисти
              </Button>

              <Button
                className="w-24"
                type="submit"
                disabled={!form.formState.isValid || isPending}
              >
                {isPending ? "Записване..." : "Запиши"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
