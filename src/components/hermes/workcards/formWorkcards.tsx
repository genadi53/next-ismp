"use client";

import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import { format } from "date-fns";
import type {
  HermesWorkcard,
  CreateWorkcardInput,
} from "@/server/repositories/hermes";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo } from "react";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";
import { createWorkcardSchema } from "@/schemas/hermes.schemas";
import { Combobox } from "@/components/ui/combobox";
import { TimeInput } from "@/components/ui/time-input";

/**
 * Formats a time value from database (could be date string or HH:mm) to HH:mm format
 */
// const formatTimeValue = (timeValue: string | null | undefined): string => {
//   if (!timeValue) return "";

//   // If it's already in HH:mm format, return it
//   const hhmmPattern = /^\d{1,2}:\d{1,2}$/;
//   if (hhmmPattern.test(timeValue)) {
//     return timeValue;
//   }

//   // Try to parse as a date string and extract time
//   try {
//     const date = new Date(timeValue);
//     if (!isNaN(date.getTime())) {
//       return format(date, "HH:mm");
//     }
//   } catch {
//     // If parsing fails, return empty string
//   }

//   return "";
// };

const workcardActions = [
  { value: 1, label: "Ремонт | CRK04 (ТАТ)" },
  { value: 2, label: "Престой | CRK04 (ТАТ)" },
  { value: 3, label: "Други отсъствия | CRK04 (ТАТ)" },
  { value: 4, label: "Ремонт | CRK01 (Рудник)" },
  { value: 5, label: "Престой | CRK01 (Рудник)" },
  { value: 6, label: "Други отсъствия | CRK01 (Рудник)" },
];

type WorkcardFormProps = {
  workcardToEdit?: HermesWorkcard;
  onSuccess?: () => void;
};

export const WorkcardForm = ({
  workcardToEdit,
  onSuccess,
}: WorkcardFormProps) => {
  const { data: workcardDetails } = api.hermes.workcards.getDetails.useQuery();

  if (workcardToEdit) {
    Object.entries(workcardToEdit).map(([key, val]) => {
      const valString =
        val == null
          ? "null"
          : val instanceof Date
            ? val.toISOString()
            : typeof val === "object"
              ? JSON.stringify(val)
              : String(val);
      console.log(`${key} -> ${typeof val} -> ${valString}`);
    });
  }

  const utils = api.useUtils();

  const defaultFormValues = useMemo<CreateWorkcardInput>(
    () => ({
      Date: new Date(),
      StartTime: "",
      EndTime: "",
      OperatorId: 0,
      CodeAction: 0,
      Note: "",
      WorkingCardId: "",
      EqmtId: 0,
    }),
    [],
  );

  const createMutation = api.hermes.workcards.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Работната карта е успешно създадена.",
      });
      void utils.hermes.workcards.getAll.invalidate();
      form.reset(defaultFormValues);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description: error.message || "Възникна грешка при създаването.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = api.hermes.workcards.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Работната карта е успешно обновена.",
      });
      void utils.hermes.workcards.getAll.invalidate();
      form.reset(defaultFormValues);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description: error.message || "Възникна грешка при обновяването.",
        variant: "destructive",
      });
    },
  });

  // Compute initial form values based on workcardToEdit
  const initialFormValues = useMemo<CreateWorkcardInput>(() => {
    if (workcardToEdit) {
      return {
        Date: new Date(workcardToEdit.Date),
        StartTime:
          format(workcardToEdit.StartTime ?? new Date(), "HH:mm") ?? "",
        EndTime: format(workcardToEdit.EndTime ?? new Date(), "HH:mm") ?? "",
        OperatorId:
          workcardDetails?.operators.find((op) =>
            op.Operator.includes(`${workcardToEdit.OperatorId}`),
          )?.Id ?? 0,
        CodeAction:
          typeof workcardToEdit.CodeAction === "number"
            ? workcardToEdit.CodeAction
            : parseInt(workcardToEdit.CodeAction?.split("-")[0] ?? "0"),
        Note: workcardToEdit.Note ?? "",
        WorkingCardId: workcardToEdit.WorkingCardId ?? "",
        EqmtId: workcardToEdit.EqmtId ?? 0,
      };
    }
    return defaultFormValues;
  }, [workcardToEdit, workcardDetails?.operators, defaultFormValues]);

  const form = useForm<CreateWorkcardInput>({
    resolver: zodResolver(createWorkcardSchema),
    defaultValues: initialFormValues,
  });

  // Sync form when workcardToEdit changes (for cases when component doesn't remount)
  useEffect(() => {
    form.reset(initialFormValues);
  }, [initialFormValues, form]);

  async function onSubmit(values: CreateWorkcardInput) {
    const formattedValues = {
      ...values,
      Date: values.Date,
    } satisfies CreateWorkcardInput;

    if (workcardToEdit) {
      await updateMutation.mutateAsync({
        id: workcardToEdit.Id,
        data: formattedValues,
      });
    } else {
      await createMutation.mutateAsync(formattedValues);
    }
  }

  return (
    <div className="max-w-3xl rounded-xl p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid w-full grid-cols-1 gap-4 py-2.5 md:grid-cols-2 lg:grid-cols-4">
            <div className="w-full md:col-span-2 lg:col-span-3">
              <FormField
                control={form.control}
                name="Date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дата</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full min-w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd.MM.yyyy")
                            ) : (
                              <span>Изберете дата</span>
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full md:col-span-1 lg:col-span-2">
              <FormField
                control={form.control}
                name="StartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Начален час</FormLabel>
                    <FormControl>
                      <TimeInput
                        placeholder="00:00"
                        value={field.value ?? ""}
                        onChange={(value) => field.onChange(value ?? "")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full md:col-span-1 lg:col-span-2">
              <FormField
                control={form.control}
                name="EndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Краен час</FormLabel>
                    <FormControl>
                      <TimeInput
                        placeholder="00:00"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full md:col-span-2 lg:col-span-4">
              <FormField
                control={form.control}
                name="OperatorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Оператор</FormLabel>

                    {workcardDetails?.operators &&
                      workcardDetails?.operators.length > 0 ? (
                      <Combobox
                        list={workcardDetails.operators.map((a) => ({
                          label: a.Operator,
                          value: a.Id.toString(),
                        }))}
                        placeholderString="Изберете оператор"
                        value={
                          field.value !== null &&
                            field.value !== undefined &&
                            field.value !== 0
                            ? field.value.toString()
                            : ""
                        }
                        onValueChange={(value) =>
                          field.onChange(value ? parseInt(value) : 0)
                        }
                        triggerStyles="w-full min-w-0"
                      />
                    ) : (
                      <Input
                        type="text"
                        placeholder="Изберете оператор"
                        {...field}
                        value={field.value ?? ""}
                      />
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full md:col-span-1 lg:col-span-2">
              <FormField
                control={form.control}
                name="WorkingCardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID на работна карта</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="ID на работна карта"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value);
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full md:col-span-1 lg:col-span-2">
              <FormField
                control={form.control}
                name="CodeAction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Код на действие</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={
                        field.value !== null && field.value !== undefined
                          ? field.value.toString()
                          : ""
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full min-w-0">
                          <SelectValue placeholder="Изберете код на действие" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workcardActions.map((action) => (
                          <SelectItem
                            key={action.value}
                            value={action.value.toString()}
                          >
                            {action.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full md:col-span-2 lg:col-span-2">
              <FormField
                control={form.control}
                name="EqmtId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID на оборудване</FormLabel>

                    {workcardDetails?.equipments &&
                      workcardDetails?.equipments.length > 0 ? (
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value) || 0)
                        }
                        value={
                          field.value !== null &&
                            field.value !== undefined &&
                            field.value !== 0
                            ? field.value.toString()
                            : ""
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full min-w-0">
                            <SelectValue placeholder="Изберете оборудване" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workcardDetails?.equipments?.map(
                            ({ EquipmentName, Id }) => (
                              <SelectItem
                                key={`${EquipmentName}`}
                                value={Id.toString()}
                                className="truncate"
                              >
                                {EquipmentName}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type="text"
                        placeholder="Изберете оборудване"
                        {...field}
                        value={field.value ?? ""}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex w-full flex-col gap-2 md:col-span-2 lg:col-span-2">
              <Label>Описание</Label>
              {workcardDetails?.notes && workcardDetails?.notes?.length > 0 ? (
                <Combobox
                  list={workcardDetails.notes.map((a) => ({
                    label: a,
                    value: a,
                  }))}
                  placeholderString="Често срещани причини"
                  value={""}
                  onValueChange={(value) => {
                    form.setValue("Note", value);
                  }}
                  triggerStyles="w-full min-w-0"
                />
              ) : (
                <Input
                  type="text"
                  placeholder="Често срещани причини"
                  value={form.getValues().Note ?? ""}
                  onChange={(e) => {
                    form.setValue("Note", e.target.value);
                  }}
                />
              )}
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <FormField
                control={form.control}
                name="Note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бележка</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Въведете бележка"
                        className="resize-none"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex w-lg flex-row items-center gap-4">
            <Button
              className="w-36"
              variant="outline"
              type="button"
              onClick={() => form.reset(defaultFormValues)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Изчисти
            </Button>

            <Button
              className="w-36"
              variant="ell"
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {workcardToEdit ? "Обнови" : "Запиши"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
