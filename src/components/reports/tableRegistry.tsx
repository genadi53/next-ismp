"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/table/tablePagination";
import type { ReportsRegistry } from "@/server/repositories/reports";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTableRegistry<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center py-4">
        <Input
          placeholder="Търси в регистъра..."
          value={
            (table
              .getColumn("RequestDescription")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table
              .getColumn("RequestDescription")
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Няма намерени резултати.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

export const registryColumns: ColumnDef<ReportsRegistry>[] = [
  {
    accessorKey: "ID",
    header: "ID",
    cell: ({ row }) => {
      const id = row.getValue("ID");
      const idStr = typeof id === "string" || typeof id === "number" ? String(id) : "";
      return (
        <Link
          href={`/reports/registry?id=${idStr}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {idStr}
        </Link>
      );
    },
  },
  {
    accessorKey: "RequestDate",
    header: "Дата",
    cell: ({ row }) => {
      const date: string = row.getValue("RequestDate") ?? "";
      return <div className="whitespace-nowrap">{date}</div>;
    },
  },
  {
    accessorKey: "RequestID",
    header: "Заявка",
    cell: ({ row }) => {
      const value = row.getValue("RequestID");
      return typeof value === "string" || typeof value === "number" ? String(value) : "-";
    },
  },
  {
    accessorKey: "ReportName",
    header: "Отчет",
    cell: ({ row }) => {
      const value = row.getValue("ReportName");
      return typeof value === "string" || typeof value === "number" ? String(value) : "-";
    },
  },
  {
    accessorKey: "RequestedFrom",
    header: "Заявен от",
    cell: ({ row }) => {
      const requestedFrom: string = row.getValue("RequestedFrom") ?? "";
      const requestDepartment = row.original.RequestDepartment ?? "";
      return (
        <div>
          {requestedFrom} / {requestDepartment}
        </div>
      );
    },
  },
  {
    accessorKey: "WorkAcceptedFrom",
    header: "Изработен от",
    cell: ({ row }) => {
      const value = row.getValue("WorkAcceptedFrom");
      return typeof value === "string" || typeof value === "number" ? String(value) : "-";
    },
  },
  {
    accessorKey: "CompletedWorkOn",
    header: "Приключила на",
    cell: ({ row }) => {
      const date: string = row.getValue("CompletedWorkOn") ?? "";
      return <div className="whitespace-nowrap">{date ?? "-"}</div>;
    },
  },
  {
    accessorKey: "RequestDescription",
    header: "Кратко описание",
    cell: ({ row }) => {
      const value = row.getValue("RequestDescription");
      return typeof value === "string" || typeof value === "number" ? String(value) : "-";
    },
  },
];
