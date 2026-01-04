"use client";

import { type Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BlastingPlan } from "@/server/repositories/pvr";

const labels: {
  [K in keyof BlastingPlan]: string;
} = {
  ID: "ID",
  OperDate: "Дата",
  BlastingField: "Взривно поле",
  Horizont1: "Хоризонт 1",
  Horizont2: "Хоризонт 2",
  Drill: "Сонда 1",
  Drill2: "Сонда 2",
  Holes: "Сондажи",
  Konturi: "Контури",
  MineVolume: "Обем ММ",
  TypeBlast: "Вид Поле",
  Disabled: "Изключен",
  Note: "Забележки",
  lrd: "Последна редакция",
  userAdded: "Редактор",
};

export function PVRDataTableViewOptions<TData>({
  table,
}: {
  table: Table<TData>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 mb-1 lg:flex"
        >
          <Settings2 />
          Колони
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Премахни колони</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {labels[column.id as keyof BlastingPlan]}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

