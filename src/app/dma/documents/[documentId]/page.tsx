import AppLayout from "@/components/AppLayout";
import { api, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { DocumentDetailClient } from "./page-client";

type Props = {
  params: Promise<{ documentId: string }>;
};

export default async function DocumentDetailPage({ params }: Props) {
  const { documentId } = await params;
  const id = Number(documentId);

  // Prefetch data on the server
  void api.dma.documents.getById.prefetch({ id });
  void api.dma.documents.getSuppliers.prefetch({ documentId: id });
  void api.dma.documents.getAssets.prefetch({ documentId: id });

  return (
    <HydrateClient>
      <AppLayout>

        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner
                size="lg"
                label="Зареждане на документ..."
                showLabel
              />
            </div>
          }
        >
          <DocumentDetailClient documentId={id} />
        </Suspense>
      </AppLayout>
    </HydrateClient>
  );
}
