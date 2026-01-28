"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import type { DmaDepartment } from "@/server/repositories/dma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { departmentsColumns } from "@/components/dma/departments/columnsDepartments";
import { DepartmentsForm } from "@/components/dma/departments/formDepartments";
import { DataTableDepartments } from "@/components/dma/departments/tableDepartments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Building2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { NoResults } from "@/components/NoResults";
import { toast } from "@/components/ui/toast";
import { Container } from "@/components/Container";

export function DepartmentsPageClient() {
  const utils = api.useUtils();
  const [departments] = api.dma.departments.getAll.useSuspenseQuery(undefined);
  const deleteDepartment = api.dma.departments.delete.useMutation({
    onSuccess: () => {
      void utils.dma.departments.getAll.invalidate();
      toast({
        title: "Успешно изтриване",
        description: "Дирекцията беше успешно изтрита.",
      });
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description: error.message || "Възникна грешка при изтриването на дирекцията.",
        variant: "destructive",
      });
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<
    DmaDepartment | undefined
  >(undefined);


  const handleEdit = (department: DmaDepartment) => {
    setDepartmentToEdit(department);
    setShowForm(true);
  };

  const handleDelete = async (department: DmaDepartment) => {
    await deleteDepartment.mutateAsync({ id: department.Id })
  };

  return (
    <Container
      title="Дирекции"
      description="Добавяне, управление и преглед на всички дирекции"
      headerChildren={

        < div className="mb-4 flex justify-end">
          <Button
            onClick={() => {
              setShowForm((curr) => !curr);
              if (showForm) {
                setDepartmentToEdit(undefined);
              }
            }}
            variant={showForm ? "outline" : "ell"}
            size="lg"
            className={cn(
              "gap-2 transition-all duration-300 ease-in-out",
              showForm &&
              "text-ell-primary hover:text-ell-primary shadow-ell-primary/40",
            )}
          >
            {!showForm ? (
              <>
                <Plus className="animate-in fade-in spin-in-0 h-5 w-5 duration-300" />
                <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                  Добави дирекция
                </span>
              </>
            ) : (
              <>
                <X className="animate-in fade-in spin-in-90 h-5 w-5 duration-300" />
                <span className="animate-in fade-in slide-in-from-right-2 duration-300">
                  Затвори
                </span>
              </>
            )}
          </Button>
        </div>
      }
    >
      {/* Add/Edit Form */}
      {
        showForm && (
          <Card className="mb-4 shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <Plus className="text-ell-primary h-5 w-5" />
                <div>
                  <CardTitle className="text-xl">
                    {departmentToEdit
                      ? "Редактиране на дирекция"
                      : "Добавяне на нова дирекция"}
                  </CardTitle>
                  <CardDescription>
                    Попълнете формата за създаване или редакция на дирекция
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DepartmentsForm
                departmentToEdit={departmentToEdit ?? null}
                onFormSubmit={() => {
                  void utils.dma.departments.getAll.invalidate();
                  setShowForm(false);
                  setDepartmentToEdit(undefined);
                }}
                onFormCancel={() => {
                  setShowForm(false);
                  setDepartmentToEdit(undefined);
                }}
              />
            </CardContent>
          </Card>
        )
      }

      {/* Departments List */}
      {
        !showForm && (
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Списък с дирекции</CardTitle>
                  <CardDescription>
                    Преглед и управление на съществуващи дирекции
                  </CardDescription>
                </div>
                {departments && (
                  <Badge variant="outline" className="text-ell-primary text-sm">
                    {departments.length}{" "}
                    {departments.length === 1 ? "дирекция" : "дирекции"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {(!departments || departments.length === 0) && (
                <NoResults
                  icon={<Building2 className="text-ell-primary/50 size-12" />}
                  title="Няма добавени дирекции"
                  description="Започнете като добавите първата дирекция чрез бутона отгоре"
                />
              )}

              {departments?.length > 0 && (
                <DataTableDepartments
                  columns={departmentsColumns({
                    actions: {
                      edit: handleEdit,
                      delete: (department) => {
                        void handleDelete(department);
                      },
                    },
                  })}
                  data={departments}
                />
              )}
            </CardContent>
          </Card>
        )
      }
    </Container >
  );
}
