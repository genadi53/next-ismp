"use client";

import { useState, useRef } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/cn";
import { format } from "date-fns";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { MonthPlanType } from "@/types/plans";
import MonthPlan from "@/components/mp/MonthPlan";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Bulgarian month names
const monthNamesBG: Record<number, string> = {
  1: "Януари",
  2: "Февруари",
  3: "Март",
  4: "Април",
  5: "Май",
  6: "Юни",
  7: "Юли",
  8: "Август",
  9: "Септември",
  10: "Октомври",
  11: "Ноември",
  12: "Декември",
};

export default function MonthPlanPage() {
  const [monthPlanType, setMonthPlanType] = useState<MonthPlanType | undefined>(
    undefined,
  );
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [fileName, setFileName] = useState<string>("");
  const [file, setFile] = useState<File | undefined>(undefined);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [processedData, setProcessedData] = useState<any>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations
  const createPlanOperativenMutation =
    api.minePlanning.operativenPlan.create.useMutation({
      onSuccess: () => {
        toast.success("Успешно", {
          description: "Месечният оперативен план е записан успешно.",
        });
        handleReset();
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message ||
            "Възникна грешка при записването на месечния оперативен план.",
        });
      },
    });

  const createPlanShovelsMutation =
    api.minePlanning.planShovels.create.useMutation({
      onSuccess: () => {
        toast.success("Успешно", {
          description: "Месечният план добив багери е записан успешно.",
        });
        handleReset();
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message ||
            "Възникна грешка при записването на месечния план добив багери.",
        });
      },
    });

  const createPlanNaturalMutation =
    api.minePlanning.naturalPlan.create.useMutation({
      onSuccess: () => {
        toast.success("Успешно", {
          description:
            "Месечният план по одобрени натурални показатели е записан успешно.",
        });
        handleReset();
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message ||
            "Възникна грешка при записването на месечния план по одобрени натурални показатели.",
        });
      },
    });

  const handleReset = () => {
    setIsProcessing(false);
    setMonthPlanType(undefined);
    setDate(undefined);
    setFileName("");
    setProcessedData(undefined);
    setFile(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return toast.error("Грешка при обработка", {
        description: "Моля, изберете файл.",
      });
    }

    // Check if it's an Excel file
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return toast.error("Грешка при обработка", {
        description:
          "Невалиден файл. Моля, изберете Excel файл (.xlsx или .xls)",
      });
    }

    setFileName(file.name);
    setFile(file);
  };

  const extractPlanData = async () => {
    setIsProcessing(true);
    if (!monthPlanType) {
      setIsProcessing(false);
      return toast.error("Грешка при обработка", {
        description: "Моля, изберете вид месечен план.",
      });
    }

    if (!file) {
      handleReset();
      return toast.error("Грешка при обработка", {
        description: "Моля, изберете файл.",
      });
    }

    try {
      // For now, we'll need to implement Excel processing
      // This would require the XLSX library and processing functions
      toast.info("Обработка на файла", {
        description:
          "Excel обработката изисква допълнителна имплементация с xlsx библиотека.",
      });

      // TODO: Implement Excel processing similar to old project
      // const result = await processExcelFile(file, monthPlanType, date);
      // setProcessedData(result);

      setIsProcessing(false);
    } catch (error) {
      console.error("Error processing file:", error);
      handleReset();
      return toast.error("Грешка при обработка", {
        description:
          "Възникна грешка при обработката на файла. Моля, проверете дали файлът е валиден и има правилната структура.",
      });
    }
  };

  const sendPlanData = async () => {
    if (!monthPlanType || !processedData) {
      return toast.error("Грешка при обработка", {
        description: "Моля, изберете вид месечен план и добавете файла.",
      });
    }

    setIsSending(true);

    try {
      switch (monthPlanType) {
        case "Месечен оперативен план":
          await createPlanOperativenMutation.mutateAsync(processedData);
          break;
        case "Месечен ГР Проект":
          // Not implemented
          toast.info("Информация", {
            description: "Месечен ГР Проект все още не е имплементиран.",
          });
          break;
        case "Месечен план добив багери":
          await createPlanShovelsMutation.mutateAsync(processedData);
          break;
        case "Месечен план по одобрени натурални показатели":
          await createPlanNaturalMutation.mutateAsync(processedData);
          break;
        default:
          throw new Error("Невалиден тип на месечен план");
      }
    } catch (error) {
      console.error("Error sending plan data:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppLayout>
      <Container
        title="Месечен план"
        description="Качване на Excel файл за обработка на месечен план"
      >
        <div className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertTitle>Необходима е Excel библиотека</AlertTitle>
            <AlertDescription>
              За пълна функционалност е необходимо да се инсталира библиотеката{" "}
              <code>xlsx</code> и да се имплементират функциите за обработка на
              Excel файлове.
            </AlertDescription>
          </Alert>

          <Separator />

          <div className="flex max-w-lg flex-col gap-4">
            <Select
              onValueChange={(e) => setMonthPlanType(e as MonthPlanType)}
              value={monthPlanType || ""}
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Изберете вид месечен план" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"Месечен оперативен план"}>
                  Месечен оперативен план
                </SelectItem>
                <SelectItem value={"Месечен ГР Проект"}>
                  Месечен ГР Проект
                </SelectItem>
                <SelectItem value={"Месечен план добив багери"}>
                  Месечен план добив багери
                </SelectItem>
                <SelectItem
                  value={"Месечен план по одобрени натурални показатели"}
                >
                  Месечен план по одобрени натурални показатели
                </SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full min-w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  {date ? (
                    monthNamesBG[date.getMonth() + 1] + " " + date.getFullYear()
                  ) : (
                    <span>Изберете месец за който е плана</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date("1900-01-01")}
                />
              </PopoverContent>
            </Popover>

            <Card>
              <CardHeader>
                <CardTitle>Качване на файл</CardTitle>
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
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                </div>

                {isProcessing && (
                  <div className="flex items-center space-x-2">
                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-b-2"></div>
                    <span className="text-muted-foreground text-sm">
                      Обработване на файла...
                    </span>
                  </div>
                )}

                {fileName && !isProcessing && (
                  <div className="text-muted-foreground text-sm">
                    Качен файл: {fileName}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex w-lg flex-row items-center gap-4">
              <Button
                className="w-24"
                variant="ell"
                type="submit"
                disabled={!fileName || isProcessing}
                onClick={async (e) => {
                  e.preventDefault();
                  await extractPlanData();
                }}
              >
                Запиши
              </Button>

              <Button
                className="w-24"
                variant="outline"
                type="reset"
                disabled={isProcessing}
                onClick={(e) => {
                  e.preventDefault();
                  handleReset();
                }}
              >
                Изчисти
              </Button>

              <Button
                className="w-24"
                variant="default"
                type="button"
                disabled={isProcessing || isSending || !processedData}
                onClick={(e) => {
                  e.preventDefault();
                  sendPlanData();
                }}
              >
                Изпрати
              </Button>
            </div>
          </div>

          {/* Display processed data */}
          {processedData && monthPlanType && (
            <div className="mt-8 flex flex-col gap-4">
              <MonthPlan type={monthPlanType} data={processedData} />
            </div>
          )}
        </div>
      </Container>
    </AppLayout>
  );
}
