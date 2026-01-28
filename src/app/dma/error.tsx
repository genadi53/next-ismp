"use client";

import { useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Container } from "@/components/Container";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/logger/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("[DMA Error Boundary] Component error", error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <AppLayout>
      <Container title="Грешка" description="Възникна проблем при зареждането">
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="bg-destructive/10 rounded-full p-4">
            <AlertCircle className="text-destructive h-10 w-10" />
          </div>
          <div className="text-center">
            <h3 className="mb-2 text-xl font-semibold text-red-500">
              Грешка при зареждане
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Възникна неочаквана грешка. Моля, опитайте отново или се свържете с
              администратор, ако проблемът продължава.
            </p>
            {error.message && (
              <p className="text-muted-foreground mb-4 rounded border p-2 text-sm">
                {error.message}
              </p>
            )}
          </div>
          <Button onClick={reset} variant="ell" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Опитай отново
          </Button>
        </div>
      </Container>
    </AppLayout>
  );
}
