"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  dmaDepartmentFormSchema,
  type DmaDepartmentFormData,
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
import type { DmaDepartment } from "@/server/repositories/dma";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";

type DepartmentFormProps = {
  departmentToEdit?: DmaDepartment | null;
  onFormSubmit: () => void;
  onFormCancel?: () => void;
};

export const DepartmentsForm = ({
  departmentToEdit,
  onFormSubmit,
  onFormCancel,
}: DepartmentFormProps) => {
  const utils = api.useUtils();
  const createMutation = api.dma.departments.create.useMutation({
    onSuccess: () => {
      utils.dma.departments.getAll.invalidate();
    },
  });
  const updateMutation = api.dma.departments.update.useMutation({
    onSuccess: () => {
      utils.dma.departments.getAll.invalidate();
    },
  });

  const form = useForm<DmaDepartmentFormData>({
    resolver: zodResolver(dmaDepartmentFormSchema),
    defaultValues: {
      Department: "",
      DepMol: "",
      DepMolDuty: "",
      DeptApproval: "",
      DeptApprovalDuty: "",
      DepartmentDesc: "",
    },
  });

  useEffect(() => {
    if (departmentToEdit) {
      form.reset({
        Department: departmentToEdit.Department,
        DepMol: departmentToEdit.DepMol ?? "",
        DepMolDuty: departmentToEdit.DepMolDuty ?? "",
        DeptApproval: departmentToEdit.DeptApproval ?? "",
        DeptApprovalDuty: departmentToEdit.DeptApprovalDuty ?? "",
        DepartmentDesc: departmentToEdit.DepartmentDesc ?? "",
      });
    } else {
      form.reset({
        Department: "",
        DepMol: "",
        DepMolDuty: "",
        DeptApproval: "",
        DeptApprovalDuty: "",
        DepartmentDesc: "",
      });
    }
  }, [departmentToEdit, form]);

  async function onSubmit(values: DmaDepartmentFormData) {
    try {
      const data = {
        Department: values.Department,
        DepMol: values.DepMol || null,
        DepMolDuty: values.DepMolDuty || null,
        DeptApproval: values.DeptApproval || null,
        DeptApprovalDuty: values.DeptApprovalDuty || null,
        DepartmentDesc: values.DepartmentDesc || null,
      };
      if (departmentToEdit) {
        await updateMutation.mutateAsync({ id: departmentToEdit.Id, data });
        onFormSubmit();
        form.reset();
        return toast({
          title: "Успех",
          description: "Отделът е успешно редактиран.",
        });
      }
      await createMutation.mutateAsync(data);
      onFormSubmit();
      form.reset();
      return toast({
        title: "Успех",
        description: "Отделът е успешно създаден.",
      });
    } catch {
      return toast({
        title: "Грешка",
        description:
          "Възникна грешка при редактиране на отдела. Опитайте отново, или се обадете на администратор.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="max-w-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-2 w-full">
            <div className="w-full">
              <FormField
                control={form.control}
                name="Department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Отдел</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Въведете името на отдела"
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
                name="DepMol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>МОЛ</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Въведете МОЛ на отдела"
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
                name="DepMolDuty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Длъжност на МОЛ</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Въведете длъжността на МОЛ"
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
                name="DeptApproval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Одобрение</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Въведете одобрението на отдела"
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
                name="DeptApprovalDuty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Длъжност на одобрението</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Въведете длъжността на одобрението"
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
                name="DepartmentDesc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Въведете описание на отдела"
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
              variant="ell"
              type="submit"
              disabled={!form.formState.isValid}
            >
              {departmentToEdit ? "Редактирай" : "Запиши"}
            </Button>
            <Button
              variant="outline"
              type="button"
              disabled={form.formState.isSubmitting}
              onClick={(e) => {
                e.preventDefault();
                form.reset({
                  Department: "",
                  DepMol: "",
                  DepMolDuty: "",
                  DeptApproval: "",
                  DeptApprovalDuty: "",
                  DepartmentDesc: "",
                });
              }}
            >
              Изчисти
            </Button>
            {onFormCancel && (
              <Button variant="ghost" type="button" onClick={onFormCancel}>
                Отказ
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
