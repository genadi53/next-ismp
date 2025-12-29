"use client";

import AppLayout from "@/components/AppLayout";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  title,
  message,
}: {
  error?: Error;
  title?: string;
  message?: string;
}) {
  console.error(error);
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center space-y-3 py-12">
        <div className="bg-destructive/10 rounded-full p-3">
          <AlertCircle className="text-destructive h-8 w-8" />
        </div>
        <div className="text-center">
          <h3 className="mb-1 text-lg font-semibold text-red-500">
            {title ?? "Грешка при зареждане"}
          </h3>
          <p className="text-muted-foreground">
            {message ?? "Не успяхме да заредим данните. Моля, опитайте отново."}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
