"use client";
import { cn } from "@/lib/cn";
import { LoadingSpinner, type LoadingSpinnerProps } from "./spinner";

// Loading overlay component for full-screen loading
interface LoadingOverlayProps {
  isLoading: boolean;
  children?: React.ReactNode;
  spinnerProps?: Omit<LoadingSpinnerProps, "className">;
  overlayClassName?: string;
  className?: string;
}

const LoadingOverlay = ({
  isLoading,
  children,
  spinnerProps,
  overlayClassName,
  className,
}: LoadingOverlayProps) => {
  if (!isLoading) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative", className)}>
      {children}
      <div
        className={cn(
          `bg-background/80 absolute inset-0 container flex items-center justify-center pt-4 backdrop-blur-sm lg:pt-12`,
          overlayClassName,
        )}
      >
        <LoadingSpinner {...spinnerProps} />
      </div>
    </div>
  );
};

export { LoadingOverlay };
