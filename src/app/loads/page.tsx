import AppLayout from "@/components/AppLayout";
import { api, HydrateClient } from "@/trpc/server";
import { LoadsPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function LoadsPage() {
  // Prefetch data on the server
  void api.loads.loads.getAll.prefetch();
  void api.loads.loads.getUnsent.prefetch();

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
          <LoadsPageClient />
        </Suspense>
      </AppLayout>
    </HydrateClient>
  );
}
