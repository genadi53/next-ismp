import AppLayout from "@/components/AppLayout";
import { api, HydrateClient } from "@/trpc/server";
import { OperatorsPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function OperatorsPage() {
  // Prefetch data on the server
  await api.hermes.operators.getAll.prefetch();

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
          <OperatorsPageClient />
        </Suspense>
      </AppLayout>
    </HydrateClient>
  );
}
