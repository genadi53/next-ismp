"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2, Circle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { monthNamesBG } from "@/types/global.types";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

const defaultChecklistItems: ChecklistItem[] = [
  {
    id: "grafik-ismp",
    label: "Изпратен график отдел ISMP",
    completed: false,
  },
  {
    id: "report-ismp",
    label: "Изпратен отчет за дежурства",
    completed: false,
  },
  {
    id: "grafik-dispatchers",
    label: "Качен график на диспечери",
    completed: false,
  },
  { id: "plans", label: "Добавени Месечни Планове", completed: false },
  {
    id: "month-reports",
    label: "Проверка Месечни отчети",
    completed: false,
  },
  {
    id: "hermes-zarabotki",
    label: "Записани Hermes заработки",
    completed: false,
  },
];

export function MonthChecklistPageClient() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    defaultChecklistItems,
  );

  const handleCheckboxChange = (id: string) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const completedCount = checklistItems.filter((item) => item.completed).length;
  const totalCount = checklistItems.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  const handleResetChecklist = () => {
    setChecklistItems((prev) =>
      prev.map((item) => ({ ...item, completed: false })),
    );
  };

  const handleCompleteAll = () => {
    setChecklistItems((prev) =>
      prev.map((item) => ({ ...item, completed: true })),
    );
  };

  const handleSendEmail = () => {
    console.log(checklistItems);
    toast.info("Функционалността за изпращане на имейл ще бъде добавена скоро");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-ell-primary text-3xl font-bold tracking-tight">
              Месечен Контролен Списък
            </h1>
            <p className="text-muted-foreground">
              Управление на месечни задачи и проверки
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={"outline"}
            className="text-ell-primary"
            onClick={handleSendEmail}
          >
            Изпрати Имейл
          </Button>
          <Badge
            variant="outline"
            className={cn(
              "px-4 py-2 text-sm",
              completionPercentage === 100
                ? "border-green-600 text-green-600"
                : "text-ell-primary",
            )}
          >
            {completedCount} / {totalCount} завършени ({completionPercentage}%)
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Checklist Card */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-ell-primary h-5 w-5" />
                <div>
                  <CardTitle className="text-xl">Задачи за месеца</CardTitle>
                  <CardDescription>
                    Проверете списъка със задачи за текущия месец
                  </CardDescription>
                </div>
              </div>

              <div>
                {/* Calendar Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start gap-2 text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {selectedDate ? (
                        monthNamesBG[selectedDate.getMonth() + 1] +
                        " " +
                        selectedDate.getFullYear()
                      ) : (
                        <span>Изберете дата</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      captionLayout="dropdown"
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Прогрес</span>
                  <span className="text-ell-primary font-semibold">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="bg-secondary h-3 w-full overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full transition-all duration-500 ease-out",
                      completionPercentage === 100
                        ? "bg-green-600"
                        : "bg-ell-primary",
                    )}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Completion Status */}
              {completionPercentage === 100 && (
                <div className="animate-in fade-in slide-in-from-top-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 duration-300 dark:border-green-800 dark:bg-green-950">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Поздравления! Всички задачи са завършени.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Checklist Items */}
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg p-3 transition-all duration-200",
                    "hover:bg-accent/50",
                    item.completed && "bg-accent/30",
                  )}
                >
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => handleCheckboxChange(item.id)}
                    className="size-5"
                  />
                  <Label
                    htmlFor={item.id}
                    className={cn(
                      "flex-1 cursor-pointer text-base font-medium transition-all select-none",
                      item.completed && "text-muted-foreground line-through",
                    )}
                  >
                    {item.label}
                  </Label>
                  {item.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="text-muted-foreground h-5 w-5" />
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleCompleteAll}
                variant="default"
                className="flex-1 gap-2"
                disabled={completedCount === totalCount}
              >
                <CheckCircle2 className="h-4 w-4" />
                Маркирай всички
              </Button>
              <Button
                onClick={handleResetChecklist}
                variant="outline"
                className="flex-1 gap-2"
                disabled={completedCount === 0}
              >
                <Circle className="h-4 w-4" />
                Изчисти всички
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
