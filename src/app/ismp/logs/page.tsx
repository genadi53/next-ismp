import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { api, HydrateClient } from "@/trpc/server";
import { LogsPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function LogsPage() {
  // Prefetch data on the server
  await api.ismp.logs.getAll.prefetch();

  return (
    <HydrateClient>
      <AppLayout>
        <Container
          title="ИСМП Логове"
          description="Преглед на мрежови логове и действия"
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
            <LogsPageClient />
          </Suspense>
        </Container>
      </AppLayout>
    </HydrateClient>
  );
}

