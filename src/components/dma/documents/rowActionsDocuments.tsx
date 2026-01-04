import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Printer } from "lucide-react";
import type { DmaDocument } from "@/server/repositories/dma";

interface RowActionsDocumentsProps {
  document: DmaDocument;
  actions: Record<"edit" | "print" | "delete", (document: DmaDocument) => void>;
}

export const RowActionsDocuments = ({
  document,
  actions,
}: RowActionsDocumentsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Отвори меню</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Действия</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => actions.edit(document)}>
          <Edit className="mr-2 h-4 w-4" />
          Редактирай
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.print(document)}>
          <Printer className="mr-2 h-4 w-4" />
          Отпечатай
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => actions.delete(document)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Изтрий
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

