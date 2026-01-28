import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../../table/columnHeader";
import type { DmaAsset } from "@/server/repositories/dma/types.assets";
import { RowActionsAssets } from "./rowActionsAssets";

export const assetsColumns = ({
  actions,
}: {
  actions: Record<"edit" | "delete", (asset: DmaAsset) => void>;
}): ColumnDef<DmaAsset>[] => [
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
      accessorKey: "Name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Име"
          haveColumnFilter={false}
        />
      ),
      cell: ({ row }) => {
        const Name: string = row.getValue("Name");
        return (
          <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
            {Name}
          </div>
        );
      },
    },
    {
      accessorKey: "Marka",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Марка"
          haveColumnFilter={false}
        />
      ),
      cell: ({ row }) => {
        const Marka: string | null = row.getValue("Marka");
        return (
          <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
            {Marka}
          </div>
        );
      },
    },
    {
      accessorKey: "Model",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Модел"
          haveColumnFilter={false}
        />
      ),
      cell: ({ row }) => {
        const Model: string | null = row.getValue("Model");
        return (
          <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
            {Model}
          </div>
        );
      },
    },
    {
      accessorKey: "EdPrice",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Единична цена"
          haveColumnFilter={false}
        />
      ),
      cell: ({ row }) => {
        const EdPrice: number | null = row.getValue("EdPrice");
        const Currency: string | null = row.original.Currency;
        const currencySymbol = Currency?.trim() === "EUR" ? "€" : "лв.";

        return (
          <div className="text-sm">
            {EdPrice && EdPrice > 0 ? `${EdPrice} ${currencySymbol}` : `0.00 ${currencySymbol}`}
          </div>
        );
      },
    },
    {
      accessorKey: "Description",
      header: "Описание",
      cell: ({ row }) => {
        const Description: string | null = row.getValue("Description");
        return (
          <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
            {Description}
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
          <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
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
          <div className="wrap-break-words max-w-sm text-sm whitespace-break-spaces">
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
      cell: ({ row }) => <RowActionsAssets row={row} actions={actions} />,
    },
  ];
