import AppLayout from "@/components/AppLayout";
import { api, HydrateClient } from "@/trpc/server";
import { EquipmentsPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function EquipmentsPage() {
  // Prefetch data on the server
  await api.hermes.equipments.getAll.prefetch();

  return (
    <HydrateClient>
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
          <EquipmentsPageClient />
        </Suspense>
      </AppLayout>
    </HydrateClient>
  );
}
