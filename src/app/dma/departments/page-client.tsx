"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import type { DmaDepartment } from "@/types/dma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { departmentsColumns } from "@/components/dma/departments/columnsDepartments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Building2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { LoadingSpinner } from "@/components/ui/spinner";
import { NoResults } from "@/components/NoResults";
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

export function DepartmentsPageClient() {
  const [showForm, setShowForm] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<
    DmaDepartment | undefined
  >(undefined);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [departments] = api.dma.departments.getAll.useSuspenseQuery(undefined);

  const handleEdit = (department: DmaDepartment) => {
    setDepartmentToEdit(department);
    setShowForm(true);
  };

  const handleDelete = (department: DmaDepartment) => {
    toast.info("Функционалността за изтриване ще бъде добавена скоро");
  };

  const handleFormCancel = () => {
    setDepartmentToEdit(undefined);
    setShowForm(false);
  };

  const table = useReactTable({
    data: departments,
    columns: departmentsColumns({
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
      {/* Header Button */}
      <div className="mb-4 flex justify-end">
        <Button
          onClick={() => {
            setShowForm((curr) => !curr);
            if (showForm) {
              setDepartmentToEdit(undefined);
            }
          }}
          variant={showForm ? "outline" : "ell"}
          size="lg"
          className={cn(
            "gap-2 transition-all duration-300 ease-in-out",
            showForm &&
              "text-ell-primary hover:text-ell-primary shadow-ell-primary/40",
          )}
        >
          {!showForm ? (
            <>
              <Plus className="animate-in fade-in spin-in-0 h-5 w-5 duration-300" />
              <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                Добави дирекция
              </span>
            </>
          ) : (
            <>
              <X className="animate-in fade-in spin-in-90 h-5 w-5 duration-300" />
              <span className="animate-in fade-in slide-in-from-right-2 duration-300">
                Затвори
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="mb-4 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Plus className="text-ell-primary h-5 w-5" />
              <div>
                <CardTitle className="text-xl">
                  {departmentToEdit
                    ? "Редактиране на дирекция"
                    : "Добавяне на нова дирекция"}
                </CardTitle>
                <CardDescription>
                  Попълнете формата за създаване или редакция на дирекция
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Формата за създаване/редактиране на дирекции ще бъде
              имплементирана в следващ етап.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Departments List */}
      {!showForm && (
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Списък с дирекции</CardTitle>
                <CardDescription>
                  Преглед и управление на съществуващи дирекции
                </CardDescription>
              </div>
              {departments && (
                <Badge variant="outline" className="text-ell-primary text-sm">
                  {departments.length}{" "}
                  {departments.length === 1 ? "дирекция" : "дирекции"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {(!departments || departments.length === 0) && (
              <NoResults
                icon={<Building2 className="text-ell-primary/50 size-12" />}
                title="Няма добавени дирекции"
                description="Започнете като добавите първата дирекция чрез бутона отгоре"
              />
            )}

            {departments && departments.length > 0 && (
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
                              Няма намерени дирекции
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
