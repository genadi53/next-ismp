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
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";
import type {
  MonthPlanType,
  OperationalPlanInsertArray,
  ShovelPlanInsertArray,
  NaturalIndicatorsPlanInsertArray,
  GRProjectPlanInsertArray,
  PlanInsertTypes,
} from "@/server/repositories/mine-planning";
import MonthPlan from "@/components/mp/MonthPlan";
import { MONTH_NAMES_BG } from "@/lib/constants";
import {
  processExcelMonthPlanShovels,
  processExcelMonthPlanOperativen,
  processExcelMonthPlanNaturalIndicators,
  processExcelMonthPlanGRProject,
} from "@/excel/processExcelMonthPlan";
import {
  monthPlanMapper,
  naturalIndicatorsPlanMapper,
  planShovelsMapper,
  grProjectPlanMapper,
} from "@/lib/planMappers";
import { addWeeks, endOfYear } from "date-fns";

export default function MonthPlanPage() {
  const [monthPlanType, setMonthPlanType] = useState<MonthPlanType | undefined>(
    undefined,
  );
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [fileName, setFileName] = useState<string>("");
  const [file, setFile] = useState<File | undefined>(undefined);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [processedData, setProcessedData] = useState<
    PlanInsertTypes | undefined
  >(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC mutations
  const createPlanOperativenMutation =
    api.minePlanning.operativenPlan.create.useMutation({
      onSuccess: () => {
        toast({
          title: "Успешно",
          description: "Месечният оперативен план е записан успешно.",
        });
        handleReset();
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          description:
            error.message ||
            "Възникна грешка при записването на месечния оперативен план.",
          variant: "destructive",
        });
      },
    });

  const createPlanShovelsMutation =
    api.minePlanning.planShovels.create.useMutation({
      onSuccess: () => {
        toast({
          title: "Успешно",
          description: "Месечният план добив багери е записан успешно.",
        });
        handleReset();
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          description:
            error.message ||
            "Възникна грешка при записването на месечния план добив багери.",
          variant: "destructive",
        });
      },
    });

  const createPlanNaturalMutation =
    api.minePlanning.naturalPlan.create.useMutation({
      onSuccess: () => {
        toast({
          title: "Успешно",
          description:
            "Месечният план по одобрени натурални показатели е записан успешно.",
        });
        handleReset();
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          description:
            error.message ||
            "Възникна грешка при записването на месечния план по одобрени натурални показатели.",
          variant: "destructive",
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
      return toast({
        title: "Грешка при обработка",
        description: "Моля, изберете файл.",
        variant: "destructive",
      });
    }

    // Check if it's an Excel file
    if (!/\.(xlsx|xls)$/i.exec(file.name)) {
      return toast({
        title: "Грешка при обработка",
        description:
          "Невалиден файл. Моля, изберете Excel файл (.xlsx или .xls)",
        variant: "destructive",
      });
    }

    setFileName(file.name);
    setFile(file);
  };

  const extractPlanData = async () => {
    setIsProcessing(true);
    if (!monthPlanType) {
      setIsProcessing(false);
      return toast({
        title: "Грешка при обработка",
        description: "Моля, изберете вид месечен план.",
        variant: "destructive",
      });
    }

    if (!file) {
      handleReset();
      return toast({
        title: "Грешка при обработка",
        description: "Моля, изберете файл.",
        variant: "destructive",
      });
    }

    try {
      const operationalDataInsert: OperationalPlanInsertArray = [];
      const shovelsDataInsert: ShovelPlanInsertArray = [];
      const naturalIndicatorsDataInsert: NaturalIndicatorsPlanInsertArray = [];
      const grProjectDataInsert: GRProjectPlanInsertArray = [];

      switch (monthPlanType) {
        case "Месечен оперативен план":
          const processedData = await processExcelMonthPlanOperativen(file);
          for (const row of processedData) {
            operationalDataInsert.push(monthPlanMapper(row));
          }
          break;
        case "Месечен ГР Проект":
          const grProjectData = await processExcelMonthPlanGRProject(file);
          for (const row of grProjectData) {
            grProjectDataInsert.push(grProjectPlanMapper(row));
          }
          break;
        case "Месечен план добив багери":
          const shovelsData = await processExcelMonthPlanShovels(file, date);
          for (const row of shovelsData) {
            shovelsDataInsert.push(planShovelsMapper(row));
          }
          break;
        case "Месечен план по одобрени натурални показатели":
          const results = await processExcelMonthPlanNaturalIndicators(file);
          for (const row of results) {
            naturalIndicatorsDataInsert.push(naturalIndicatorsPlanMapper(row));
          }
          break;
        default:
          throw new Error("handleMonthPlanData:Invalid month plan type");
      }

      if (
        !operationalDataInsert &&
        !shovelsDataInsert &&
        !naturalIndicatorsDataInsert &&
        !grProjectDataInsert
      ) {
        throw new Error("handleFileUpload:No processed data");
      }

      console.log(operationalDataInsert);
      setProcessedData([
        ...operationalDataInsert,
        ...shovelsDataInsert,
        ...naturalIndicatorsDataInsert,
        ...grProjectDataInsert,
      ] as PlanInsertTypes);

      return toast({
        title: "Успешно обработен файл",
        description: `Файлът "${file.name}" е обработен успешно.`,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      handleReset();
      return toast({
        title: "Грешка при обработка",
        description:
          "Възникна грешка при обработката на файла. Моля, проверете дали файлът е валиден и има правилната структура.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendPlanData = async (
    planType: MonthPlanType | undefined,
    planData: PlanInsertTypes | undefined
  ) => {
    setIsSending(true);
    if (!planType || !planData) {
      return toast({
        title: "Грешка при обработка",
        description: "Моля, изберете вид месечен план и добавете файла.",
        variant: "destructive",
      });
    }

    try {
      let res: { success: boolean; message: string } | undefined;
      switch (monthPlanType) {
        case "Месечен оперативен план":
          res = await createPlanOperativenMutation.mutateAsync(
            planData as OperationalPlanInsertArray
          );
          console.log(res);
          break;
        case "Месечен ГР Проект":
          // res = await createPlanGRProjectMutation.mutateAsync(
          //   planData as GRProjectPlanInsertArray
          // );
          // console.log(res);
          break;
        case "Месечен план добив багери":
          res = await createPlanShovelsMutation.mutateAsync(
            planData as ShovelPlanInsertArray
          );
          console.log(res);
          break;
        case "Месечен план по одобрени натурални показатели":
          res = await createPlanNaturalMutation.mutateAsync(
            planData as NaturalIndicatorsPlanInsertArray
          );
          console.log(res);
          break;
        default:
          throw new Error("sendPlanData:Invalid month plan type");
      }

      handleReset();
      return toast({
        title: "Успешно записан месечен план",
        description: `${planType} е записан успешно.`,
      });
    } catch (error) {
      console.error("Error sending plan data:", error);
      return toast({
        title: "Грешка при записване",
        description:
          "Възникна грешка при записването на месечен план. Опитайте отново, или се обадете на администратор.",
        variant: "destructive",
      });
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
          <div className="flex flex-row gap-4">
            <div className="flex max-w-xl flex-1 flex-col gap-4">
              <Select
                onValueChange={(e) => setMonthPlanType(e as MonthPlanType)}
                value={monthPlanType ?? ""}
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
                      MONTH_NAMES_BG[date.getMonth() + 1] +
                      " " +
                      date.getFullYear()
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
                    hidden={{
                      after: date
                        ? endOfYear(addWeeks(date, 52))
                        : endOfYear(addWeeks(new Date(), 52)),
                    }}
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
                  variant="success"
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
                  variant="warning"
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
                  variant="link"
                  type="button"
                  disabled={isProcessing || isSending || !processedData}
                  onClick={(e) => {
                    e.preventDefault();
                    void sendPlanData(monthPlanType, processedData);
                  }}
                >
                  Изпрати
                </Button>
              </div>
            </div>

            {/* Info Alert */}
            {/* <div className="w-full">
              <Alert className="w-full">
                <FileSpreadsheet className="h-4 w-4" />
                <AlertTitle>Необходима е Excel библиотека</AlertTitle>
                <AlertDescription>
                  За пълна функционалност е необходимо да се инсталира
                  библиотеката <code>xlsx</code> и да се имплементират функциите
                  за обработка на Excel файлове.
                </AlertDescription>
              </Alert>
            </div> */}
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
