"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import type { DmaSupplier } from "@/server/repositories/dma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { suppliersColumns } from "@/components/dma/suppliers/columnsSuppliers";
import { SuppliersForm } from "@/components/dma/suppliers/formSuppliers";
import { DataTableSuppliers } from "@/components/dma/suppliers/tableSuppliers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Building2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { NoResults } from "@/components/NoResults";
import { toast } from "@/components/ui/toast";
import { Container } from "@/components/Container";

export function SuppliersPageClient() {
  const utils = api.useUtils();
  const [suppliers] = api.dma.suppliers.getAll.useSuspenseQuery(undefined);
  const deleteSupplierMutation = api.dma.suppliers.delete.useMutation({
    onSuccess: () => {
      utils.dma.suppliers.getAll.invalidate();
      toast({
        title: "Успешно",
        description: "Доставчикът е изтрит успешно.",
      });
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description: error.message || "Възникна грешка при изтриването на доставчика.",
        variant: "destructive",
      });
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<DmaSupplier | undefined>(
    undefined,
  );


  const handleEdit = (supplier: DmaSupplier) => {
    setSupplierToEdit(supplier);
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleDelete = (supplier: DmaSupplier) => {
    deleteSupplierMutation.mutate({ id: supplier.Id })
  };

  const handleCancelEdit = () => {
    setSupplierToEdit(undefined);
    setShowForm(false);
  };

  return (
    <Container
      title="Доставчици"
      description="Управление и преглед на всички доставчици"

      headerChildren={
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => {
              if (showForm) {
                handleCancelEdit();
              } else {
                setSupplierToEdit(undefined);
                setShowForm(true);
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }, 100);
              }
            }}
            variant={showForm ? "outline" : "ell"}
            size="lg"
            className={cn(
              "gap-2 transition-colors duration-200",
              showForm &&
              "text-ell-primary hover:text-ell-primary shadow-ell-primary/40",
            )}
          >
            {!showForm ? (
              <>
                <Plus className="h-5 w-5" />
                <span>Нов доставчик</span>
              </>
            ) : (
              <>
                <X className="h-5 w-5" />
                <span>Затвори</span>
              </>
            )}
          </Button>
        </div>
      }
    >
      {showForm && (
        <Card className="mb-4 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="text-primary h-6 w-6" />
                <div>
                  <CardTitle className="text-xl">
                    {supplierToEdit
                      ? "Редактиране на доставчик"
                      : "Нов доставчик"}
                  </CardTitle>
                  <CardDescription>
                    {supplierToEdit
                      ? "Актуализирайте данните за избрания доставчик"
                      : "Попълнете формата за добавяне на нов доставчик"}
                  </CardDescription>
                </div>
              </div>
              {supplierToEdit && (
                <Badge variant="secondary" className="ml-2">
                  Режим на редакция
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <SuppliersForm
              supplierToEdit={supplierToEdit ?? null}
              onFormSubmit={() => {
                utils.dma.suppliers.getAll.invalidate();
                handleCancelEdit();
              }}
            />
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Всички доставчици</CardTitle>
                <CardDescription>
                  Преглед и управление на съществуващи доставчици
                </CardDescription>
              </div>
              {suppliers && (
                <Badge variant="outline" className="text-ell-primary text-sm">
                  {suppliers.length}{" "}
                  {suppliers.length === 1 ? "доставчик" : "доставчика"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {suppliers && suppliers.length === 0 && (
              <NoResults
                icon={<Building2 className="text-ell-primary/50 size-12" />}
                title="Няма доставчици"
                description="Все още няма добавени доставчици."
              />
            )}

            {suppliers && suppliers.length > 0 && (
              <DataTableSuppliers
                columns={suppliersColumns({
                  actions: {
                    edit: handleEdit,
                    delete: handleDelete,
                  },
                })}
                data={suppliers}
              />
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
