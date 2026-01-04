import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { api, HydrateClient } from "@/trpc/server";
import { SuppliersPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function SuppliersPage() {
  // Prefetch data on the server
  await api.dma.suppliers.getAll.prefetch();

  return (
    <HydrateClient>
      <AppLayout>
        <Container
          title="Доставчици"
          description="Управление и преглед на всички доставчици"
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
            <SuppliersPageClient />
          </Suspense>
        </Container>
      </AppLayout>
    </HydrateClient>
  );
}
