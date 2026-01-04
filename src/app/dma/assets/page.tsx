import AppLayout from "@/components/AppLayout";
import { api, HydrateClient } from "@/trpc/server";
import { AssetsPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function AssetsPage() {
  // Prefetch data on the server
  void api.dma.assets.getAll.prefetch();

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
          <AssetsPageClient />
        </Suspense>
      </AppLayout>
    </HydrateClient>
  );
}
