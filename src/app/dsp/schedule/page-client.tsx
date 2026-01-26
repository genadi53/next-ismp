"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { extractGrafikDispetchers } from "@/excel/extractGrafikDispetchers";
import { api } from "@/trpc/react";
import { cn } from "@/lib/cn";
import { DispatcherSystemNames } from "@/lib/constants";
import type { CreateDispatcherScheduleInput } from "@/server/repositories/dispatcher";
import { monthNamesBG } from "@/types/global.types";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Container } from "@/components/Container";

export function SchedulePageClient() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [fileName, setFileName] = useState<string>("");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [monthGrafik, setMonthGrafik] = useState<
    CreateDispatcherScheduleInput[]
  >([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();
  const { mutateAsync: createSchedule } =
    api.dispatcher.schedule.create.useMutation({
      onSuccess: () => {
        utils.dispatcher.schedule.getAll.invalidate();
        toast({
          title: "Успешно записан график",
          description: `Графикът за месец ${date ? monthNamesBG[date.getMonth() + 1] : ""
            } е записан успешно.`,
        });
        handleReset();
      },
      onError: (error) => {
        toast({
          title: "Грешка при обработка",
          description: error.message || "Възникна грешка при записване.",
          variant: "destructive",
        });
      },
    });

  const handleReset = () => {
    setIsProcessing(false);
    setDate(undefined);
    setFileName("");
    setMonthGrafik([]);
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
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
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

  const extractDataFromExcel = async () => {
    setIsProcessing(true);
    if (!date) {
      setIsProcessing(false);
      return toast({
        title: "Грешка при обработка",
        description: "Моля, изберете дата.",
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
      const data = await extractGrafikDispetchers(file);

      if (!data) throw new Error("Error processing file.");

      const yearMonth = format(new Date(date), "yyyy-MM");

      // Transform data to match CreateDispatcherScheduleInput type
      const grafik: CreateDispatcherScheduleInput[] = [];

      data.forEach((entry) => {
        const dispatcherID = Number(entry.id);
        const Name = entry.name;
        const LoginName =
          DispatcherSystemNames[
          dispatcherID as keyof typeof DispatcherSystemNames
          ];

        // Skip entries where LoginName is not found in the mapping
        if (!LoginName) {
          console.warn(
            `Dispatcher ID ${dispatcherID} (${Name}) not found in DispatcherSystemNames mapping. Skipping.`,
          );
          return;
        }

        // Create separate entries for each day with a shift
        Object.entries(entry)
          .filter(([key]) => /^\d+$/.test(key))
          .forEach(([day, shift]) => {
            grafik.push({
              dispatcherID,
              Name: Name ?? "Unknown",
              LoginName,
              Date: `${yearMonth}-${day.padStart(2, "0")}`,
              Shift: Number(shift),
            });
          });
      });

      if (grafik.length === 0) {
        handleReset();
        return toast({
          title: "Грешка при обработка",
          description:
            "Не са намерени валидни данни за обработка. Моля, проверете дали всички диспечери имат съответствие в системата.",
          variant: "destructive",
        });
      }

      setMonthGrafik(grafik);

      toast({
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

  const sendGrafik = async () => {
    if (!monthGrafik || monthGrafik.length <= 0) return;

    try {
      await createSchedule(
        monthGrafik
          .filter((entry) => entry.dispatcherID !== null)
          .map((entry) => ({
            Date: entry.Date,
            Shift: entry.Shift,
            dispatcherID: entry.dispatcherID!,
            Name: entry.Name ?? "Unknown",
            LoginName: entry.LoginName,
          })),
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container
      title="График на диспечери"
      description="Качете Excel файл за обработка"
    >
      <div className="flex max-w-lg flex-col gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full min-w-[240px] pl-3 text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              {date ? (
                monthNamesBG[date.getMonth() + 1] + " " + date.getFullYear()
              ) : (
                <span>Изберете месец за който е графика</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              captionLayout="dropdown"
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
              Изберете Excel файл (.xlsx или .xls) за обработка на месечен план
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
            variant={"ell"}
            type="submit"
            disabled={!fileName || isProcessing}
            onClick={async (e) => {
              e.preventDefault();
              await extractDataFromExcel();
            }}
          >
            Запиши
          </Button>

          <Button
            className="w-24"
            variant={"outline"}
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
            variant={"success"}
            type="button"
            disabled={isProcessing || monthGrafik?.length <= 0}
            onClick={async (e) => {
              e.preventDefault();
              await sendGrafik();
            }}
          >
            Изпрати
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-6 w-full">
        {monthGrafik?.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Диспечер</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Смяна</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthGrafik
                .sort((a, b) => {
                  if (new Date(a.Date) > new Date(b.Date)) return 1;
                  if (new Date(a.Date) < new Date(b.Date)) return -1;
                  return a.Shift > b.Shift ? 1 : -1;
                })
                .map((g, index) => (
                  <TableRow key={`${g.Date}-${g.Shift}-${g.Name}-${index}`}>
                    <TableCell>{g.Name}</TableCell>
                    <TableCell>{g.Date}</TableCell>
                    <TableCell>{g.Shift === 1 ? "Първа" : "Нощна"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Container>
  );
}
