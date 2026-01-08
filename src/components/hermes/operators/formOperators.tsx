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
import type {
  HermesOperator,
  CreateOperatorInput,
} from "@/server/repositories/hermes";
import { toast } from "@/components/ui/toast";
import { useEffect } from "react";
import { api } from "@/trpc/react";
import { createOperatorSchema } from "@/schemas/hermes.schemas";
import {
  HermesOperatorDepartment,
  HermesOperatorDlazhnost,
  HermesZvena,
} from "@/lib/constants";

type OperatorsFormProps = {
  operatorToEdit?: HermesOperator | null;
  onSuccess?: () => void;
};

export const OperatorsForm = ({
  operatorToEdit,
  onSuccess,
}: OperatorsFormProps = {}) => {
  const utils = api.useUtils();

  const createMutation = api.hermes.operators.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Операторът е успешно създаден.",
      });
      utils.hermes.operators.getAll.invalidate();
      form.reset();
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

  const updateMutation = api.hermes.operators.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Операторът е успешно обновен.",
      });
      utils.hermes.operators.getAll.invalidate();
      form.reset();
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

  const form = useForm<CreateOperatorInput>({
    resolver: zodResolver(createOperatorSchema),
    defaultValues: {
      OperatorName: "",
      OperatorId: 0,
      Dlazhnost: "",
      Department: "",
      Zveno: "",
    },
  });

  useEffect(() => {
    if (operatorToEdit) {
      form.reset({
        OperatorName: operatorToEdit.OperatorName ?? "",
        OperatorId: operatorToEdit.OperatorId ?? 0,
        Dlazhnost: operatorToEdit.Dlazhnost ?? "",
        Department: operatorToEdit.Department ?? "",
        Zveno: operatorToEdit.Zveno ?? "",
      });
    } else {
      form.reset();
    }
  }, [operatorToEdit, form]);

  async function onSubmit(values: CreateOperatorInput) {
    if (operatorToEdit) {
      await updateMutation.mutateAsync({
        id: operatorToEdit.Id,
        data: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="OperatorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Име на оператор</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Въведете име на оператор"
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
                name="Dlazhnost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Длъжност</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full min-w-0">
                          <SelectValue placeholder="Длъжност на оператора" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HermesOperatorDlazhnost.map((dl) => (
                          <SelectItem value={dl} key={dl}>
                            {dl}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="Department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Отдел</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full min-w-0">
                          <SelectValue placeholder="Изберете отдел" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HermesOperatorDepartment.map((otd) => (
                          <SelectItem value={otd} key={otd}>
                            {otd}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="OperatorId"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>ID на оператор</FormLabel>
                      <FormControl>
                        <Input
                          className="w-full"
                          type="number"
                          placeholder="Въведете ID на оператор"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div>
              <FormField
                control={form.control}
                name="Zveno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Звено</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full min-w-0">
                          <SelectValue placeholder="Звено" />
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
                )}
              />
            </div>
          </div>

          <div className="flex flex-row items-center gap-3 pt-2">
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
              {operatorToEdit ? "Обнови" : "Запиши"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
