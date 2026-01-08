"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../../table/columnHeader";
import type { HermesWorkcard } from "@/server/repositories/hermes";
import { RowActionsWorkcards } from "./rowActionsWorkcards";
import { format } from "date-fns";

export const workcardsColumns = ({
  actions,
}: {
  actions: Record<
    "edit" | "print" | "delete",
    (workcard: HermesWorkcard) => void
  >;
}): ColumnDef<HermesWorkcard>[] => [
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
    accessorKey: "Date",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Дата"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const date: Date = row.getValue("Date");
      return (
        <div className="text-sm">
          {date && new Date(date).toLocaleDateString("bg-BG")}
        </div>
      );
    },
  },
  {
    accessorKey: "StartTime",
    header: "Време начало-край",
    cell: ({ row }) => {
      console.log(row);
      const StartTime: Date | null = row.original.StartTime;
      const EndTime: Date | null = row.original.EndTime;

      if (!StartTime || !EndTime) return <div className="text-base">-</div>;

      return (
        <div className="">
          {
            <span className="text-base">{`${format(new Date(StartTime), "HH:mm")} - ${format(new Date(EndTime), "HH:mm")}`}</span>
          }
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
