"use client";
import { cn } from "@/lib/cn";
import { toast as sonnerToast } from "sonner";
import { X } from "lucide-react";

interface ToastProps {
  id: string | number;
  title: string;
  description: string;
  variant?: "default" | "destructive";
  button?: {
    label: string;
    onClick: () => void;
  };
}

/** I recommend abstracting the toast function
 *  so that you can call it without having to use toast.custom everytime. */
export function toast(toast: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      title={toast.title}
      variant={toast.variant ? toast.variant : "default"}
      description={toast.description}
      button={{
        label: toast.button?.label || "",
        onClick: toast.button?.onClick || (() => {}),
      }}
    />
  ));
}

/** A fully custom toast that still maintains the animations and interactions. */
function Toast(props: ToastProps) {
  const { title, description, button, id, variant } = props;

  return (
    <div
      className={cn(
        `group data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full pointer-events-auto relative flex w-full min-w-[360px] items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none`,
        variant === "default"
          ? "bg-background text-foreground border"
          : "destructive group border-destructive bg-destructive text-white",
      )}
    >
      <div className="flex flex-1 items-center">
        <div className="w-full">
          <p
            className={cn(
              "text-sm font-semibold [&+div]:text-xs",
              variant === "default" ? "text-foreground" : "text-white",
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "text-sm opacity-90",
              variant === "default" ? "text-foreground" : "text-white",
            )}
          >
            {description}
          </p>
        </div>
      </div>

      {button && button.label && (
        <button
          onClick={() => {
            button?.onClick();
            sonnerToast.dismiss(id);
          }}
          className="hover:bg-secondary focus:ring-ring group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors focus:ring-1 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          {button?.label}
        </button>
      )}

      <button
        onClick={() => sonnerToast.dismiss(id)}
        className="absolute top-1 right-1 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:opacity-100 group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:ring-1 focus:outline-none group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
      >
        <X
          className={cn(
            "h-4 w-4",
            variant === "default" ? "text-foreground" : "text-white",
          )}
        />
      </button>
    </div>
  );
}
