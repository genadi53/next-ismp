import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { api, HydrateClient } from "@/trpc/server";
import { MorningReportPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function MorningReportPage() {
  // Prefetch data on the server
  void api.dispatcher.morningReport.getAll.prefetch();
  void api.dashboard.dispatcher.getCurrent.prefetch();
  const currentDispatcher = await api.dashboard.dispatcher.getCurrent();

  return (
    <HydrateClient>
      <AppLayout>
        <Container
          title="Сутрешен отчет Диспечери"
          headerChildren={
            <>
              {currentDispatcher && (
                <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-gray-500">Текущ диспечер:</span>{" "}
                  <span className="font-semibold text-gray-800">
                    {currentDispatcher.Name}
                  </span>
                </div>
              )}
            </>
          }
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
