"use client";

import { useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/spinner";
import { AlertCircle, FileText, Pencil, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = Number(params.documentId);

  const { data: document, isLoading, isError } = api.dma.documents.getById.useQuery(
    { id: documentId },
    { enabled: !!documentId }
  );

  const { data: suppliers = [] } = api.dma.documents.getSuppliers.useQuery(
    { documentId },
    { enabled: !!documentId }
  );

  const { data: assets = [] } = api.dma.documents.getAssets.useQuery(
    { documentId },
    { enabled: !!documentId }
  );

  const utils = api.useUtils();
  const requestEditMutation = api.dma.documents.requestEdit.useMutation({
    onSuccess: () => {
      toast.success("Успешно", {
        description: "Заявката за редакция е изпратена успешно.",
      });
    },
    onError: (error) => {
      toast.error("Грешка", {
        description: error.message || "Възникна грешка при изпращането на заявката.",
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

  if (isLoading) {
    return (
      <AppLayout>
        <Container title="Зареждане...">
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" label="Зареждане на документ..." showLabel />
          </div>
        </Container>
      </AppLayout>
    );
  }

  if (isError || !document) {
    return (
      <AppLayout>
        <Container title="Грешка">
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-1 text-destructive">
                Документът не е намерен
              </h3>
              <p className="text-muted-foreground">
                Документ с ID {documentId} не съществува в системата.
              </p>
            </div>
          </div>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container
        title={`Документ #${document.Id}`}
        description="Детайли за документа"
      >
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex gap-3 justify-end">
            <Button onClick={handleRequestEdit} variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Заяви редакция
            </Button>
            <Button onClick={handlePrint} variant="default">
              <Printer className="mr-2 h-4 w-4" />
              Отпечатай
            </Button>
          </div>

          {/* Document Details */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-xl">Информация за документа</CardTitle>
                  <CardDescription>Основни данни за документа</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Тип документ</div>
                  <div className="font-medium">
                    {document.Doctype === 1 ? "Акт за приемане на ДМА" : "Акт за приемане на ДМА с реконструкция"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Дата на документа</div>
                  <div className="font-medium">{document.DocDate}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Доставчик</div>
                  <div className="font-medium">{document.Supplier}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Дирекция</div>
                  <div className="font-medium">{document.Department}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Фактура</div>
                  <div className="font-medium">{document.Inv || "Няма"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Дата на фактура</div>
                  <div className="font-medium">{document.InvDate || "Няма"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Код инвестиция</div>
                  <div className="font-medium">{document.InvestitionID || "Няма"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Статус</div>
                  <div>
                    {document.IsPrinted ? (
                      <Badge variant="default">Отпечатан</Badge>
                    ) : (
                      <Badge variant="secondary">Не е отпечатан</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suppliers */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-xl">Доставчици ({suppliers.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {suppliers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Няма добавени доставчици
                </p>
              ) : (
                <div className="space-y-2">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{supplier.Supplier}</div>
                      {supplier.DocSuplAmount && (
                        <div className="text-sm text-muted-foreground">
                          Сума: {supplier.DocSuplAmount} лв.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assets */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-xl">Активи ({assets.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {assets.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Няма добавени активи
                </p>
              ) : (
                <div className="space-y-2">
                  {assets.map((asset) => (
                    <div key={asset.Id} className="p-3 border rounded-lg">
                      <div className="font-medium">
                        {asset.ComponentName} {asset.ComponentMarka && `- ${asset.ComponentMarka}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {asset.CompUnits && `Брой: ${asset.CompUnits} | `}
                        {asset.Price && `Цена: ${asset.Price} лв.`}
                        {asset.SerialNum && ` | SN: ${asset.SerialNum}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </AppLayout>
  );
}

