import AppLayout from "@/components/AppLayout";
import { api, HydrateClient } from "@/trpc/server";
import { RequestsRepairsPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function RequestsRepairsPage() {
  // Prefetch data on the server
  await api.dispatcher.repairs.getRequests.prefetch(undefined);

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
          <RequestsRepairsPageClient />
        </Suspense>
      </AppLayout>
    </HydrateClient>
  );
}

