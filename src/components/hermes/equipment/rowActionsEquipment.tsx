import { type Row } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HermesEquipment } from "@/server/repositories/hermes";

interface RowActionsEquipmentProps<TData> {
  row: Row<TData>;
  actions: Record<"edit" | "delete", (equipment: HermesEquipment) => void>;
}

export function RowActionsEquipment<TData extends HermesEquipment>({
  row,
  actions,
}: RowActionsEquipmentProps<TData>) {
  const equipment: HermesEquipment = row.original;

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
          onClick={() => actions.edit(equipment)}
          className="cursor-pointer"
        >
          <Edit className="mr-2 h-4 w-4" />
          Редактирай
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => actions.delete(equipment)}
          className="text-destructive cursor-pointer"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Изтрий
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
