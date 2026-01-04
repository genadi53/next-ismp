import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { Row } from "@tanstack/react-table";
import type { DmaSupplier } from "@/server/repositories/dma";

interface RowActionsSuppliersProps {
  row: Row<DmaSupplier>;
  actions: Record<"edit" | "delete", (supplier: DmaSupplier) => void>;
}

export const RowActionsSuppliers = ({ row, actions }: RowActionsSuppliersProps) => {
  const supplier = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Отвори меню</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => actions.edit(supplier)}
          className="cursor-pointer"
        >
          <Edit className="mr-2 h-4 w-4" />
          Редактирай
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => actions.delete(supplier)}
          className="cursor-pointer text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Изтрий
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

