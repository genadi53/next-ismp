"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import type { HermesWorkcard } from "@/server/repositories/hermes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, FileText } from "lucide-react";
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
import { DataTableWorkcards } from "@/components/hermes/workcards/tableWorkcards";
import { workcardsColumns } from "@/components/hermes/workcards/columnsWorkcards";
import { Container } from "@/components/Container";
import { WorkcardForm } from "@/components/hermes/workcards/formWorkcards";

export function WorkcardsPageClient() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [workcardToEdit, setWorkcardToEdit] = useState<
    HermesWorkcard | undefined
  >(undefined);
  const [workcardToDelete, setWorkcardToDelete] =
    useState<HermesWorkcard | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [workcards] = api.hermes.workcards.getAll.useSuspenseQuery();

  const utils = api.useUtils();
  const deleteMutation = api.hermes.workcards.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Работната карта е изтрита успешно.",
      });
      void utils.hermes.workcards.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description: error.message || "Възникна грешка при изтриването.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = useCallback((workcard: HermesWorkcard) => {
    setWorkcardToEdit(workcard);
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }, []);

  const handlePrint = useCallback(
    (workcard: HermesWorkcard) => {
      router.push(`/hermes/workcards/${workcard.Id}/print`);
    },
    [router],
  );

  const handleDelete = useCallback((workcard: HermesWorkcard) => {
    setWorkcardToDelete(workcard);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = async () => {
    if (!workcardToDelete) return;

    try {
      await deleteMutation.mutateAsync({ id: workcardToDelete.Id });
      setShowDeleteDialog(false);
      setWorkcardToDelete(null);
    } catch (error) {
      console.error("Error deleting workcard:", error);
    }
  };

  const handleFormSuccess = () => {
    setWorkcardToEdit(undefined);
    setShowForm(false);
  };

  const columns = useMemo(
    () =>
      workcardsColumns({
        actions: {
          edit: handleEdit,
          print: handlePrint,
          delete: handleDelete,
        },
      }),
    [handleEdit, handlePrint, handleDelete],
  );

  return (
    <Container
      title="Управление на работни карти"
      description="Добавяне и редакция на работни карти в системата Hermes"
      headerChildren={
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => {
              if (showForm) {
                setWorkcardToEdit(undefined);
                setShowForm(false);
              } else {
                setWorkcardToEdit(undefined);
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
                <span>Добави Работна карта</span>
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
              <FileText className="text-primary h-6 w-6" />
              <div>
                <CardTitle className="text-xl">
                  {workcardToEdit
                    ? "Редактиране на работна карта"
                    : "Добави нова работна карта"}
                </CardTitle>
                <CardDescription>
                  {workcardToEdit
                    ? "Актуализирайте данните за избраната работна карта"
                    : "Попълнете формата за да добавите нова работна карта в системата"}
                </CardDescription>
              </div>
            </div>
            {workcardToEdit && (
              <Badge variant="secondary" className="ml-2">
                Режим на редакция
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <WorkcardForm
              workcardToEdit={workcardToEdit}
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
                <CardTitle className="text-xl">
                  Списък с работни карти
                </CardTitle>
                <CardDescription>
                  Преглед и управление на съществуващи работни карти
                </CardDescription>
              </div>
              {workcards && (
                <Badge variant="outline" className="text-ell-primary text-sm">
                  {workcards.length}{" "}
                  {workcards.length === 1 ? "карта" : "карти"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {workcards?.length === 0 && (
              <NoResults
                title="Няма добавени работни карти"
                description="Започнете като добавите първата работна карта чрез формата отгоре"
                icon={<FileText className="text-ell-primary/50 size-12" />}
              />
            )}

            {workcards?.length > 0 && (
              <DataTableWorkcards columns={columns} data={workcards} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Сигурни ли сте, че искате да изтриете тази работна карта?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Това действие не може да бъде отменено. Работната карта ще бъде
              изтрита перманентно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorkcardToDelete(null)}>
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
