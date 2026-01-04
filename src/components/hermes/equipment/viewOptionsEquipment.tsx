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
import type { HermesEquipment } from "@/server/repositories/hermes";

type EquipmentTableFields = Omit<
  HermesEquipment,
  "DT_smetka" | "Flag_new" | "Flag_brak" | "lrd"
>;

const labels: {
  [K in keyof EquipmentTableFields]: string;
} = {
  Id: "ID",
  Obekt: "Обект",
  DT_Priz1_ceh: "Цех",
  DT_Priz2_kod_zveno: "Код звено",
  DT_Priz3_kod_eqmt: "Код Оборудване",
  EqmtName: "Име на Оборудване",
  DspEqmt: "Dispatch име на оборудване",
  EqmtGroupName: "Групово име",
  PriceMinnaMasa: "Цена минна маса",
  PriceShists: "Цена шисти",
  PriceGrano: "Цена грандиорит",
  Active: "Активна",
};

export function ViewOptionsEquipment<TData>({
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
              typeof column.accessorFn !== "undefined" && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {labels[column.id as keyof EquipmentTableFields]}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
