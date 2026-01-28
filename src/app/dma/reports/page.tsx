import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { api, HydrateClient } from "@/trpc/server";
import { ReportsPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function ReportsPage() {
  // Prefetch data on the server
  void api.dma.assets.getReports.prefetch();

  return (
    <HydrateClient>
      <AppLayout>
        <Container
          title="Отчет Актове"
          description="Преглед на отчети за ДМА актове"
        >
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
            <ReportsPageClient />
          </Suspense>
        </Container>
      </AppLayout>
    </HydrateClient>
  );
}

