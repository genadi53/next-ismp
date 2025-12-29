"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "../table/tablePagination";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoResults } from "@/components/NoResults";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTableLoads<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

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
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  const isFiltered = columnFilters.length > 0 || globalFilter.length > 0;

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Търси по багер, камион или материал..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-9 pr-9"
          />
          {globalFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGlobalFilter("")}
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
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
            <X className="mr-2 h-4 w-4" />
            Изчисти филтри
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
                  className="transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-normal wrap-break-word text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <NoResults
                    title={
                      isFiltered
                        ? "Няма резултати, отговарящи на филтрите"
                        : "Няма намерени резултати"
                    }
                    description={
                      isFiltered
                        ? "Опитайте да промените търсачката или филтрите"
                        : "Няма намерени резултати за добавени курсове"
                    }
                    icon={
                      isFiltered ? (
                        <Filter className="size-12 text-ell-primary/50" />
                      ) : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}

