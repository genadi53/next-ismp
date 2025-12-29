import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../table/columnHeader";
import type { Load } from "@/types/loads";
import { RowActionsLoads } from "./rowActionsLoads";
import { ShiftNumbers } from "@/types/types";

export const loadsColumns = ({
  actions,
}: {
  actions: Record<"edit" | "delete", (load: Load) => void>;
}): ColumnDef<Load>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "Adddate",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Дата"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const adddate: Date = row.getValue("Adddate");
      return (
        <div className="text-sm">
          {adddate && new Date(adddate).toLocaleDateString("bg-BG")}
        </div>
      );
    },
  },
  {
    accessorKey: "Shift",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Смяна"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const shiftNum: number | null = row.getValue("Shift");
      if (!shiftNum) return <div className="text-sm">-</div>;
      return <div className="text-sm">{ShiftNumbers[shiftNum]}</div>;
    },
  },
  {
    accessorKey: "Shovel",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Багер"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "Truck",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Камион"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "Br",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Брой"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const br: number | null = row.getValue("Br");
      return <div className="ml-4 text-left text-sm">{br ?? "-"}</div>;
    },
  },
  {
    accessorKey: "AddMaterial",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Добавен материал"
        longTitle={["Добавен", "материал"]}
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const addMaterial: string | null = row.getValue("AddMaterial");
      return (
        <div className="max-w-sm text-sm wrap-break-word whitespace-break-spaces">
          {addMaterial || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "RemoveMaterial",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Премахнат материал"
        longTitle={["Премахнат", "материал"]}
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const removeMaterial: string | null = row.getValue("RemoveMaterial");
      return (
        <div className="max-w-sm text-sm wrap-break-word whitespace-break-spaces">
          {removeMaterial || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "userAdded",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Добавен от"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const userAdded: string | null = row.getValue("userAdded");
      return (
        <div className="max-w-sm text-sm wrap-break-word whitespace-break-spaces">
          {userAdded?.replaceAll("@ELLATZITE-MED.COM", "") || "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActionsLoads row={row} actions={actions} />,
  },
];
