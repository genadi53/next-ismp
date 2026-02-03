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
import { loadsSchema, type LoadsFormData } from "@/schemas/loads.schemas";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Materials } from "@/lib/constants";
import { useEffect, useMemo } from "react";
import { SHIFT_NUMBERS } from "@/lib/constants";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";
import type { Load } from "@/server/repositories/loads/types.loads";
import { Combobox } from "../ui/combobox";

const DefaultFormValues: LoadsFormData = {
  Adddate: new Date(),
  Shift: 1,
  Shovel: "",
  Truck: "",
  Br: 0,
  AddMaterial: "",
  RemoveMaterial: "",
};

export const LoadsForm = ({
  loadToEdit,
  onCancelEdit,
}: {
  loadToEdit: Load | null;
  onCancelEdit?: () => void;
}) => {
  const utils = api.useUtils();
  const { data: equipmentNames, isLoading } =
    api.dashboard.dispatcher.getEquipmentNames.useQuery();

  const { mutateAsync: createLoad, isPending } =
    api.loads.loads.create.useMutation({
      onSuccess: () => {
        toast({
          title: "Успех",
          description: "Записът е успешен.",
        });
        void utils.loads.loads.getAll.invalidate();
        void utils.loads.loads.getUnsent.invalidate();
        form.reset(DefaultFormValues);
        onCancelEdit?.();
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          variant: "destructive",
          description:
            error.message ||
            "Възникна грешка при създаването на записа. Опитайте отново.",
        });
      },
    });

  const { mutateAsync: updateLoad, isPending: isUpdatePending } =
    api.loads.loads.update.useMutation({
      onSuccess: () => {
        toast({
          title: "Успех",
          description: "Записът е успешено променен.",
        });
        void utils.loads.loads.getAll.invalidate();
        form.reset(DefaultFormValues);
        onCancelEdit?.();
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          variant: "destructive",
          description:
            error.message ||
            "Възникна грешка при промяната на записа. Опитайте отново.",
        });
      },
    });

  // Compute initial form values based on loadToEdit
  const initialFormValues = useMemo<LoadsFormData>(() => {
    if (loadToEdit) {
      return {
        Adddate: new Date(loadToEdit.Adddate),
        Shift: loadToEdit.Shift
          ? Number(loadToEdit.Shift)
          : DefaultFormValues.Shift,
        Shovel: loadToEdit.Shovel ?? "",
        Truck: loadToEdit.Truck ?? "",
        Br: loadToEdit.Br ?? 0,
        AddMaterial: loadToEdit.AddMaterial?.trim() ?? "",
        RemoveMaterial: loadToEdit.RemoveMaterial?.trim() ?? "",
      };
    }
    return DefaultFormValues;
  }, [loadToEdit]);

  const form = useForm<LoadsFormData>({
    resolver: zodResolver(loadsSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: initialFormValues,
  });

  // Sync form when loadToEdit changes (for cases when component doesn't remount)
  useEffect(() => {
    form.reset(initialFormValues);
  }, [initialFormValues, form]);

  async function onSubmit(formData: LoadsFormData) {
    try {
      if (loadToEdit) {
        await updateLoad({
          id: loadToEdit.id,
          data: formData,
        });
      } else {
        await createLoad(formData);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-1 lg:col-span-2">
              <FormField
                control={form.control}
                name="Adddate"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>Дата</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
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
                          captionLayout="dropdown"
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

            <div className="col-span-1 w-full md:col-span-1 lg:col-span-2">
              <FormField
                control={form.control}
                name="Shift"
                render={({ field }) => {
                  // Handle NaN and invalid values
                  let selectValue = "";
                  if (
                    field.value != null &&
                    typeof field.value === "number" &&
                    !isNaN(field.value) &&
                    isFinite(field.value) &&
                    field.value >= 1 &&
                    field.value <= 4
                  ) {
                    selectValue = String(Math.floor(field.value));
                  }

                  return (
                    <FormItem>
                      <FormLabel>Смяна</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const numValue = parseInt(value, 10);
                          if (!isNaN(numValue)) {
                            field.onChange(numValue);
                          }
                        }}
                        value={selectValue}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Изберете смяна" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4].map((shiftNumber) => (
                            <SelectItem
                              key={shiftNumber}
                              value={String(shiftNumber)}
                            >
                              {SHIFT_NUMBERS[shiftNumber]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="col-span-1 w-full lg:col-span-2">
              <FormField
                control={form.control}
                name="Shovel"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel>Багер</FormLabel>
                    {!isLoading &&
                      equipmentNames &&
                      equipmentNames.length > 0 ? (
                      <FormControl>
                        <Combobox
                          list={equipmentNames
                            .filter(
                              (eq) => eq.includes("2B") || eq.includes("2L"),
                            )
                            .map((shovelName) => ({
                              label: shovelName ? shovelName.trim() : "",
                              value: shovelName ? shovelName.trim() : "",
                            }))}
                          placeholderString="Изберете багер"
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                        />
                      </FormControl>
                    ) : (
                      <Input
                        placeholder="Изберете багер"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1 w-full lg:col-span-2">
              <FormField
                control={form.control}
                name="Truck"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Камион</FormLabel>
                    {!isLoading &&
                      equipmentNames &&
                      equipmentNames.length > 0 ? (
                      <FormControl>
                        <Combobox
                          list={equipmentNames
                            .filter((eq) => eq.includes("2C"))
                            .map((truckName) => ({
                              label: truckName,
                              value: truckName,
                            }))}
                          placeholderString="Изберете камион"
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                        />
                      </FormControl>
                    ) : (
                      <Input
                        type="text"
                        placeholder="Изберете камион"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1 w-full md:col-span-2 lg:col-span-4">
              <FormField
                control={form.control}
                name="Br"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Брой</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Въведете брой"
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

            <div className="col-span-1 w-full lg:col-span-2">
              <FormField
                control={form.control}
                name="AddMaterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Добавен материал</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Изберете добавен материал" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Materials.map((material) => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1 w-full lg:col-span-2">
              <FormField
                control={form.control}
                name="RemoveMaterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Премахнат материал</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Изберете премахнат материал" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Materials.map((material) => (
                          <SelectItem key={material} value={material}>
                            {material}
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

          <div className="mt-6 flex flex-row items-center gap-3 border-t pt-6">
            <Button
              className="w-36"
              variant="outline"
              type="reset"
              disabled={isPending || isUpdatePending}
              onClick={(e) => {
                e.preventDefault();
                form.reset(DefaultFormValues);
              }}
            >
              Изчисти
            </Button>

            <Button
              className="w-36"
              variant="ell"
              type="submit"
              disabled={!form.formState.isValid || isPending || isUpdatePending}
            >
              {loadToEdit ? "Обнови" : "Запиши"}
            </Button>

            {loadToEdit && (
              <Button
                className="ml-auto w-36"
                variant="outline"
                type="button"
                onClick={() => {
                  form.reset(DefaultFormValues);
                  onCancelEdit?.();
                }}
              >
                Отказ
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
