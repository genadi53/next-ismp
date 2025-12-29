"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import type { DmaSupplier } from "@/types/dma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { suppliersColumns } from "@/components/dma/suppliers/columnsSuppliers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Building2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { LoadingSpinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DataTablePagination } from "@/components/table/tablePagination";

export function SuppliersPageClient() {
  const [showForm, setShowForm] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<DmaSupplier | undefined>(
    undefined,
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [suppliers] = api.dma.suppliers.getAll.useSuspenseQuery(undefined);

  const handleEdit = (supplier: DmaSupplier) => {
    setSupplierToEdit(supplier);
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleDelete = (supplier: DmaSupplier) => {
    toast.info("Функционалността за изтриване ще бъде добавена скоро");
  };

  const handleCancelEdit = () => {
    setSupplierToEdit(undefined);
    setShowForm(false);
  };

  const table = useReactTable({
    data: suppliers,
    columns: suppliersColumns({
      actions: {
        edit: handleEdit,
        delete: handleDelete,
      },
    }),
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

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setSupplierToEdit(undefined);
              setShowForm(true);
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }, 100);
            }
          }}
          variant={showForm ? "outline" : "ell"}
          size="lg"
          className={cn(
            "gap-2 transition-colors duration-200",
            showForm &&
              "text-ell-primary hover:text-ell-primary shadow-ell-primary/40",
          )}
        >
          {!showForm ? (
            <>
              <Plus className="h-5 w-5" />
              <span>Нов доставчик</span>
            </>
          ) : (
            <>
              <X className="h-5 w-5" />
              <span>Затвори</span>
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-4 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="text-primary h-6 w-6" />
                <div>
                  <CardTitle className="text-xl">
                    {supplierToEdit
                      ? "Редактиране на доставчик"
                      : "Нов доставчик"}
                  </CardTitle>
                  <CardDescription>
                    {supplierToEdit
                      ? "Актуализирайте данните за избрания доставчик"
                      : "Попълнете формата за добавяне на нов доставчик"}
                  </CardDescription>
                </div>
              </div>
              {supplierToEdit && (
                <Badge variant="secondary" className="ml-2">
                  Режим на редакция
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Формата за създаване/редактиране на доставчици ще бъде
              имплементирана в следващ етап.
            </p>
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Всички доставчици</CardTitle>
                <CardDescription>
                  Преглед и управление на съществуващи доставчици
                </CardDescription>
              </div>
              {suppliers && (
                <Badge variant="outline" className="text-ell-primary text-sm">
                  {suppliers.length}{" "}
                  {suppliers.length === 1 ? "доставчик" : "доставчика"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {suppliers && suppliers.length === 0 && (
              <div className="py-12 text-center">
                <Building2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h3 className="mb-2 text-lg font-semibold">Няма доставчици</h3>
                <p className="text-muted-foreground">
                  Все още няма добавени доставчици.
                </p>
              </div>
            )}

            {suppliers && suppliers.length > 0 && (
              <div className="w-full space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative max-w-md flex-1">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      placeholder="Търсене във всички полета..."
                      value={globalFilter ?? ""}
                      onChange={(event) => setGlobalFilter(event.target.value)}
                      className="pr-9 pl-9"
                    />
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className="font-semibold"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="text-sm">
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
                          <TableCell colSpan={table.getAllColumns().length}>
                            <div className="text-muted-foreground py-8 text-center">
                              Няма намерени доставчици
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <DataTablePagination table={table} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default SuppliersPageClient;
