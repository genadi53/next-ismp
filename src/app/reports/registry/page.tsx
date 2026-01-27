"use client";

import { Suspense } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { api } from "@/trpc/react";
import {
  DataTableRegistry,
  registryColumns,
} from "@/components/reports/tableRegistry";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";

function RegistryContent() {
  const [registryData] = api.reports.registry.getAll.useSuspenseQuery(undefined);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h4 className="text-green-600 font-bold text-xl mb-4">
          Регистър на заявки за актуализиране на отчети
        </h4>
        <div className="mb-4">
          <Button asChild>
            <Link href="/reports/registry?action=add">
              <Plus className="h-4 w-4 mr-2" />
              Добави запис по заявка
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Регистър на промените в отчетите
            </h3>
          </div>
          <DataTableRegistry
            columns={registryColumns}
            data={registryData ?? []}
          />
        </div>
      </div>
    </div>
  );
}

export default function RegistryPage() {
  return (
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
        <RegistryContent />
      </Suspense>
    </AppLayout>
  );
}
