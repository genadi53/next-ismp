"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { NoResults } from "@/components/NoResults";
import { FileText } from "lucide-react";

export function LogsPageClient() {
  const [logs] = api.ismp.logs.getAll.useSuspenseQuery();

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Мрежови логове</CardTitle>
        <CardDescription>
          Преглед на всички мрежови действия и логове
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs?.length === 0 ? (
          <NoResults
            title="Няма намерени логове"
            description="Все още няма записани мрежови логове."
            icon={<FileText className="size-12 text-ell-primary/50" />}
          />
        ) : (
          <div className="text-muted-foreground">
            Таблицата с логове ще бъде имплементирана в следващ етап.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

