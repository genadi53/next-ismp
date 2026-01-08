"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import type { HermesEquipment } from "@/server/repositories/hermes/types.equipment";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Wrench } from "lucide-react";
import { cn } from "@/lib/cn";
import { NoResults } from "@/components/NoResults";
import { toast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTableEquipment } from "@/components/hermes/equipment/tableEquipment";
import { equipmentColumns } from "@/components/hermes/equipment/columnsEquipment";
import { EquipmentForm } from "@/components/hermes/equipment/formEquipment";
import { Container } from "@/components/Container";

export function EquipmentsPageClient() {
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [equipmentToEdit, setEquipmentToEdit] =
    useState<HermesEquipment | null>(null);
  const [equipmentToDelete, setEquipmentToDelete] =
    useState<HermesEquipment | null>(null);

  const [equipments] = api.hermes.equipments.getAll.useSuspenseQuery();
  const utils = api.useUtils();
  const deleteMutation = api.hermes.equipments.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Оборудването е изтрито успешно.",
      });
      utils.hermes.equipments.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description: error.message || "Възникна грешка при изтриването.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (equipment: HermesEquipment) => {
    setEquipmentToEdit(equipment);
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleDelete = (equipment: HermesEquipment) => {
    setEquipmentToDelete(equipment);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!equipmentToDelete) return;

    try {
      await deleteMutation.mutateAsync({ id: equipmentToDelete.Id });
      setShowDeleteDialog(false);
      setEquipmentToDelete(null);
    } catch (error) {
      console.error("Error deleting equipment:", error);
    }
  };

  const handleFormSuccess = () => {
    setEquipmentToEdit(null);
    setShowForm(false);
  };

  return (
    <Container
      title="Управление на оборудване"
      description="Добавяне на оборудване в системата Hermes"
      headerChildren={
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => {
              if (showForm) {
                setEquipmentToEdit(null);
                setShowForm(false);
              } else {
                setEquipmentToEdit(null);
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
                <span>Добави Оборудване</span>
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
      {/* Form Section */}
      {showForm && (
        <Card className="mb-4 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Wrench className="text-primary h-6 w-6" />
              <div>
                <CardTitle className="text-xl">
                  {equipmentToEdit
                    ? "Редактиране на оборудване"
                    : "Добави ново оборудване"}
                </CardTitle>
                <CardDescription>
                  {equipmentToEdit
                    ? "Актуализирайте данните за избраното оборудване"
                    : "Попълнете формата за да добавите ново оборудване в системата"}
                </CardDescription>
              </div>
            </div>
            {equipmentToEdit && (
              <Badge variant="secondary" className="ml-2">
                Режим на редакция
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <EquipmentForm
              equipmentToEdit={equipmentToEdit}
              onSuccess={handleFormSuccess}
            />
          </CardContent>
        </Card>
      )}

      {/* Table Section */}
      {!showForm && (
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Списък с оборудване</CardTitle>
                <CardDescription>
                  Преглед и управление на съществуващо оборудване
                </CardDescription>
              </div>
              {equipments && (
                <Badge variant="outline" className="text-ell-primary text-sm">
                  {equipments.length}{" "}
                  {equipments.length === 1 ? "единица" : "единици"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {equipments && equipments.length === 0 && (
              <NoResults
                title="Няма добавено оборудване"
                description="Започнете като добавите първото оборудване чрез формата отгоре"
                icon={<Wrench className="text-ell-primary/50 size-12" />}
              />
            )}

            {equipments && equipments.length > 0 && (
              <DataTableEquipment
                columns={equipmentColumns({
                  actions: {
                    edit: handleEdit,
                    delete: handleDelete,
                  },
                })}
                data={equipments}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Сигурни ли сте, че искате да изтриете{" "}
              {equipmentToDelete
                ? `${equipmentToDelete.EqmtName}`
                : "това оборудване"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Това действие не може да бъде отменено. Оборудването ще бъде
              изтрито перманентно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEquipmentToDelete(null)}>
              Отказ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Изтрий
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
}
