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
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { format } from "date-fns";
import type {
  HermesWorkcard,
  CreateWorkcardInput,
} from "@/server/repositories/hermes";
import { Label } from "@/components/ui/label";
import { useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { createWorkcardSchema } from "@/schemas/hermes.schemas";

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

  const utils = api.useUtils();

  const createMutation = api.hermes.workcards.create.useMutation({
    onSuccess: () => {
      toast.success("Успешно", {
        description: "Работната карта е успешно създадена.",
      });
      utils.hermes.workcards.getAll.invalidate();
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Грешка", {
        description: error.message || "Възникна грешка при създаването.",
      });
    },
  });

  const updateMutation = api.hermes.workcards.update.useMutation({
    onSuccess: () => {
      toast.success("Успешно", {
        description: "Работната карта е успешно обновена.",
      });
      utils.hermes.workcards.getAll.invalidate();
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Грешка", {
        description: error.message || "Възникна грешка при обновяването.",
      });
    },
  });

  const form = useForm<CreateWorkcardInput>({
    resolver: zodResolver(createWorkcardSchema),
    defaultValues: {
      Date: new Date(),
      StartTime: "",
      EndTime: "",
      OperatorId: 0,
      CodeAction: 0,
      Note: "",
      WorkingCardId: 0,
      EqmtId: 0,
    },
  });

  useEffect(() => {
    if (workcardToEdit) {
      form.reset({
        Date: new Date(workcardToEdit.Date),
        StartTime: workcardToEdit.StartTime ?? "",
        EndTime: workcardToEdit.EndTime ?? "",
        OperatorId: workcardToEdit.OperatorId ?? 0,
        CodeAction:
          typeof workcardToEdit.CodeAction === "number"
            ? workcardToEdit.CodeAction
            : parseInt(workcardToEdit.CodeAction?.split("-")[0] ?? "0"),
        Note: workcardToEdit.Note ?? "",
        WorkingCardId: workcardToEdit.WorkingCardId ?? 0,
        EqmtId: workcardToEdit.EqmtId ?? 0,
      });
    } else {
      form.reset();
    }
  }, [workcardToEdit, form]);

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
                      <Input type="time" {...field} value={field.value || ""} />
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
                      <Input type="time" {...field} value={field.value || ""} />
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full min-w-0 justify-between truncate",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? workcardDetails.operators.find(
                                    (op) => op.Id === field.value,
                                  )?.Operator || "Изберете оператор"
                                : "Изберете оператор"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="max-h-[400px] w-[200px] min-w-0 p-0 lg:w-[375px]"
                          align="start"
                          side="bottom"
                        >
                          <Command>
                            <CommandInput
                              placeholder="Търси оператор..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                Няма намерени резултати.
                              </CommandEmpty>
                              <CommandGroup>
                                {workcardDetails.operators.map(
                                  ({ Id, Operator }) => (
                                    <CommandItem
                                      value={`${Id}-${Operator}`}
                                      key={Id}
                                      onSelect={() => {
                                        field.onChange(Id.toString());
                                      }}
                                    >
                                      {Operator}
                                      <Check
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          Id === field.value
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                    </CommandItem>
                                  ),
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <Input
                        type="text"
                        placeholder="Изберете оператор"
                        {...field}
                        value={field.value || ""}
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
                        type="number"
                        placeholder="ID на работна карта"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
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
                      value={field.value ? field.value.toString() : ""}
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
                        onValueChange={field.onChange}
                        value={`${field.value}`}
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
                                value={`${Id}`}
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
                        value={field.value || ""}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex w-full flex-col gap-2 md:col-span-2 lg:col-span-2">
              <Label>Описание</Label>
              {workcardDetails?.notes && workcardDetails.notes.length > 0 ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      type="button"
                      className={cn(
                        "max-0 w-full justify-between truncate font-normal",
                        !form.getValues().Note && "text-muted-foreground",
                      )}
                    >
                      {"Често срещани причини"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="max-h-[400px] w-[200px] min-w-0 p-0 lg:w-[375px]"
                    align="start"
                    side="bottom"
                  >
                    <Command>
                      <CommandInput
                        placeholder="Търси причина..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>Няма намерени резултати.</CommandEmpty>
                        <CommandGroup>
                          {workcardDetails.notes.map((note, idx) => (
                            <CommandItem
                              value={note}
                              key={`${note}-${idx}`}
                              onSelect={() => {
                                form.setValue("Note", note);
                              }}
                            >
                              {note}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  note === form.getValues().Note
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <Input
                  type="text"
                  placeholder="Често срещани причини"
                  value={form.getValues().Note || ""}
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
                        value={field.value || ""}
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
              onClick={() => form.reset()}
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
