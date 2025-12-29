import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { PrestartPageClient } from "./page-client";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

export default async function PrestartPage() {
  return (
    <AppLayout>
      <Container
        title="Предстартова проверка"
        description="Проверка на оборудване преди смяна"
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
          <PrestartPageClient />
        </Suspense>
      </Container>
    </AppLayout>
  );
}
