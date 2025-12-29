"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

// This is a simplified version - the full implementation would need
// to fetch data from the prestart API and manage state properly
export function PrestartPageClient() {
  const [overallProgress] = useState(0);

  return (
    <>
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Предстартовата проверка ще бъде напълно имплементирана в следващ етап.
          Текущата страница е базова структура.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-6">
        {/* Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle>Общ прогрес</CardTitle>
            <CardDescription>
              Общ прогрес на предстартовата проверка
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="mb-4" />
            <p className="text-muted-foreground text-sm">
              Завършено: {Math.round(overallProgress)}%
            </p>
          </CardContent>
        </Card>

        {/* Sections Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Секции за проверка</CardTitle>
            <CardDescription>
              Проверете всички секции преди потвърждаване
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">Пътища</h3>
                <p className="text-muted-foreground text-sm">
                  Проверка на пътищата ще бъде имплементирана скоро.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">Локации</h3>
                <p className="text-muted-foreground text-sm">
                  Проверка на локациите ще бъде имплементирана скоро.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">Багери</h3>
                <p className="text-muted-foreground text-sm">
                  Проверка на багерите ще бъде имплементирана скоро.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">Камиони</h3>
                <p className="text-muted-foreground text-sm">
                  Проверка на камионите ще бъде имплементирана скоро.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">Други</h3>
                <p className="text-muted-foreground text-sm">
                  Други проверки ще бъдат имплементирани скоро.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" disabled>
            Запиши прогрес
          </Button>
          <Button disabled={overallProgress < 100}>Потвърди проверка</Button>
        </div>
      </div>
    </>
  );
}
