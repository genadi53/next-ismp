"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import type { DmaDocument } from "@/types/dma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTableDocuments } from "@/components/dma/documents/tableDocuments";
import { columnsDocuments } from "@/components/dma/documents/columnsDocuments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, FileText } from "lucide-react";
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

export function DocumentsPageClient() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DmaDocument | null>(
    null,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [documents] = api.dma.documents.getAll.useSuspenseQuery(undefined);

  const utils = api.useUtils();
  const deleteMutation = api.dma.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Успешно", {
        description: "Документът е изтрит успешно.",
      });
      utils.dma.documents.getAll.invalidate();
    },
    onError: (error) => {
      toast.error("Грешка", {
        description:
          error.message || "Възникна грешка при изтриването на документа.",
      });
    },
  });

  const handlePrint = (document: DmaDocument) => {
    router.push(`/dma/documents/${document.ID}/print`);
  };

  const handleEdit = (document: DmaDocument) => {
    router.push(`/dma/documents/${document.ID}`);
  };

  const handleDelete = (document: DmaDocument) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await deleteMutation.mutateAsync({ id: documentToDelete.ID });
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  return (
    <>
      {/* Header Button */}
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => setShowForm((curr) => !curr)}
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
                Нов документ
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

      {/* Form Section - placeholder for now */}
      {showForm && (
        <Card className="animate-in fade-in slide-in-from-top-4 mb-4 shadow-lg duration-500">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Нов документ</CardTitle>
            <CardDescription>
              Формата за създаване на документ ще бъде добавена скоро
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Функционалността за създаване на документи ще бъде имплементирана
              в следващ етап.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Table Section */}
      {!showForm && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 shadow-lg duration-500">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Списък с документи</CardTitle>
                <CardDescription>
                  Преглед и управление на съществуващи документи
                </CardDescription>
              </div>
              {documents && (
                <Badge variant="outline" className="text-ell-primary text-sm">
                  {documents.length}{" "}
                  {documents.length === 1 ? "документ" : "документа"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {documents && documents.length === 0 && (
              <NoResults
                title="Няма намерени документи"
                description="Опитайте отново или се свържете с администратор."
                icon={<FileText className="text-ell-primary/50 size-12" />}
              />
            )}

            {documents && documents.length > 0 && (
              <DataTableDocuments
                columns={columnsDocuments({
                  actions: {
                    delete: handleDelete,
                    edit: handleEdit,
                    print: handlePrint,
                  },
                })}
                data={documents}
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
              Това действие не може да бъде отменено. Документът ще бъде изтрит
              перманентно.
              {documentToDelete && (
                <div className="bg-muted mt-2 rounded p-2">
                  <strong>Документ ID:</strong> {documentToDelete.ID}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocumentToDelete(null)}>
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
