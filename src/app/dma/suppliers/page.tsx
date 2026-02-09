import AppLayout from "@/components/AppLayout";
import { api, HydrateClient } from "@/trpc/server";
import { SuppliersPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function SuppliersPage() {
  // Prefetch data on the server
  void api.dma.suppliers.getAll.prefetch();

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
          <SuppliersPageClient />
        </Suspense>
      </AppLayout>
    </HydrateClient>
  );
}
