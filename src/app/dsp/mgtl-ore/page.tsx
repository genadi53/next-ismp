import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { api, HydrateClient } from "@/trpc/server";
import { MgtlOrePageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function MgtlOrePage() {
  // Prefetch data on the server
  await api.dispatcher.mgtlOre.getAll.prefetch();

  return (
    <HydrateClient>
      <AppLayout>
        <Container
          title="Извоз на Руда"
          description="Въвеждане на данни за извоза на руда"
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
            <MgtlOrePageClient />
          </Suspense>
        </Container>
      </AppLayout>
    </HydrateClient>
  );
}
