import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { api, HydrateClient } from "@/trpc/server";
import { WorkcardsPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function WorkcardsPage() {
  // Prefetch data on the server
  await api.hermes.workcards.getAll.prefetch();
  await api.hermes.workcards.getDetails.prefetch();

  return (
    <HydrateClient>
      <AppLayout>
        <Container
          title="Управление на работни карти"
          description="Добавяне и редакция на работни карти в системата Hermes"
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
            <WorkcardsPageClient />
          </Suspense>
        </Container>
      </AppLayout>
    </HydrateClient>
  );
}

