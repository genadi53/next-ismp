import AppLayout from "@/components/AppLayout";
import { api, HydrateClient } from "@/trpc/server";
import { PermissionsPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function PermissionsPage() {
  // Prefetch data on the server
  void api.admin.permissions.getAll.prefetch(undefined);
  void api.admin.permissions.getUsernames.prefetch();

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
          <PermissionsPageClient />
        </Suspense>
      </AppLayout>
    </HydrateClient>
  );
}
