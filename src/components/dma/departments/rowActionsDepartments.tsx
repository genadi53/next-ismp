import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { Row } from "@tanstack/react-table";
import type { DmaDepartment } from "@/types/dma";

interface RowActionsDepartmentsProps {
  row: Row<DmaDepartment>;
  actions: Record<"edit" | "delete", (department: DmaDepartment) => void>;
}

export const RowActionsDepartments = ({ row, actions }: RowActionsDepartmentsProps) => {
  const department = row.original;

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
          onClick={() => actions.edit(department)}
          className="cursor-pointer"
        >
          <Edit className="mr-2 h-4 w-4" />
          Редактирай
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => actions.delete(department)}
          className="cursor-pointer text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Изтрий
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

