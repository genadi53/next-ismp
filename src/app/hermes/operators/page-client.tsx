"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import type { HermesOperator } from "@/server/repositories/hermes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, UsersRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { NoResults } from "@/components/NoResults";
import { toast } from "sonner";
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
import { DataTableOperators } from "@/components/hermes/operators/tableOperators";
import { operatorColumns } from "@/components/hermes/operators/columnsOperators";
import { OperatorsForm } from "@/components/hermes/operators/formOperators";

export function OperatorsPageClient() {
  const [showForm, setShowForm] = useState(false);
  const [operatorToEdit, setOperatorToEdit] = useState<
    HermesOperator | undefined
  >(undefined);
  const [operatorToDelete, setOperatorToDelete] =
    useState<HermesOperator | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [operators] = api.hermes.operators.getAll.useSuspenseQuery();

  const utils = api.useUtils();
  const deleteMutation = api.hermes.operators.delete.useMutation({
    onSuccess: () => {
      toast.success("Успешно", {
        description: "Операторът е изтрит успешно.",
      });
      utils.hermes.operators.getAll.invalidate();
    },
    onError: (error) => {
      toast.error("Грешка", {
        description: error.message || "Възникна грешка при изтриването.",
      });
    },
  });

  const handleEdit = (operator: HermesOperator) => {
    setOperatorToEdit(operator);
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleDelete = (operator: HermesOperator) => {
    setOperatorToDelete(operator);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!operatorToDelete) return;

    try {
      await deleteMutation.mutateAsync({ id: operatorToDelete.Id });
      setShowDeleteDialog(false);
      setOperatorToDelete(null);
    } catch (error) {
      console.error("Error deleting operator:", error);
    }
  };

  const handleFormSuccess = () => {
    setOperatorToEdit(undefined);
    setShowForm(false);
  };

  return (
    <>
      {/* Header Button */}
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            if (showForm) {
              setOperatorToEdit(undefined);
              setShowForm(false);
            } else {
              setOperatorToEdit(undefined);
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
              <span>Добави Оператор</span>
            </>
          ) : (
            <>
              <X className="h-5 w-5" />
              <span>Затвори</span>
            </>
          )}
        </Button>
      </div>

      {/* Form Section */}
      {showForm && (
        <Card className="mb-4 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <UsersRound className="text-primary h-6 w-6" />
              <div>
                <CardTitle className="text-xl">
                  {operatorToEdit
                    ? "Редактиране на оператор"
                    : "Добави нов оператор"}
                </CardTitle>
                <CardDescription>
                  {operatorToEdit
                    ? "Актуализирайте данните за избрания оператор"
                    : "Попълнете формата за да добавите нов оператор в системата"}
                </CardDescription>
              </div>
            </div>
            {operatorToEdit && (
              <Badge variant="secondary" className="ml-2">
                Режим на редакция
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <OperatorsForm
              operatorToEdit={operatorToEdit}
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
                <CardTitle className="text-xl">Списък с оператори</CardTitle>
                <CardDescription>
                  Преглед и управление на съществуващи оператори
                </CardDescription>
              </div>
              {operators && (
                <Badge variant="outline" className="text-ell-primary text-sm">
                  {operators.length}{" "}
                  {operators.length === 1 ? "оператор" : "оператори"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {operators && operators.length === 0 && (
              <NoResults
                title="Няма добавени оператори"
                description="Започнете като добавите първия оператор чрез формата отгоре"
                icon={<UsersRound className="text-ell-primary/50 size-12" />}
              />
            )}

            {operators && operators.length > 0 && (
              <DataTableOperators
                columns={operatorColumns({
                  actions: {
                    edit: handleEdit,
                    delete: handleDelete,
                  },
                })}
                data={operators}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сигурни ли сте?</AlertDialogTitle>
            <AlertDialogDescription>
              Това действие не може да бъде отменено. Операторът ще бъде изтрит
              перманентно.
              {operatorToDelete && (
                <div className="bg-muted mt-2 rounded p-2">
                  <strong>Оператор:</strong> {operatorToDelete.OperatorName}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOperatorToDelete(null)}>
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
    </>
  );
}
