"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { PrestartCheck } from "@/types/dispatcher";

type PrestartFormProps = {
  dispatcher: string;
  currentPrestart: PrestartCheck | null;
  hasUnfinished: boolean;
  onStatusChange: () => void;
};

export function PrestartForm({
  dispatcher,
  currentPrestart,
  hasUnfinished,
  onStatusChange,
}: PrestartFormProps) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const utils = api.useUtils();
  const { mutateAsync: startPrestart, isPending: isStarting } =
    api.dispatcher.prestart.start.useMutation({
      onSuccess: () => {
        toast.success("Успех", {
          description: "Предстартовата проверка е започната успешно.",
        });
        utils.dispatcher.prestart.getStatus.invalidate({ dispatcher });
        onStatusChange();
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message ||
            "Възникна грешка при започването на проверката. Опитайте отново.",
        });
        setIsProcessing(false);
      },
    });

  const { mutateAsync: endPrestart, isPending: isEnding } =
    api.dispatcher.prestart.end.useMutation({
      onSuccess: () => {
        toast.success("Успех", {
          description: "Предстартовата проверка е завършена успешно.",
        });
        utils.dispatcher.prestart.getStatus.invalidate({ dispatcher });
        onStatusChange();
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message ||
            "Възникна грешка при завършването на проверката. Опитайте отново.",
        });
        setIsProcessing(false);
      },
    });

  const { mutateAsync: completeOld, isPending: isCompleting } =
    api.dispatcher.prestart.completeOld.useMutation({
      onSuccess: () => {
        toast.success("Успех", {
          description: "Старите проверки са приключени успешно.",
        });
        setShowCompleteDialog(false);
        utils.dispatcher.prestart.getStatus.invalidate({ dispatcher });
        onStatusChange();
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message ||
            "Възникна грешка при приключването на старите проверки. Опитайте отново.",
        });
        setIsProcessing(false);
      },
    });

  const handleStart = async () => {
    if (hasUnfinished) {
      setShowCompleteDialog(true);
      return;
    }

    setIsProcessing(true);
    try {
      await startPrestart({ Dispatcher: dispatcher, Shift: 0 }); // Shift will be set by the server
    } catch (error) {
      // Error is handled by mutation onError
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnd = async () => {
    if (!currentPrestart) return;

    setIsProcessing(true);
    try {
      await endPrestart({
        id: currentPrestart.ID,
        data: { EndDispatcher: dispatcher },
      });
    } catch (error) {
      // Error is handled by mutation onError
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteOld = async () => {
    setIsProcessing(true);
    try {
      await completeOld({ EndDispatcher: dispatcher });
      // After completing old, start new one
      await startPrestart({ Dispatcher: dispatcher, Shift: 0 });
    } catch (error) {
      // Error is handled by mutation onError
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isStarting || isEnding || isCompleting || isProcessing;

  return (
    <>
      <div className="flex gap-4">
        <Button
          onClick={handleStart}
          disabled={isLoading || !!currentPrestart}
          variant="default"
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Започни Предстартова проверка
        </Button>

        <Button
          onClick={handleEnd}
          disabled={isLoading || !currentPrestart}
          variant="outline"
          className="gap-2"
        >
          <XCircle className="h-4 w-4" />
          Завърши Предстартова проверка
        </Button>
      </div>

      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Внимание
            </AlertDialogTitle>
            <AlertDialogDescription>
              Съществуват не приключени предстартови проверки! Желаете ли да ги
              приключите преди да започнете нова?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Отказ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteOld}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Приключи и Започни нова
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

