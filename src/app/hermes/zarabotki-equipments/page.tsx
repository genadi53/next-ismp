"use client";

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, Check, AlertCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { read, utils } from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ZarabotkaRow {
  EqmtId: number;
  Amount: number;
}

export default function ZarabotkiEquipmentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ZarabotkaRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const replaceMutation = api.hermes.zarabotki.replace.useMutation({
    onSuccess: () => {
      toast.success("Успешно", {
        description: "Заработките са успешно обновени.",
      });
      setFile(null);
      setPreviewData([]);
    },
    onError: (error) => {
      toast.error("Грешка", {
        description: error.message || "Възникна грешка при обновяването.",
      });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Грешка", {
        description: "Моля изберете Excel файл (.xlsx или .xls)",
      });
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      // Read the file
      const data = await selectedFile.arrayBuffer();
      const workbook = read(data);

      // Get the first sheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json<any>(worksheet);

      // Map data to expected format
      // Assuming columns are: EqmtId, Amount
      const mappedData: ZarabotkaRow[] = jsonData.map((row: any) => ({
        EqmtId: parseInt(row.EqmtId || row.eqmtId || row.EquipmentId || "0"),
        Amount: parseFloat(row.Amount || row.amount || row.Sum || "0"),
      }));

      setPreviewData(mappedData);
      toast.success("Файлът е зареден успешно", {
        description: `Открити са ${mappedData.length} записа`,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Грешка", {
        description: "Възникна грешка при обработката на файла.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (previewData.length === 0) {
      toast.error("Грешка", {
        description: "Няма данни за изпращане. Моля заредете файл.",
      });
      return;
    }

    await replaceMutation.mutateAsync({ data: previewData });
  };

  const handleClear = () => {
    setFile(null);
    setPreviewData([]);
  };

  return (
    <AppLayout>
      <Container
        title="Заработки по оборудване"
        description="Качване и обновяване на заработки от Excel файл"
      >
        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Качване на Excel файл
              </CardTitle>
              <CardDescription>
                Изберете Excel файл (.xlsx или .xls) съдържащ данни за заработки по оборудване
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Excel файл</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={isProcessing || replaceMutation.isPending}
                    className="cursor-pointer"
                  />
                  {file && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClear}
                      disabled={isProcessing || replaceMutation.isPending}
                    >
                      Изчисти
                    </Button>
                  )}
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Формат на файла</AlertTitle>
                <AlertDescription>
                  Excel файлът трябва да съдържа колони: <strong>EqmtId</strong> (ID на оборудване) и{" "}
                  <strong>Amount</strong> (сума).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Preview Section */}
          {previewData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Преглед на данни</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {previewData.length} {previewData.length === 1 ? "запис" : "записа"}
                  </span>
                </CardTitle>
                <CardDescription>
                  Прегледайте данните преди да ги запишете в системата
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-auto max-h-96">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-semibold">№</TableHead>
                        <TableHead className="font-semibold">ID на оборудване</TableHead>
                        <TableHead className="font-semibold text-right">Сума</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{row.EqmtId}</TableCell>
                          <TableCell className="text-right">
                            {row.Amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    disabled={replaceMutation.isPending}
                  >
                    Отказ
                  </Button>
                  <Button
                    variant="ell"
                    onClick={handleSubmit}
                    disabled={replaceMutation.isPending}
                    className="gap-2"
                  >
                    {replaceMutation.isPending ? (
                      <>Изпращане...</>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Запази заработки
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions Card */}
          {previewData.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Инструкции</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ol className="list-decimal list-inside space-y-2">
                  <li>Подгответе Excel файл с данни за заработки</li>
                  <li>Уверете се, че файлът съдържа колоните: EqmtId и Amount</li>
                  <li>Изберете файла чрез бутона за качване</li>
                  <li>Прегледайте данните в таблицата</li>
                  <li>Натиснете "Запази заработки" за да актуализирате системата</li>
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>
    </AppLayout>
  );
}

