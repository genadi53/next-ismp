import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../../table/columnHeader";
import type { DmaSupplier } from "@/types/dma";
import { RowActionsSuppliers } from "./rowActionsSuppliers";

export const suppliersColumns = ({
  actions,
}: {
  actions: Record<"edit" | "delete", (supplier: DmaSupplier) => void>;
}): ColumnDef<DmaSupplier>[] => [
  {
    accessorKey: "Id",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "Supplier",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Доставчик"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const Supplier: string | null = row.getValue("Supplier");
      return (
        <div className="text-sm max-w-sm break-words whitespace-break-spaces">
          {Supplier}
        </div>
      );
    },
  },
  {
    accessorKey: "SupplierDesc",
    header: "Описание",
    cell: ({ row }) => {
      const description: string | null = row.getValue("SupplierDesc");
      return (
        <div className="text-sm max-w-sm break-words whitespace-break-spaces">
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "CreatedFrom",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Създаден от"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const CreatedFrom: string | null = row.getValue("CreatedFrom");
      return (
        <div className="text-sm max-w-sm break-words whitespace-break-spaces">
          {CreatedFrom?.replaceAll("@ELLATZITE-MED.COM", "")}
        </div>
      );
    },
  },
  {
    accessorKey: "LastUpdatedFrom",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Последна редакция от"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const LastUpdatedFrom: string | null = row.getValue("LastUpdatedFrom");
      return (
        <div className="text-sm max-w-sm break-words whitespace-break-spaces">
          {LastUpdatedFrom?.replaceAll("@ELLATZITE-MED.COM", "")}
        </div>
      );
    },
  },
  {
    accessorKey: "lrd",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Последна редакция на"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const lrd: string | null = row.getValue("lrd");
      return (
        <div className="text-sm">
          {lrd && new Date(lrd).toLocaleString("ru")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActionsSuppliers row={row} actions={actions} />,
  },
];

