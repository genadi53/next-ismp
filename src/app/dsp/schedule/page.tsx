import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { SchedulePageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function SchedulePage() {
  return (
    <AppLayout>

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner
              size="lg"
              label="Зареждане на данни..."
              showLabel
            />
          </div>
        }
      >
        <SchedulePageClient />
      </Suspense>
    </AppLayout>
  );
}

