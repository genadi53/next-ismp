"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, FileText, Pencil, Plus, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { DocumentSupplierForm } from "@/components/dma/documents/DocumentSupplierForm";
import { DocumentAssetDetailForm } from "@/components/dma/documents/DocumentAssetDetailForm";
import type { DmaDocumentSupplier } from "@/server/repositories/dma/types.documents";
import type { DmaDocumentAsset } from "@/server/repositories/dma/types.documents";
import { Container } from "@/components/Container";

type Props = {
  documentId: number;
};

export function DocumentDetailClient({ documentId }: Props) {
  const router = useRouter();
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<DmaDocumentSupplier | null>(null);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DmaDocumentAsset | null>(null);

  const [document] = api.dma.documents.getById.useSuspenseQuery({
    id: documentId,
  });

  const [suppliers] = api.dma.documents.getSuppliers.useSuspenseQuery({
    documentId,
  });

  const [assets] = api.dma.documents.getAssets.useSuspenseQuery({
    documentId,
  });

  const requestEditMutation = api.dma.documents.requestEdit.useMutation({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Заявката за редакция е изпратена успешно.",
      });
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description:
          error.message || "Възникна грешка при изпращането на заявката.",
        variant: "destructive",
      });
    },
  });

  const handleRequestEdit = () => {
    requestEditMutation.mutate({
      docId: documentId,
      requestedFrom: "current-user", // TODO: Get from auth context
    });
  };

  const handlePrint = () => {
    router.push(`/dma/documents/${documentId}/print`);
  };

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3 py-12">
        <div className="bg-destructive/10 rounded-full p-3">
          <AlertCircle className="text-destructive h-8 w-8" />
        </div>
        <div className="text-center">
          <h3 className="text-destructive mb-1 text-lg font-semibold">
            Документът не е намерен
          </h3>
          <p className="text-muted-foreground">
            Документ с ID {documentId} не съществува в системата.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Container
      title={`Документ #${documentId}`}
      description="Детайли за документа"
      headerChildren={
        <div className="flex justify-end gap-3">
          <Button onClick={handleRequestEdit} variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Заяви редакция
          </Button>
          <Button onClick={handlePrint} variant="ell">
            <Printer className="mr-2 h-4 w-4" />
            Отпечатай
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Document Details */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <FileText className="text-primary h-6 w-6" />
              <div>
                <CardTitle className="text-xl">Информация за документа</CardTitle>
                <CardDescription>Основни данни за документа</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <div className="text-muted-foreground mb-1 text-sm">
                  Тип документ
                </div>
                <div className="font-medium">
                  {document.Doctype === 1
                    ? "Акт за приемане на ДМА"
                    : "Акт за приемане на ДМА с реконструкция"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-sm">
                  Дата на документа
                </div>
                <div className="font-medium">{document.DocDate}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-sm">
                  Доставчик
                </div>
                <div className="font-medium">{document.Supplier}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-sm">Дирекция</div>
                <div className="font-medium">{document.Department}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-sm">Фактура</div>
                <div className="font-medium">{document.Inv ?? "Няма"}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-sm">
                  Дата на фактура
                </div>
                <div className="font-medium">{document.InvDate ?? "Няма"}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-sm">
                  Код инвестиция
                </div>
                <div className="font-medium">
                  {document.InvestitionID ?? "Няма"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1 text-sm">Статус</div>
                <div>
                  {document.IsPrinted ? (
                    <Badge variant="default">Отпечатан</Badge>
                  ) : (
                    <Badge variant="destructive">Не е отпечатан</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                Доставчици ({suppliers.length})
              </CardTitle>
              <Button
                size="sm"
                variant={showSupplierForm && !editingSupplier ? "outline" : "ell"}
                onClick={() => {
                  setShowSupplierForm((s) => !s);
                  setEditingSupplier(null);
                }}
              >
                {showSupplierForm && !editingSupplier ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Затвори
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Добави доставчик
                  </>
                )}
              </Button>
            </div>
            <CardDescription>
              Управление на доставчици за документа
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(showSupplierForm || editingSupplier) && (
              <div className="mb-6 rounded-lg border bg-muted/50 p-4">
                <DocumentSupplierForm
                  documentId={documentId}
                  supplierToEdit={editingSupplier}
                  onSuccess={() => {
                    setShowSupplierForm(false);
                    setEditingSupplier(null);
                  }}
                  onCancel={() => {
                    setShowSupplierForm(false);
                    setEditingSupplier(null);
                  }}
                />
              </div>
            )}
            {suppliers.length === 0 && !showSupplierForm && !editingSupplier ? (
              <p className="text-muted-foreground py-4 text-center">
                Няма добавени доставчици
              </p>
            ) : (
              <div className="space-y-2">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">{supplier.Supplier}</div>
                      {supplier.DocSuplAmount != null && (
                        <div className="text-muted-foreground text-sm">
                          Сума: {supplier.DocSuplAmount} лв.
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSupplier(supplier);
                        setShowSupplierForm(false);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assets */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Активи ({assets.length})</CardTitle>
              <Button
                size="sm"
                variant={showAssetForm && !editingAsset ? "outline" : "ell"}
                onClick={() => {
                  setShowAssetForm((s) => !s);
                  setEditingAsset(null);
                }}
              >
                {showAssetForm && !editingAsset ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Затвори
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Добави детайл
                  </>
                )}
              </Button>
            </div>
            <CardDescription>
              Списък с детайли на активи за документа
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(showAssetForm || editingAsset) && (
              <div className="mb-6 rounded-lg border bg-muted/50 p-4">
                <DocumentAssetDetailForm
                  documentId={documentId}
                  assetToEdit={editingAsset}
                  onSuccess={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                  }}
                  onCancel={() => {
                    setShowAssetForm(false);
                    setEditingAsset(null);
                  }}
                />
              </div>
            )}
            {assets.length === 0 && !showAssetForm && !editingAsset ? (
              <p className="text-muted-foreground py-4 text-center">
                Няма добавени активи
              </p>
            ) : (
              <div className="space-y-2">
                {assets.map((asset) => (
                  <div key={asset.Id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">
                        {asset.ComponentName}{" "}
                        {asset.ComponentMarka && `- ${asset.ComponentMarka}`}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {asset.CompUnits != null && `Брой: ${asset.CompUnits} | `}
                        {asset.Price != null && `Цена: ${asset.Price} лв.`}
                        {asset.SerialNum && ` | SN: ${asset.SerialNum}`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingAsset(asset);
                        setShowAssetForm(false);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
