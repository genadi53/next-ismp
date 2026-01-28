import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { api, HydrateClient } from "@/trpc/server";
import { DocumentsPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function DocumentsPage() {
  // Prefetch data on the server
  void api.dma.documents.getAll.prefetch();

  return (
    <HydrateClient>
      <AppLayout>
        <Container
          title="ДМА Документи"
          description="Управление и преглед на всички документи"
          noMaxWidth
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
            <DocumentsPageClient />
          </Suspense>
        </Container>
      </AppLayout>
    </HydrateClient>
  );
}

