import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { api, HydrateClient } from "@/trpc/server";
import { MorningReportPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function MorningReportPage() {
  // Prefetch data on the server
  await api.dispatcher.morningReport.getAll.prefetch();
  await api.dashboard.dispatcher.getCurrent.prefetch();

  return (
    <HydrateClient>
      <AppLayout>
        <Container
          title="Сутрешен отчет Диспечери"
          description="Управление на сутрешни отчети"
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
            <MorningReportPageClient />
          </Suspense>
        </Container>
      </AppLayout>
    </HydrateClient>
  );
}
