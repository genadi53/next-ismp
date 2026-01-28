"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  dmaDocumentFormSchema,
  type DmaDocumentFormData,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/cn";
import { Calendar } from "@/components/ui/calendar";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";
import type { DmaDocumentDetail } from "@/server/repositories/dma/types.documents";
import type { DmaSupplier } from "@/server/repositories/dma";
import type { DmaDepartment } from "@/server/repositories/dma";

type DocumentFormProps = {
  documentToEdit?: DmaDocumentDetail;
  onFormSubmit: (documentId?: number) => void;
};

export function DocumentsForm({
  documentToEdit,
  onFormSubmit,
}: DocumentFormProps) {
  const utils = api.useUtils();
  const { data: suppliers } = api.dma.suppliers.getAll.useQuery(undefined);
  const { data: departments } = api.dma.departments.getAll.useQuery(undefined);
  const { data: allowdate } = api.dma.documents.getAllowedDate.useQuery();
  const createMutation = api.dma.documents.create.useMutation({
    onSuccess: () => {
      void utils.dma.documents.getAll.invalidate();
    },
  });
  const updateMutation = api.dma.documents.update.useMutation({
    onSuccess: () => {
      void utils.dma.documents.getAll.invalidate();
    },
  });

  const form = useForm<DmaDocumentFormData>({
    resolver: zodResolver(dmaDocumentFormSchema),
    reValidateMode: "onChange",
    defaultValues: {
      Doctype: 1,
      DocTypeId: 1,
      DocDate: format(new Date(), "yyyy-MM-dd"),
      SupplierId: 0,
      DepartmentId: 0,
      Inv: "",
      InvDate: "",
      DocAmount: 0,
      Reconstruction: "",
      VuzlagatelnoDate: "",
      Vuzlagatelno: "",
      InvestitionID: "",
      DocsDepartment: "",
      DocsDepMol: "",
      DocsDepMolDuty: "",
      DocsDepartmentDesc: "",
      DocsDeptApproval: "",
      DocsDeptApprovalDuty: "",
      DocsSuplierName: "",
      DocsSuplierDesc: "",
    },
  });

  useEffect(() => {
    if (documentToEdit) {
      form.reset({
        Doctype: documentToEdit.Doctype,
        DocTypeId: documentToEdit.DocTypeId,
        DocDate: documentToEdit.DocDate,
        SupplierId: documentToEdit.SupplierId,
        DepartmentId: documentToEdit.DepartmentId,
        Inv: documentToEdit.Inv ?? "",
        InvDate: documentToEdit.InvDate ?? "",
        DocAmount: documentToEdit.DocAmount ?? 0,
        Reconstruction: documentToEdit.Reconstruction ?? "",
        VuzlagatelnoDate: documentToEdit.VuzlagatelnoDate ?? "",
        Vuzlagatelno: documentToEdit.Vuzlagatelno ?? "",
        InvestitionID: documentToEdit.InvestitionID ?? "",
        DocsDepartment: documentToEdit.DocsDepartment ?? "",
        DocsDepMol: documentToEdit.DocsDepMol ?? "",
        DocsDepMolDuty: documentToEdit.DocsDepMolDuty ?? "",
        DocsDepartmentDesc: documentToEdit.DocsDepartmentDesc ?? "",
        DocsDeptApproval: documentToEdit.DocsDeptApproval ?? "",
        DocsDeptApprovalDuty: documentToEdit.DocsDeptApprovalDuty ?? "",
        DocsSuplierName: documentToEdit.DocsSuplierName ?? "",
        DocsSuplierDesc: documentToEdit.DocsSuplierDesc ?? "",
      });
    } else {
      form.reset({
        Doctype: 1,
        DocTypeId: 1,
        DocDate: format(new Date(), "yyyy-MM-dd"),
        SupplierId: 0,
        DepartmentId: 0,
        Inv: "",
        InvDate: "",
        DocAmount: 0,
        Reconstruction: "",
        VuzlagatelnoDate: "",
        Vuzlagatelno: "",
        InvestitionID: "",
        DocsDepartment: "",
        DocsDepMol: "",
        DocsDepMolDuty: "",
        DocsDepartmentDesc: "",
        DocsDeptApproval: "",
        DocsDeptApprovalDuty: "",
        DocsSuplierName: "",
        DocsSuplierDesc: "",
      });
    }
  }, [documentToEdit, form]);

  const supplierId = useWatch({ control: form.control, name: "SupplierId" });
  const departmentId = useWatch({
    control: form.control,
    name: "DepartmentId",
  });
  const doctype = useWatch({ control: form.control, name: "Doctype" });
  const areBothSelected = (supplierId ?? 0) > 0 && (departmentId ?? 0) > 0;

  useEffect(() => {
    if (areBothSelected && suppliers && departments) {
      const selectedSupplier = suppliers.find(
        (s: DmaSupplier) => s.Id === supplierId,
      );
      const selectedDepartment = departments.find(
        (d: DmaDepartment) => d.Id === departmentId,
      );
      if (selectedSupplier) {
        form.setValue("DocsSuplierName", selectedSupplier.Supplier ?? "");
        form.setValue("DocsSuplierDesc", selectedSupplier.SupplierDesc ?? "");
      }
      if (selectedDepartment) {
        form.setValue("DocsDepartment", selectedDepartment.Department ?? "");
        form.setValue("DocsDepMol", selectedDepartment.DepMol ?? "");
        form.setValue("DocsDepMolDuty", selectedDepartment.DepMolDuty ?? "");
        form.setValue(
          "DocsDepartmentDesc",
          selectedDepartment.DepartmentDesc ?? "",
        );
        form.setValue("DocsDeptApproval", selectedDepartment.DeptApproval ?? "");
        form.setValue(
          "DocsDeptApprovalDuty",
          selectedDepartment.DeptApprovalDuty ?? "",
        );
      }
    }
  }, [supplierId, departmentId, suppliers, departments, areBothSelected, form]);

  const toPayload = (values: DmaDocumentFormData) => ({
    Doctype: values.Doctype,
    DocDate: values.DocDate,
    SupplierId: values.SupplierId,
    DepartmentId: values.DepartmentId,
    Inv: values.Inv ?? null,
    InvDate: values.InvDate ?? null,
    DocAmount: values.DocAmount ?? null,
    Reconstruction: values.Reconstruction ?? null,
    VuzlagatelnoDate: values.VuzlagatelnoDate ?? null,
    Vuzlagatelno: values.Vuzlagatelno ?? null,
    InvestitionID: values.InvestitionID ?? null,
    DocsDepartment: values.DocsDepartment ?? null,
    DocsDepMol: values.DocsDepMol ?? null,
    DocsDepMolDuty: values.DocsDepMolDuty ?? null,
    DocsDepartmentDesc: values.DocsDepartmentDesc ?? null,
    DocsDeptApproval: values.DocsDeptApproval ?? null,
    DocsDeptApprovalDuty: values.DocsDeptApprovalDuty ?? null,
    DocsSuplierName: values.DocsSuplierName ?? null,
    DocsSuplierDesc: values.DocsSuplierDesc ?? null,
    CreatedFrom: "test@testov",
    LastUpdatedFrom: "test@testov",
  });

  async function onSubmit(values: DmaDocumentFormData) {
    try {
      const payload = toPayload(values);
      if (documentToEdit) {
        await updateMutation.mutateAsync({
          id: documentToEdit.Id,
          data: payload,
        });
        onFormSubmit();
        form.reset();
        return toast({
          title: "Успешно",
          description: "Документът е редактиран успешно.",
        });
      }
      const result = await createMutation.mutateAsync(payload);
      form.reset();
      toast({
        title: "Добавен нов документ",
        description: "Документът е създаден успешно.",
      });
      onFormSubmit(result?.id);
    } catch {
      return toast({
        title: "Грешка",
        description:
          "Възникна грешка при запазване на документа. Опитайте отново.",
        variant: "destructive",
      });
    }
  }

  const stopped = allowdate?.StoppedAll === 1;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {stopped && (
          <Alert variant="destructive" className="border-red-700 bg-red-50">
            <AlertTriangle className="mt-2 h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-700">Внимание</AlertTitle>
            <AlertDescription className="text-red-600">
              Спряно е създаването на актове до приключване на месеца!!!
            </AlertDescription>
          </Alert>
        )}
        {allowdate && !stopped && (
          <Alert variant="default" className="border-orange-300 bg-orange-50">
            <AlertTriangle className="mt-2 h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Внимание</AlertTitle>
            <AlertDescription className="text-orange-700">
              Активен период за създаване на актове от {allowdate.StartDate} до{" "}
              {allowdate.EndDate} !!!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          <FormField
            control={form.control}
            name="Doctype"
            render={({ field }) => (
              <FormItem className="w-full md:col-span-2 lg:col-span-6">
                <FormLabel>Тип на документа</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger className="min-w-0 w-full">
                      <SelectValue placeholder="Изберете тип на документа" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Акт за приемане на ДМА</SelectItem>
                    <SelectItem value="2">
                      Акт за приемане на ДМА с реконструкция
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="SupplierId"
            render={({ field }) => (
              <FormItem className="w-full md:col-span-1 lg:col-span-3">
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
                  ) : (
                    <Input
                      placeholder="Въведете доставчик"
                      type="number"
                      autoComplete="off"
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="DepartmentId"
            render={({ field }) => (
              <FormItem className="w-full md:col-span-1 lg:col-span-3">
                <FormLabel>Дирекция</FormLabel>
                <FormControl>
                  {departments && departments?.length > 0 ? (
                    <Combobox
                      list={departments?.map((d: DmaDepartment) => ({
                        label: d.Department,
                        value: String(d.Id),
                      }))}
                      placeholderString="Изберете дирекция"
                      value={(field.value ?? 0) > 0 ? String(field.value) : ""}
                      onValueChange={(v) =>
                        field.onChange(v ? Number(v) : 0)
                      }
                      triggerStyles="min-w-0 w-full"
                    />
                  ) : (
                    <Input
                      placeholder="Въведете дирекция"
                      type="number"
                      autoComplete="off"
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Inv"
            render={({ field }) => (
              <FormItem className="w-full md:col-span-1 lg:col-span-2">
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
              <FormItem className="min-w-0 flex flex-col md:col-span-1 lg:col-span-2">
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
                          format(field.value, "yyyy-MM-dd")
                        ) : (
                          <span>Въведете дата на фактура</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={
                        field.value ? new Date(field.value) : undefined
                      }
                      onSelect={(date) =>
                        field.onChange(
                          date ? format(date, "yyyy-MM-dd") : "",
                        )
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

          <FormField
            control={form.control}
            name="DocAmount"
            render={({ field }) => (
              <FormItem className="w-full md:col-span-1 lg:col-span-2">
                <FormLabel>Стойност на фактура</FormLabel>
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
            name="Vuzlagatelno"
            render={({ field }) => (
              <FormItem className="w-full md:col-span-1 lg:col-span-2">
                <FormLabel>Възлагателно / Основание</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Въведете код на възлагателно писмо"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="VuzlagatelnoDate"
            render={({ field }) => (
              <FormItem className="min-w-0 flex flex-col md:col-span-1 lg:col-span-2">
                <FormLabel>Дата на възлагателно</FormLabel>
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
                          format(field.value, "yyyy-MM-dd")
                        ) : (
                          <span>Въведете дата на възлагателното</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={
                        field.value ? new Date(field.value) : undefined
                      }
                      onSelect={(date) =>
                        field.onChange(
                          date ? format(date, "yyyy-MM-dd") : "",
                        )
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

          <FormField
            control={form.control}
            name="InvestitionID"
            render={({ field }) => (
              <FormItem className="w-full md:col-span-1 lg:col-span-2">
                <FormLabel>Код на инвестиция</FormLabel>
                <FormControl>
                  <Input placeholder="Въведете код на инвестиция" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="Reconstruction"
            render={({ field }) => (
              <FormItem className="w-full md:col-span-2 lg:col-span-6">
                <FormLabel>Реконструкция</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={doctype !== 2}
                    placeholder="Въведете описание за реконструкция"
                    className="resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Изчисти
          </Button>
          <Button type="submit" variant="ell">
            {documentToEdit ? "Редактирай" : "Създай"} документ
          </Button>
        </div>
      </form>
    </Form>
  );
}
