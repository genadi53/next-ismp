import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { type Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { HermesWorkcard } from "@/types/hermes";

type WorkcardsTableFields = Omit<HermesWorkcard, "EndTime" | "OperatorId">;

const labels: {
  [K in keyof WorkcardsTableFields]: string;
} = {
  ID: "ID",
  Date: "Дата",
  StartTime: "Време начало-край",
  OperatorName: "Име на оператор",
  CodeAction: "Работна дейност",
  Duration: "Работно време",
  Note: "Бележка",
  WorkingCardId: "ID на работна карта",
  Bukva: "Буква",
  EqmtId: "ID на машина",
};

export function ViewOptionsWorkcards<TData>({
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
          className="ml-auto hidden h-8 lg:flex"
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
                {labels[column.id as keyof WorkcardsTableFields]}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

