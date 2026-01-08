"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  extractExcelZarabotki,
  mapperZarabotki,
} from "@/excel/extractExcelZarabotki";
import { api } from "@/trpc/react";
import type {
  CreateZarabotkiInput,
  HermesZarabotki,
} from "@/server/repositories/hermes/types.zarabotki";
import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, Check, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { NoResults } from "@/components/NoResults";
import { logError } from "@/lib/logger/logger";
import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";

export default function ZarabotkiEquipmentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<HermesZarabotki[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const replaceMutation = api.hermes.zarabotki.replace.useMutation({
    onSuccess: () => {
      // Clear the form after successful submission
      setData([]);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return toast({
        title: "Успех",
        description: "Данните са успешно добавени в системата.",
      });
    },
    onError: (error) => {
      setError(error.message);
      logError(
        "ZarabotkiEquipments: Error sending zarabotki data:",
        error.message,
      );
      return toast({
        title: "Грешка",
        variant: "destructive",
        description: "Грешка при изпращане на данните. Моля опитайте отново.",
      });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsProcessing(true);
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      try {
        setFile(file);
        if (!file.name.includes("xlsx") && !file.name.includes("xls")) {
          throw new Error("Invalid file format");
        }

        const excelData = await extractExcelZarabotki(file);

        if (
          !excelData ||
          excelData.length === 0 ||
          excelData.filter((item) => !!item["Код на машина"]).length === 0
        ) {
          throw new Error("No valid data from file");
        }

        const formattedData: HermesZarabotki[] = mapperZarabotki(excelData);
        setData(formattedData);
      } catch (err) {
        setData([]);
        setError(err instanceof Error ? err.message : "Unknown error");
        logError("ZarabotkiEquipments: Error processing file:", err, {
          file: file?.name ?? "Unknown file",
        });
        setIsProcessing(false);
        return toast({
          title: "Грешка",
          variant: "destructive",
          description: "Грешка при обработка на файла. Моля проверете формата.",
        });
      }
    }
    setIsProcessing(false);
  };

  const handleSendData = async () => {
    if (data.length === 0) {
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      const zarabotki: CreateZarabotkiInput[] = data.filter(
        (item) => !!item.Код_на_машина,
      );

      if (zarabotki.length === 0) {
        logError("ZarabotkiEquipments: No valid data to send:", {
          dataExample: data[0],
        });
        setIsSending(false);
        return toast({
          title: "Грешка",
          variant: "destructive",
          description:
            "Няма валидни данни за изпращане. Моля проверете данните.",
        });
      }

      await replaceMutation.mutateAsync(zarabotki);
    } catch (err: any) {
      logError("ZarabotkiEquipments: Error sending zarabotki data:", err, {
        dataExample: data[0],
      });

      setError(err?.message ?? "Unknown error");
      return toast({
        title: "Грешка",
        variant: "destructive",
        description: "Грешка при изпращане на данните. Моля опитайте отново.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppLayout>
      <Container
        title="Заработки по оборудване"
        description="Качване и обновяване на заработки от Excel файл"
      >
        <div className="space-y-6">
          {/* File Upload Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="text-ell-primary h-5 w-5" />
                Качване на файл
              </CardTitle>
              <CardDescription>
                Изберете Excel файл (.xlsx или .xls) за обработка на месечен
                план
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="excel-file">Excel файл</Label>
                <Input
                  id="excel-file"
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isProcessing || replaceMutation.isPending}
                />
              </div>

              {isProcessing && (
                <div className="bg-muted/50 flex animate-pulse items-center gap-3 rounded-lg border p-4">
                  <div className="border-primary h-5 w-5 animate-spin rounded-full border-b-2"></div>
                  <span className="text-sm font-medium">
                    Обработване на файла...
                  </span>
                </div>
              )}

              {file && !isProcessing && !error && (
                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Файлът е успешно качен
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {file.name}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Table */}
          {data.length > 0 && !isProcessing && (
            <Card className="animate-in fade-in-50 shadow-lg duration-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Данни от файла
                      <Badge variant="secondary" className="ml-2">
                        {data.filter((item) => !!item.Код_на_машина).length}{" "}
                        записа
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Преглед на данните преди изпращане
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-md border">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">
                            Година
                          </TableHead>
                          <TableHead className="font-semibold">Месец</TableHead>
                          <TableHead className="font-semibold">Цех</TableHead>
                          <TableHead className="font-semibold">Звено</TableHead>
                          <TableHead className="font-semibold">
                            Код на машина
                          </TableHead>
                          <TableHead className="font-semibold">
                            Показател
                          </TableHead>
                          <TableHead className="text-right font-semibold">
                            Количество
                          </TableHead>
                          <TableHead className="text-right font-semibold">
                            Сума (лв)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data
                          .filter((item) => !!item.Код_на_машина)
                          .map((item, index) => (
                            <TableRow
                              key={index}
                              className="hover:bg-muted/50 transition-colors"
                            >
                              <TableCell className="font-medium">
                                {item.Година}
                              </TableCell>
                              <TableCell>{item.Месец}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.Цех}</Badge>
                              </TableCell>
                              <TableCell>{item.Звено}</TableCell>
                              <TableCell>
                                <code className="bg-muted rounded px-2 py-1 font-mono text-sm">
                                  {item.Код_на_машина}
                                </code>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {item.Показател}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {item.Количество_показател?.toFixed(2) ||
                                  "0.00"}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {item.Общо_сума?.toFixed(2) || "0.00"}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!isProcessing && data.length === 0 && !file && (
            <Card className="shadow-lg">
              <CardContent>
                <NoResults
                  title="Няма качени данни"
                  description="Качете Excel файл със заработки на оборудване"
                  icon={
                    <FileSpreadsheet className="text-ell-primary/50 size-12" />
                  }
                />
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {data.length > 0 && (
            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setData([]);
                  setFile(null);
                  setError(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                disabled={
                  isProcessing || isSending || replaceMutation.isPending
                }
                className="min-w-[120px]"
              >
                Изчисти
              </Button>
              <Button
                onClick={handleSendData}
                disabled={
                  data.length === 0 ||
                  isProcessing ||
                  isSending ||
                  replaceMutation.isPending
                }
                className="min-w-[120px]"
                variant="ell"
              >
                {isSending || replaceMutation.isPending ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Изпращане...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Изпрати
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </Container>
    </AppLayout>
  );
}
