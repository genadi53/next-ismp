"use client";

import { type Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BlastingPlan } from "@/server/repositories/pvr";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions: Record<"edit" | "delete", (plan: BlastingPlan) => void>;
}

export function RowActionsBlastingPlan<TData extends BlastingPlan>({
  row,
  actions,
}: DataTableRowActionsProps<TData>) {
  const plan: BlastingPlan = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="data-[state=open]:bg-muted size-8"
        >
          <MoreHorizontal />
          <span className="sr-only">Отвори меню</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => {
            actions["edit"](plan);
          }}
        >
          Редактирай
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            actions["delete"](plan);
          }}
        >
          Изтрий
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

