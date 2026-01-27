"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  dmaSupplierFormSchema,
  type DmaSupplierFormData,
} from "@/schemas/dma.schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { DmaSupplier } from "@/server/repositories/dma";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";

type SupplierFormProps = {
  supplierToEdit?: DmaSupplier | null;
  onFormSubmit: () => void;
};

export const SuppliersForm = ({
  supplierToEdit,
  onFormSubmit,
}: SupplierFormProps) => {
  const utils = api.useUtils();
  const form = useForm<DmaSupplierFormData>({
    resolver: zodResolver(dmaSupplierFormSchema),
    defaultValues: {
      Supplier: "",
      SupplierDesc: "",
    },
  });

  const createMutation = api.dma.suppliers.create.useMutation({
    onSuccess: () => {
      void utils.dma.suppliers.getAll.invalidate();
      onFormSubmit();
      form.reset();
      toast({
        title: "Успех",
        description: "Доставчикът е успешно създаден.",
      });
    },
    onError: () => {
      toast({
        title: "Грешка",
        description:
          "Възникна грешка при създаване на доставчика. Опитайте отново, или се обадете на администратор.",
        variant: "destructive",
      });
    },
  });
  const updateMutation = api.dma.suppliers.update.useMutation({
    onSuccess: () => {
      void utils.dma.suppliers.getAll.invalidate();
      onFormSubmit();
      form.reset();
      toast({
        title: "Успех",
        description: "Доставчикът е успешно редактиран.",
      });
    },
    onError: () => {
      toast({
        title: "Грешка",
        description:
          "Възникна грешка при редактиране на доставчика. Опитайте отново, или се обадете на администратор.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (supplierToEdit) {
      form.reset({
        Supplier: supplierToEdit.Supplier,
        SupplierDesc: supplierToEdit.SupplierDesc ?? "",
      });
    } else {
      form.reset({
        Supplier: "",
        SupplierDesc: "",
      });
    }
  }, [supplierToEdit, form]);

  function onSubmit(values: DmaSupplierFormData) {
    const data = {
      Supplier: values.Supplier,
      SupplierDesc: values.SupplierDesc ?? null,

    };
    if (supplierToEdit) {
      updateMutation.mutate({
        id: supplierToEdit.Id, data
      });
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <div className="max-w-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 w-full pt-0">
            <div className="w-full">
              <FormField
                control={form.control}
                name="Supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Доставчик</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Въведете името на доставчика"
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
                name="SupplierDesc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Въведете описание на доставчика"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex flex-row items-center gap-4 pt-4">
            <Button
              className="w-24"
              variant="ell"
              type="submit"
              disabled={!form.formState.isValid}
            >
              {supplierToEdit ? "Редактирай" : "Запиши"}
            </Button>
            <Button
              className="w-24"
              variant="outline"
              type="button"
              disabled={form.formState.isSubmitting}
              onClick={(e) => {
                e.preventDefault();
                form.reset({ Supplier: "", SupplierDesc: "" });
              }}
            >
              Изчисти
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
