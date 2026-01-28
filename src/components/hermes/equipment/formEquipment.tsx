"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import type {
  HermesEquipment,
  CreateEquipmentInput,
} from "@/server/repositories/hermes";
import { useEffect, useMemo } from "react";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";
import { createEquipmentSchema } from "@/schemas/hermes.schemas";
import {
  HermesEqmtGroupName,
  HermesOperatorDepartment,
  HermesZvena,
} from "@/lib/constants";
import { logError } from "@/lib/logger/logger";

export const EquipmentForm = ({
  equipmentToEdit,
  onSuccess,
}: {
  equipmentToEdit?: HermesEquipment | null;
  onSuccess?: () => void;
}) => {
  const utils = api.useUtils();

  const defaultFormValues = useMemo<CreateEquipmentInput>(
    () => ({
      DT_smetka: 0,
      Obekt: "",
      DT_Priz1_ceh: "",
      DT_Priz2_kod_zveno: "",
      DT_Priz3_kod_eqmt: "",
      EqmtName: "",
      EqmtGroupName: "",
      PriceMinnaMasa: 0,
      PriceShists: 0,
      PriceGrano: 0,
      DspEqmt: "",
      Active: 0,
    }),
    [],
  );

  const createMutation = api.hermes.equipments.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Оборудването е успешно създадено.",
        variant: "default",
      });
      void utils.hermes.equipments.getAll.invalidate();
      form.reset(defaultFormValues);
      onSuccess?.();
    },
    onError: (error) => {
      logError("EquipmentForm CreateError", error);
      toast({
        title: "Грешка",
        description: "Възникна грешка при създаването.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = api.hermes.equipments.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Оборудването е успешно обновено.",
        variant: "default",
      });
      void utils.hermes.equipments.getAll.invalidate();
      form.reset(defaultFormValues);
      onSuccess?.();
    },
    onError: (error) => {
      logError("EquipmentForm UpdateError", error);
      toast({
        title: "Грешка",
        description: "Възникна грешка при обновяването.",
        variant: "destructive",
      });
    },
  });

  // Compute initial form values based on equipmentToEdit
  const initialFormValues = useMemo<CreateEquipmentInput>(() => {
    if (equipmentToEdit) {
      return {
        DT_smetka: equipmentToEdit.DT_smetka,
        Obekt: equipmentToEdit.Obekt ?? "",
        DT_Priz1_ceh: (equipmentToEdit.DT_Priz1_ceh ?? "").trim(),
        DT_Priz2_kod_zveno: (equipmentToEdit.DT_Priz2_kod_zveno ?? "").trim(),
        DT_Priz3_kod_eqmt: equipmentToEdit.DT_Priz3_kod_eqmt ?? "",
        EqmtName: equipmentToEdit.EqmtName ?? "",
        EqmtGroupName: (equipmentToEdit.EqmtGroupName ?? "").trim(),
        PriceMinnaMasa: equipmentToEdit.PriceMinnaMasa ?? 0,
        PriceShists: equipmentToEdit.PriceShists ?? 0,
        PriceGrano: equipmentToEdit.PriceGrano ?? 0,
        DspEqmt: equipmentToEdit.DspEqmt ?? "",
        Active: equipmentToEdit.Active ?? 0,
      };
    }
    return defaultFormValues;
  }, [equipmentToEdit, defaultFormValues]);

  const form = useForm<CreateEquipmentInput>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: initialFormValues,
  });

  // Sync form when equipmentToEdit changes (for cases when component doesn't remount)
  useEffect(() => {
    form.reset(initialFormValues);
  }, [initialFormValues, form]);

  async function onSubmit(values: CreateEquipmentInput) {
    if (equipmentToEdit) {
      await updateMutation.mutateAsync({
        id: equipmentToEdit.Id,
        data: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  return (
    <div className="-mt-4 max-w-2xl rounded-xl px-4 pb-4">
      <Form {...form}>
        <form
          key={equipmentToEdit?.Id ?? "new"}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid w-full grid-cols-2 gap-4 py-2.5 md:grid-cols-3">
            <div className="col-span-2 md:col-span-3">
              <FormField
                control={form.control}
                name="EqmtName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Оборудване</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Въведете име на оборудване"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full">
              <FormField
                control={form.control}
                name="DT_Priz3_kod_eqmt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Код Оборудване</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Въведете код на оборудване"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full">
              <FormField
                control={form.control}
                name="DT_Priz2_kod_zveno"
                render={({ field }) => {
                  const selectValue = String(field.value ?? "");
                  return (
                    <FormItem>
                      <FormLabel>Код Звено</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={selectValue}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full min-w-0">
                            <SelectValue placeholder="Код звено" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(HermesZvena).map(
                            ([zvenoNumber, zveno]) => (
                              <SelectItem value={zvenoNumber} key={zvenoNumber}>
                                {zvenoNumber} - {zveno}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="w-full">
              <FormField
                control={form.control}
                name="EqmtGroupName"
                render={({ field }) => {
                  const selectValue = String(field.value ?? "");
                  return (
                    <FormItem>
                      <FormLabel>Група</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={selectValue}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full min-w-0">
                            <SelectValue placeholder="Група" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HermesEqmtGroupName.map((group) => (
                            <SelectItem value={group} key={group}>
                              {group}
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

            <div className="w-full">
              <FormField
                control={form.control}
                name="DT_smetka"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сметка</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Въведете сметка"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full">
              <FormField
                control={form.control}
                name="DT_Priz1_ceh"
                render={({ field }) => {
                  const selectValue = String(field.value ?? "");
                  return (
                    <FormItem>
                      <FormLabel>Цех</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={selectValue}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full min-w-0">
                            <SelectValue placeholder="Цех" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HermesOperatorDepartment.map((dept) => (
                            <SelectItem value={dept} key={dept}>
                              {dept}
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

            <div className="w-full">
              <FormField
                control={form.control}
                name="Obekt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Обект</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Въведете обект"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full md:col-span-2">
              <FormField
                control={form.control}
                name="DspEqmt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dispatch Оборудване</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Dispatch name"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Ако оборудването не е в Dispatch, оставете това поле
                      празно.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex w-full flex-col items-start justify-start pl-6 md:pt-1 md:pl-0">
              <FormField
                control={form.control}
                name="Active"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center space-y-0">
                    <div className="space-y-1 text-xl leading-none font-medium">
                      <FormLabel className="text-base leading-none font-medium">
                        Активно
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value === 1 ? true : false}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 1 : 0)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full">
              <FormField
                control={form.control}
                name="PriceMinnaMasa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена минна маса</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Цена минна маса"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full">
              <FormField
                control={form.control}
                name="PriceShists"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена шисти</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Цена шисти"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full">
              <FormField
                control={form.control}
                name="PriceGrano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена гранодиорит</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Цена гранодиорит"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex w-xl flex-row items-center gap-4">
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
              {equipmentToEdit ? "Обнови" : "Запиши"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
