import { type ColumnDef } from "@tanstack/react-table";
import type { DmaDocument } from "@/server/repositories/dma";
import { RowActionsDocuments } from "./rowActionsDocuments";
import { DataTableColumnHeader } from "@/components/table/columnHeader";

export const columnsDocuments = ({
  actions,
}: {
  actions: Record<"edit" | "print" | "delete", (document: DmaDocument) => void>;
}): ColumnDef<DmaDocument>[] => [
  {
    accessorKey: "ID",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => (
      <div className="wrap-break-words max-w-[40px] text-sm whitespace-break-spaces">
        {row.getValue("ID")}
      </div>
    ),
  },
  {
    accessorKey: "Тип на документа / Дата",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Тип на документа / Дата"
        longTitle={["Тип на документа", "Дата"]}
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => (
      <div className="wrap-break-words max-w-[150px] text-sm whitespace-break-spaces">
        {row.getValue("Тип на документа / Дата")}
      </div>
    ),
  },
  {
    accessorKey: "Доставчици",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Доставчици"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => (
      <div className="wrap-break-words max-w-[150px] text-sm whitespace-break-spaces">
        {row.getValue("Доставчици")}
      </div>
    ),
  },
  {
    accessorKey: "Фактура / Дата",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Фактура / Дата"
        longTitle={["Фактура", "Дата"]}
        splitString="/"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const value = row.getValue("Фактура / Дата");
      const parts = typeof value === "string" ? value.split("/") : ["", ""];
      return (
        <div className="wrap-break-words max-w-[100px] text-sm whitespace-break-spaces">
          <span>{parts[0]}</span>
          <span>{parts[1]}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "Дирекция",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Дирекция"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => (
      <div className="wrap-break-words max-w-[100px] text-sm whitespace-break-spaces">
        {row.getValue("Дирекция")}
      </div>
    ),
  },
  {
    accessorKey: "Реконструкция",
    header: "Реконструкция",
    cell: ({ row }) => (
      <div className="wrap-break-words max-w-[120px] text-sm whitespace-break-spaces">
        {row.getValue("Реконструкция") ?? "Не"}
      </div>
    ),
  },
  {
    accessorKey: "Стойност на акта",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          column={column}
          title="Стойност на акта"
          haveColumnFilter={false}
        />
      );
    },
    cell: ({ row }) => {
      const value = row.getValue("Стойност на акта");
      const displayValue =
        typeof value === "string" || typeof value === "number"
          ? String(value)
          : null;
      return (
        <div className="wrap-break-words text-sm whitespace-break-spaces">
          {displayValue ?? "0.00 лв."}
        </div>
      );
    },
  },
  {
    accessorKey: "Актив/Сериен №",
    header: "Актив / Сериен №",
    cell: ({ row }) => {
      const isEmpty = row.original["Актив / Сериен №"]?.trim() === "/ SN:";
      return (
        <div
          className={
            "wrap-break-words max-w-[200px] text-sm whitespace-break-spaces"
          }
        >
          {!isEmpty && row.original["Актив / Сериен №"]?.trim()}
        </div>
      );
    },
  },
  {
    accessorKey: "Код Инвестиция",
    header: "Код Инвестиция",
  },
  {
    accessorKey: "Създаден от / Отпечатан",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          column={column}
          title="Създаден от / Отпечатан"
          longTitle={["Създаден от", "Отпечатан"]}
          splitString="/"
          haveColumnFilter={false}
        />
      );
    },
    cell: ({ row }) => {
      const createdBy: string | null = row.getValue("Създаден от / Отпечатан");
      return (
        <div className="wrap-break-words max-w-[200px] text-sm whitespace-break-spaces">
          {createdBy ? (
            <div className="flex flex-col">
              {createdBy
                .replaceAll("@ELLATZITE-MED.COM", "")
                .split("(")
                .map((str, idx) => (
                  <span key={str + idx}>{idx === 1 ? "(" + str : str}</span>
                ))}
            </div>
          ) : (
            ""
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "Последна редакция от",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          column={column}
          title="Последна редакция от"
          haveColumnFilter={false}
        />
      );
    },
    cell: ({ row }) => {
      const editedBy: string | null = row.getValue("Последна редакция от");
      return (
        <div className="wrap-break-words max-w-[200px] text-sm whitespace-break-spaces">
          {editedBy ? (
            <div className="flex flex-col">
              {editedBy
                .replaceAll("@ELLATZITE-MED.COM", "")
                .split("(")
                .map((str, idx) => (
                  <span key={str + idx}>{idx === 1 ? "(" + str : str}</span>
                ))}
            </div>
          ) : (
            ""
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "Последна редакция на",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader
          column={column}
          title="Дата последна редакция"
          haveColumnFilter={false}
        />
      );
    },
    cell: ({ row }) => (
      <div className="max-w-[100px] truncate">
        {row.getValue("Последна редакция на")}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const document = row.original;
      return <RowActionsDocuments document={document} actions={actions} />;
    },
  },
];
