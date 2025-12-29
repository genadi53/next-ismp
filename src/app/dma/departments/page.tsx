import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { api, HydrateClient } from "@/trpc/server";
import { DepartmentsPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function DepartmentsPage() {
  // Prefetch data on the server
  await api.dma.departments.getAll.prefetch();

  return (
    <HydrateClient>
      <AppLayout>
        <Container
          title="Дирекции"
          description="Добавяне, управление и преглед на всички дирекции"
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
            <DepartmentsPageClient />
          </Suspense>
        </Container>
      </AppLayout>
    </HydrateClient>
  );
}
