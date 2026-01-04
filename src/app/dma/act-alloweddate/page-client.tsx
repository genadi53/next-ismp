"use client";

import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Lock, Unlock } from "lucide-react";

export function AllowedDatePageClient() {
  const [allowedDate] = api.dma.documents.getAllowedDate.useSuspenseQuery();

  const utils = api.useUtils();
  const createMutation = api.dma.documents.createAllowedDate.useMutation({
    onSuccess: () => {
      toast.success("Успешно", {
        description: "Периодът е отключен успешно.",
      });
      utils.dma.documents.getAllowedDate.invalidate();
    },
    onError: (error) => {
      toast.error("Грешка", {
        description: error.message || "Възникна грешка при отключването.",
      });
    },
  });

  const stopMutation = api.dma.documents.stopAllowedDate.useMutation({
    onSuccess: () => {
      toast.success("Успешно", {
        description: "Периодът е заключен успешно.",
      });
      utils.dma.documents.getAllowedDate.invalidate();
    },
    onError: (error) => {
      toast.error("Грешка", {
        description: error.message || "Възникна грешка при заключването.",
      });
    },
  });

  const handleUnlock = () => {
    // Calculate next month's date range
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const endOfMonth = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth() + 1,
      0,
    );

    createMutation.mutate({
      StartDate: nextMonth.toISOString().split("T")[0]!,
      EndDate: endOfMonth.toISOString().split("T")[0]!,
      StoppedAll: false,
    });
  };

  const handleLock = () => {
    if (allowedDate) {
      // We need an ID to stop, but the API doesn't return one
      // This is a placeholder - you may need to adjust based on actual API
      toast.info("Функционалността за заключване ще бъде имплементирана скоро");
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <Calendar className="text-primary h-6 w-6" />
          <div>
            <CardTitle className="text-xl">Текущ разрешен период</CardTitle>
            <CardDescription>
              Преглед и управление на периода за създаване на документи
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!allowedDate && (
          <div className="py-12 text-center">
            <Lock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Няма активен период</h3>
            <p className="text-muted-foreground mb-6">
              В момента няма отключен период за създаване на документи.
            </p>
            <Button onClick={handleUnlock} disabled={createMutation.isPending}>
              <Unlock className="mr-2 h-4 w-4" />
              Отключи следващия месец
            </Button>
          </div>
        )}

        {allowedDate && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="text-muted-foreground mb-1 text-sm">
                  Начална дата
                </div>
                <div className="text-lg font-semibold">
                  {new Date(allowedDate.StartDate).toLocaleDateString("bg-BG")}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-muted-foreground mb-1 text-sm">
                  Крайна дата
                </div>
                <div className="text-lg font-semibold">
                  {new Date(allowedDate.EndDate).toLocaleDateString("bg-BG")}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-muted-foreground mb-1 text-sm">Статус</div>
                <div className="flex items-center gap-2">
                  {allowedDate.StoppedAll ? (
                    <Badge variant="destructive">
                      <Lock className="mr-1 h-3 w-3" />
                      Заключен
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-600">
                      <Unlock className="mr-1 h-3 w-3" />
                      Отключен
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleUnlock}
                disabled={createMutation.isPending || !allowedDate.StoppedAll}
                variant="default"
              >
                <Unlock className="mr-2 h-4 w-4" />
                Отключи следващия месец
              </Button>
              <Button
                onClick={handleLock}
                disabled={stopMutation.isPending || allowedDate.StoppedAll}
                variant="destructive"
              >
                <Lock className="mr-2 h-4 w-4" />
                Заключи периода
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
