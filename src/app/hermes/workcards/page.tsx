import AppLayout from "@/components/AppLayout";
import { api, HydrateClient } from "@/trpc/server";
import { WorkcardsPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function WorkcardsPage() {
  // Prefetch data on the server
  await api.hermes.workcards.getAll.prefetch();
  // Only prefetch getDetails if needed (currently form is commented out)
  // void api.hermes.workcards.getDetails.prefetch();

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
          <WorkcardsPageClient />
        </Suspense>
      </AppLayout>
    </HydrateClient>
  );
}
