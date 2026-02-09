import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { api, HydrateClient } from "@/trpc/server";
import { AllowedDatePageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function AllowedDatePage() {
  // Prefetch data on the server
  void api.dma.documents.getAllowedDate.prefetch();

  return (
    <HydrateClient>
      <AppLayout>
        <Container
          title="Отключване на месец"
          description="Управление на разрешени периоди за създаване на документи"
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
            <AllowedDatePageClient />
          </Suspense>
        </Container>
      </AppLayout>
    </HydrateClient>
  );
}
