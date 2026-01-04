import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../../table/columnHeader";
import type { HermesWorkcard } from "@/types/hermes";
import { RowActionsWorkcards } from "./rowActionsWorkcards";

export const workcardsColumns = ({
  actions,
}: {
  actions: Record<
    "edit" | "print" | "delete",
    (workcard: HermesWorkcard) => void
  >;
}): ColumnDef<HermesWorkcard>[] => [
  {
    accessorKey: "ID",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "Date",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Дата"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "StartTime",
    header: "Време начало-край",
    cell: ({ row }) => {
      const { StartTime, EndTime } = row.original;

      return (
        <div className="">
          <span className="text-base">{`${StartTime} - ${EndTime}`}</span>
        </div>
      );
    },
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
    accessorKey: "CodeAction",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Работна дейност"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const CodeAction: string | null = row.getValue("CodeAction");
      return (
        <div className="text-center text-base">
          <span>{CodeAction}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "Duration",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Работно време"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const { Duration } = row.original;

      if (!Duration) return <div className="text-base">0</div>;

      return (
        <div className="">
          <span className="text-base">
            {`${Duration} (${parseInt(
              new Date(Duration * 1000).toISOString().substring(11, 13),
            )} ч.)`}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "Note",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Бележка"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "WorkingCardId",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID на работна карта"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const WorkingCardId: number | null = row.getValue("WorkingCardId");
      return (
        <div className="text-center text-base">
          <span>{WorkingCardId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "Bukva",
    header: "Буква",
    cell: ({ row }) => {
      const Bukva: number | null = row.getValue("Bukva");
      return (
        <div className="text-center text-base">
          <span>{Bukva}</span>
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "EqmtId",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID на машина"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const eqmtID: number | null = row.getValue("EqmtId");
      return (
        <div className="text-center text-base">
          <span>{eqmtID}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActionsWorkcards row={row} actions={actions} />,
  },
];
