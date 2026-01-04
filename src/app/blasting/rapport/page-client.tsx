"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function BlastingRapportPageClient() {
  return (
    <Card className="shadow-lg w-full">
      <CardHeader className="border-b">
        <CardTitle className="text-xl">Формуляр за рапорт</CardTitle>
        <CardDescription>
          Попълнете всички полета за създаване на рапорт
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Формата за рапорт ще бъде имплементирана в следващ етап. Това е
            сложна форма с много полета, която изисква миграция на компонентите
            и схемите от стария проект.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

