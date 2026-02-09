"use client";

import { useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PlanGasForm } from "@/components/pvr/PlanGasForm";

export function PlanGasEditPageClient() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const elevation = searchParams.get("elevation");

  const { data: measurements, isLoading } = api.pvr.gas.getForEdit.useQuery(
    {
      date: date ?? "",
      elevation: Number(elevation) ?? 0,
    },
    {
      enabled: !!date && !!elevation,
    },
  );

  if (!date || !elevation) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Липсват параметри за редактиране. Моля, използвайте линка от таблицата
          с измервания.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" label="Зареждане на данните..." showLabel />
      </div>
    );
  }

  return <PlanGasForm measurementsToupdate={measurements ?? undefined} />;
}

