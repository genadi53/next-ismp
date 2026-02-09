import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { api, HydrateClient } from "@/trpc/server";
import { MikrotikPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function MikrotikPage() {
  // Prefetch data on the server
  try {
    await Promise.all([
      api.ismp.mikrotik.getConfig.prefetch(),
      api.ismp.mikrotik.getStatus.prefetch(),
    ]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    // Ignore prefetch errors, they will be handled on the client
  }

  return (
    <HydrateClient>
      <AppLayout>
        <Container
          title="MikroTik Мониторинг"
          description="Мониторинг на MikroTik рутер и активни клиенти"
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
            <MikrotikPageClient />
          </Suspense>
        </Container>
      </AppLayout>
    </HydrateClient>
  );
}
