import { type Row } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Printer, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HermesWorkcard } from "@/server/repositories/hermes";

interface RowActionsWorkcardsProps<TData> {
  row: Row<TData>;
  actions: Record<
    "edit" | "print" | "delete",
    (workcard: HermesWorkcard) => void
  >;
}

export function RowActionsWorkcards<TData extends HermesWorkcard>({
  row,
  actions,
}: RowActionsWorkcardsProps<TData>) {
  const workcard = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Отвори меню</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => actions.edit(workcard)}
          className="cursor-pointer"
        >
          <Edit className="mr-2 h-4 w-4" />
          Редактирай
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => actions.print(workcard)}
          className="cursor-pointer"
        >
          <Printer className="mr-2 h-4 w-4" />
          Отпечатай
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => actions.delete(workcard)}
          className="text-destructive cursor-pointer"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Изтрий
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
