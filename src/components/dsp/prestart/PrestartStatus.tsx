"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PrestartCheck } from "@/server/repositories/dispatcher";

type PrestartStatusProps = {
  prestart: PrestartCheck | null;
};

export function PrestartStatus({ prestart }: PrestartStatusProps) {
  if (!prestart) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Текуща предстартова проверка</CardTitle>
        <CardDescription>Информация за активната проверка</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">ID:</span>
            <Badge variant="outline">{prestart.ID}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Дата:</span>
            <span className="text-sm font-medium">{prestart.StartDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Диспечер:</span>
            <span className="text-sm font-medium">{prestart.Dispatcher}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Смяна:</span>
            <span className="text-sm font-medium">
              {prestart.FullShiftName || `Смяна ${prestart.Shift}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
