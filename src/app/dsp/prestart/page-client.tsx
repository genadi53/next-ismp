"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { api } from "@/trpc/react";
import { PrestartForm } from "@/components/dsp/prestart/PrestartForm";
import { PrestartStatus } from "@/components/dsp/prestart/PrestartStatus";

export function PrestartPageClient() {
  // Get current dispatcher - using a placeholder for now
  // In production, this should come from authentication context
  const [dispatcher, setDispatcher] = useState<string>("");
  const [currentDispatcher] =
    api.dashboard.dispatcher.getCurrent.useSuspenseQuery();

  useEffect(() => {
    // Get dispatcher username from current dispatcher query
    if (currentDispatcher?.length > 0) {
      setDispatcher(currentDispatcher[0]?.DispatcherProfile ?? "");
    } else {
      // Fallback: try to get from session or use a default
      // This should be replaced with actual auth context
      setDispatcher(""); // Will need to be set from auth
    }
  }, [currentDispatcher]);

  const { data: prestartStatus, refetch } =
    api.dispatcher.prestart.getStatus.useQuery(
      { dispatcher },
      { enabled: !!dispatcher },
    );

  const handleStatusChange = () => {
    void refetch();
  };

  if (!dispatcher) {
    return (
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Моля, влезте в системата за да използвате предстартовата проверка.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Предстартова проверка</CardTitle>
            <CardDescription>
              Започнете или завършете предстартова проверка
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PrestartForm
              dispatcher={dispatcher}
              currentPrestart={prestartStatus?.currentPrestart ?? null}
              hasUnfinished={prestartStatus?.hasUnfinished ?? false}
              onStatusChange={handleStatusChange}
            />
          </CardContent>
        </Card>

        {/* Status Section */}
        {prestartStatus?.currentPrestart && (
          <PrestartStatus prestart={prestartStatus.currentPrestart} />
        )}

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Предстартовата проверка включва проверка на пътища, локации, багери,
            камиони и друго оборудване. Моля, проверете всички секции преди
            потвърждаване.
          </AlertDescription>
        </Alert>
      </div>
    </>
  );
}
