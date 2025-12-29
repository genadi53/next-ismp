import { Button } from "@/components/ui/button";
import type { Load } from "@/types/loads";
import type { Row } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

interface RowActionsLoadsProps {
  row: Row<Load>;
  actions: Record<"edit" | "delete", (load: Load) => void>;
}

export function RowActionsLoads({ row, actions }: RowActionsLoadsProps) {
  const load = row.original;

  return (
    <Button
      variant="ghost"
      onClick={() => actions.edit(load)}
      className="flex cursor-pointer items-center justify-center"
    >
      <Pencil className="size-5" />
      <span className="sr-only">Редактирай</span>
    </Button>
  );
}
