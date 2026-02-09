import { api, HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { DocumentPrintClient } from "./page-client";

type Props = {
  params: Promise<{ documentId: string }>;
};

export default async function DocumentPrintPage({ params }: Props) {
  const { documentId } = await params;
  const id = Number(documentId);

  // Prefetch data on the server
  void api.dma.documents.getById.prefetch({ id });
  void api.dma.documents.getSuppliers.prefetch({ documentId: id });
  void api.dma.documents.getAssets.prefetch({ documentId: id });

  return (
    <HydrateClient>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p>Зареждане на документ...</p>
          </div>
        }
      >
        <DocumentPrintClient documentId={id} />
      </Suspense>
    </HydrateClient>
  );
}
