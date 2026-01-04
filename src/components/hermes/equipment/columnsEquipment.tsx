import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../../table/columnHeader";
import type { HermesEquipment } from "@/types/hermes";
import { RowActionsEquipment } from "./rowActionsEquipment";

export const equipmentColumns = ({
  actions,
}: {
  actions: Record<"edit" | "delete", (equipment: HermesEquipment) => void>;
}): ColumnDef<HermesEquipment>[] => [
  {
    accessorKey: "ID",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID-Сметка"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const ID: number | null = row.getValue("ID");
      const smetka: number | null = row.original.DT_smetka;

      return (
        <div className="text-left">
          <span className="text-base">{`${ID} - ${smetka}`}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "DT_Priz1_ceh",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Цех"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "Obekt",
    header: "Обект",
  },
  {
    accessorKey: "DT_Priz2_kod_zveno",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Код звено"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "DT_Priz3_kod_eqmt",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Код Оборудване"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "EqmtName",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Име на Оборудване"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "DspEqmt",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Име в Dispatch"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "EqmtGroupName",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Групово име"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "PriceMinnaMasa",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Цена минна маса"
        haveColumnFilter={false}
      />
    ),
    enableHiding: true,
  },
  {
    accessorKey: "PriceShists",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Цена шисти"
        haveColumnFilter={false}
      />
    ),
    enableHiding: true,
  },
  {
    accessorKey: "PriceGrano",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Цена грандиорит"
        haveColumnFilter={false}
      />
    ),
    enableHiding: true,
  },
  {
    accessorKey: "Active",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Активна"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const active: boolean | null = row.getValue("Active");
      return <div>{active ? "Да" : "Не"}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActionsEquipment row={row} actions={actions} />,
  },
];
