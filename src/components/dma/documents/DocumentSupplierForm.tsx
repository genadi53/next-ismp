"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  dmaDocumentSupplierFormSchema,
  type DmaDocumentSupplierFormData,
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { format } from "date-fns";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";
import { Combobox } from "@/components/ui/combobox";
import type { DmaSupplier } from "@/server/repositories/dma";
import type { DmaDocumentSupplier } from "@/server/repositories/dma/types.documents";

type DocumentSupplierFormProps = {
  documentId: number;
  supplierToEdit?: DmaDocumentSupplier | null;
  onSuccess: () => void;
  onCancel?: () => void;
};

export function DocumentSupplierForm({
  documentId,
  supplierToEdit,
  onSuccess,
  onCancel,
}: DocumentSupplierFormProps) {
  const utils = api.useUtils();
  const { data: suppliers } = api.dma.suppliers.getAll.useQuery(undefined);
  const createMutation = api.dma.documents.createSupplier.useMutation({
    onSuccess: () => {
      void utils.dma.documents.getSuppliers.invalidate({ documentId });
    },
  });
  const updateMutation = api.dma.documents.updateSupplier.useMutation({
    onSuccess: () => {
      void utils.dma.documents.getSuppliers.invalidate({ documentId });
    },
  });
  const deleteMutation = api.dma.documents.deleteSupplier.useMutation({
    onSuccess: () => {
      void utils.dma.documents.getSuppliers.invalidate({ documentId });
    },
  });

  const form = useForm<DmaDocumentSupplierFormData>({
    resolver: zodResolver(dmaDocumentSupplierFormSchema),
    defaultValues: {
      DocSupplierId: 0,
      DocSuplAmount: 0,
      Inv: "",
      InvDate: "",
    },
  });

  useEffect(() => {
    if (supplierToEdit && suppliers?.length) {
      const exists = suppliers.some((s) => s.Id === supplierToEdit.DocSupplierId);
      if (exists) {
        form.reset({
          DocSupplierId: supplierToEdit.DocSupplierId,
          DocSuplAmount: supplierToEdit.DocSuplAmount ?? 0,
          Inv: supplierToEdit.Inv ?? "",
          InvDate: supplierToEdit.InvDate ?? "",
        });
      }
    } else if (!supplierToEdit) {
      form.reset({
        DocSupplierId: 0,
        DocSuplAmount: 0,
        Inv: "",
        InvDate: "",
      });
    }
  }, [supplierToEdit, suppliers, form]);

  async function onSubmit(values: DmaDocumentSupplierFormData) {
    try {
      const selected = suppliers?.find((s) => s.Id === values.DocSupplierId);
      const data = {
        DocSupplierId: values.DocSupplierId,
        DocSuplierName: selected?.Supplier ?? null,
        DocSuplierDesc: selected?.SupplierDesc ?? null,
        DocSuplAmount: values.DocSuplAmount,
        Inv: values.Inv,
        InvDate: values.InvDate,
      };
      if (supplierToEdit) {
        await updateMutation.mutateAsync({
          documentId,
          supplierId: supplierToEdit.id,
          data,
        });
        toast({ title: "Успешно", description: "Доставчикът е редактиран успешно." });
      } else {
        await createMutation.mutateAsync({ documentId, data });
        toast({ title: "Успешно", description: "Доставчикът е добавен успешно." });
      }
      form.reset();
      onSuccess();
    } catch {
      toast({
        title: "Грешка",
        description: "Възникна грешка при запазване на доставчика.",
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    if (!supplierToEdit || !confirm("Сигурни ли сте, че искате да изтриете този доставчик?")) return;
    try {
      await deleteMutation.mutateAsync({
        documentId,
        supplierId: supplierToEdit.id,
      });
      toast({ title: "Успешно", description: "Доставчикът е изтрит успешно." });
      onSuccess();
    } catch {
      toast({
        title: "Грешка",
        description: "Възникна грешка при изтриването на доставчика.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="DocSupplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Доставчик</FormLabel>
                <FormControl>
                  {suppliers && suppliers?.length > 0 ? (
                    <Combobox
                      list={suppliers.map((s: DmaSupplier) => ({
                        label: s.Supplier,
                        value: String(s.Id),
                      }))}
                      placeholderString="Изберете доставчик"
                      value={(field.value ?? 0) > 0 ? String(field.value) : ""}
                      onValueChange={(v) =>
                        field.onChange(v ? Number(v) : 0)
                      }
                      triggerStyles="min-w-0 w-full"
                    />
                  ) : null}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="DocSuplAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Стойност</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Въведете стойност"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="Inv"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Фактура №</FormLabel>
                <FormControl>
                  <Input placeholder="Въведете номер на фактура" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="InvDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Дата на фактура</FormLabel>
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
                          typeof field.value === "string" ? (
                            field.value
                          ) : (
                            format(new Date(field.value), "yyyy-MM-dd")
                          )
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
                      selected={
                        field.value
                          ? new Date(
                            typeof field.value === "string"
                              ? field.value
                              : field.value,
                          )
                          : undefined
                      }
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
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
        <div className="flex justify-end gap-2">
          {supplierToEdit && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Изтрий
            </Button>
          )}
          <Button type="submit" variant="ell">
            {supplierToEdit ? "Запази промените" : "Добави доставчик"}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Отказ
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
