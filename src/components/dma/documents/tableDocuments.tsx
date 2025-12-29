"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "../../table/tablePagination";
import { Search, X, FileText } from "lucide-react";
import { NoResults } from "@/components/NoResults";
import { cn } from "@/lib/cn";
import { DataTableViewOptions } from "./viewOptionsDocuments";
import React from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTableDocuments<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      "Последна редакция на": false,
      "Създаден от / Отпечатан": false,
      "Код Инвестиция": false,
    });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: (updater) => {
      setColumnVisibility((old) => {
        const newValue = typeof updater === "function" ? updater(old) : updater;
        return newValue ?? old;
      });
    },
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
  });

  const isFiltered = columnFilters.length > 0 || globalFilter.length > 0;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Търсене във всички полета..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 pr-9"
          />
          {globalFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGlobalFilter("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isFiltered && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setGlobalFilter("");
              setColumnFilters([]);
            }}
            className="h-10 text-red-500"
          >
            <X className="h-4 w-4 mr-2" />
            Изчисти филтри
          </Button>
        )}

        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-lg border overflow-hidden">
        <UITable>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="px-2">
                {headerGroup.headers.map((header, idx) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "font-semibold px-2 py-1.5 h-auto",
                        idx === 0 && "pl-2"
                      )}
                    >
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
                  className="hover:bg-muted/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell, idx) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "text-sm whitespace-normal break-words px-2 py-1.5",
                        idx === 0 && "pl-2"
                      )}
                    >
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
                <TableCell colSpan={columns.length}>
                  <NoResults
                    title="Няма намерени документи"
                    description={
                      isFiltered
                        ? "Опитайте да промените филтрите за търсене"
                        : "Няма документи в системата"
                    }
                    icon={<FileText className="size-12 text-ell-primary/50" />}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

