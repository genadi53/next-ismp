"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/table/columnHeader";
import type { BlastingPlan } from "@/server/repositories/pvr";
import { RowActionsBlastingPlan } from "./pvrRowActions";
import { Badge } from "@/components/ui/badge";

export const pvrColumns = ({
  actions,
}: {
  actions: Record<"edit" | "delete", (plan: BlastingPlan) => void>;
}): ColumnDef<BlastingPlan>[] => [
  {
    accessorKey: "ID",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="ID"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      return <div className="max-w-[50px]">{row.getValue("ID")}</div>;
    },
  },
  {
    accessorKey: "OperDate",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Дата"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "BlastingField",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Взривно поле"
        longTitle={["Взривно", "поле"]}
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[50px] text-center wrap-break-word whitespace-normal">
          {row.getValue("BlastingField")}
        </div>
      );
    },
  },
  {
    accessorKey: "Horizont1",
    header: "Хоризонт 1",
    cell: ({ row }) => {
      return <div className="max-w-[50px]">{row.getValue("Horizont1")}</div>;
    },
  },
  {
    accessorKey: "Horizont2",
    header: "Хоризонт 2",
    cell: ({ row }) => {
      return <div className="max-w-[50px]">{row.getValue("Horizont2")}</div>;
    },
  },
  {
    accessorKey: "Drill",
    header: "Сонда",
  },
  {
    accessorKey: "Drill2",
    header: "Сонда 2",
  },
  {
    accessorKey: "Holes",
    header: "Сондажи",
  },
  {
    accessorKey: "Konturi",
    header: "Контури",
  },
  {
    accessorKey: "MineVolume",
    header: "Обем ММ",
  },
  {
    accessorKey: "TypeBlast",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Вид Поле"
        haveColumnFilter={false}
      />
    ),
  },
  {
    accessorKey: "Disabled",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Изключен"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const disabled = !!row.getValue("Disabled");
      return (
        <Badge
          className="mx-auto"
          variant={disabled ? "destructive" : "default"}
        >
          {disabled ? "Да" : "Не"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "Note",
    header: "Забележки",
    cell: ({ row }) => {
      return (
        <div className="wrap whitespace-normal">{row.getValue("Note")}</div>
      );
    },
  },
  {
    accessorKey: "lrd",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Последна редакция"
        longTitle={["Последна", "редакция"]}
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
    accessorKey: "userAdded",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Редактор"
        haveColumnFilter={false}
      />
    ),
    cell: ({ row }) => {
      const userAdded: string | null = row.getValue("userAdded");
      return (
        <div className="wrap max-w-sm text-sm whitespace-break-spaces">
          {userAdded?.replaceAll("@ELLATZITE-MED.COM", "")}
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <RowActionsBlastingPlan row={row} actions={actions} />,
  },
];
