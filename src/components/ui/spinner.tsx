"use client";
import { cn } from "@/lib/cn";
import { Loader2, X } from "lucide-react";
import { Button } from "./button";

export interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg" | "xl";
  showCancelButton?: boolean;
  onCancel?: () => void;
  cancelButtonText?: string;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  default: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

const LoadingSpinner = ({
  size = "default",
  showCancelButton = false,
  onCancel,
  cancelButtonText = "Cancel",
  label,
  showLabel = false,
  className,
}: LoadingSpinnerProps) => {
  return (
    <div
      className={cn(
        `text-ell-primary container mx-auto flex w-full flex-col items-center justify-center gap-2 px-4 pt-2 sm:gap-4 md:px-8 lg:px-18 lg:pt-8`,
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn("animate-spin", sizeClasses[size])} />
        {showLabel && label && (
          <span className="text-muted-foreground text-sm">{label}</span>
        )}
      </div>
      {/* <div className="flex justify-center items-center py-12">
              <div className="text-gray-500 flex items-center gap-2">
                <span className="animate-spin">⏳</span> Зареждане...
              </div>
            </div> 
      */}

      {showCancelButton && onCancel && (
        <Button variant="outline" size="sm" onClick={onCancel} className="ml-2">
          <X className="mr-1 h-3 w-3" />
          {cancelButtonText}
        </Button>
      )}
    </div>
  );
};

export { LoadingSpinner };
