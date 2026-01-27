"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import type { DmaAsset } from "@/server/repositories/dma/types.assets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Package } from "lucide-react";
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
import { assetsColumns } from "@/components/dma/assets/columnsAssets";
import { AssetsForm } from "@/components/dma/assets/formAssets";
import { DataTableAssets } from "@/components/dma/assets/tableAssets";

export function AssetsPageClient() {
  const [showForm, setShowForm] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<DmaAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<DmaAsset | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const utils = api.useUtils();
  const [assets] = api.dma.assets.getAll.useSuspenseQuery(undefined);

  const deleteMutation = api.dma.assets.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Активът е изтрит успешно.",
      });
      utils.dma.assets.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description:
          error.message || "Възникна грешка при изтриването на актива.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (asset: DmaAsset) => {
    setAssetToEdit(asset);
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleDelete = (asset: DmaAsset) => {
    setAssetToDelete(asset);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;

    try {
      await deleteMutation.mutateAsync({ id: assetToDelete.Id });
      setShowDeleteDialog(false);
      setAssetToDelete(null);
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  const handleCancelEdit = () => {
    setAssetToEdit(null);
    setShowForm(false);
  };

  return (
    <>
      {/* Header Button */}
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setAssetToEdit(null);
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
              <span>Нов актив</span>
            </>
          ) : (
            <>
              <X className="h-5 w-5" />
              <span>Затвори</span>
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="text-primary h-6 w-6" />
                <div>
                  <CardTitle className="text-xl">
                    {assetToEdit ? "Редактиране на актив" : "Нов актив"}
                  </CardTitle>
                  <CardDescription>
                    {assetToEdit
                      ? "Актуализирайте данните за избрания актив"
                      : "Попълнете формата за добавяне на нов актив"}
                  </CardDescription>
                </div>
              </div>
              {assetToEdit && (
                <Badge variant="secondary" className="ml-2">
                  Режим на редакция
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <AssetsForm
              assetToEdit={assetToEdit}
              onFormSubmit={() => {
                utils.dma.assets.getAll.invalidate();
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
                <CardTitle className="text-xl">Всички активи</CardTitle>
                <CardDescription>
                  Преглед и управление на съществуващи активи
                </CardDescription>
              </div>
              {assets && (
                <Badge variant="outline" className="text-ell-primary text-sm">
                  {assets.length} {assets.length === 1 ? "актив" : "актива"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {assets && assets.length === 0 && (
              <NoResults
                title="Няма намерени активи"
                description="Опитайте отново или се свържете с администратор."
                icon={<Package className="text-ell-primary/50 size-12" />}
              />
            )}

            {assets && assets.length > 0 && (
              <DataTableAssets
                columns={assetsColumns({
                  actions: {
                    edit: handleEdit,
                    delete: handleDelete,
                  },
                })}
                data={assets}
              />
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сигурни ли сте?</AlertDialogTitle>
            <AlertDialogDescription>
              Това действие не може да бъде отменено. Активът {assetToDelete?.Name ?? null} ще бъде изтрит
              перманентно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAssetToDelete(null)}>
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
