import type { ColumnDef } from "@tanstack/react-table";
import type { HermesOperator } from "@/server/repositories/hermes";
import { DataTableColumnHeader } from "../../table/columnHeader";
import { RowActionsOperators } from "./rowActionsOperators";

export const operatorColumns = ({
  actions,
}: {
  actions: Record<"edit" | "delete", (operator: HermesOperator) => void>;
}): ColumnDef<HermesOperator>[] => [
  {
    accessorKey: "Id",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Id"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "OperatorId",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID на оператор"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "OperatorName",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Име на оператор"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "Zveno",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Звено"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "Dlazhnost",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Длъжност"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "Department",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Отдел"
        haveColumnFilter={false}
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActionsOperators row={row} actions={actions} />,
  },
];
