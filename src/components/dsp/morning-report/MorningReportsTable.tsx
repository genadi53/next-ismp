"use client";

import { Fragment, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, ArrowRight, FilePenLine } from "lucide-react";
import type { MorningReport } from "@/server/repositories/dispatcher";
import { format } from "date-fns";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { DataTablePagination } from "@/components/table/tablePagination";
import { NoResults } from "@/components/NoResults";
import { formatName } from "@/lib/username";
import { decodeBase64 } from "@/lib/utf-decoder";
import { cn } from "@/lib/cn";

interface MorningReportsTableProps {
  reports: MorningReport[];
  isReadOnly?: boolean;
  onContinue?: (reportId: number) => void;
}

// Function to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
  if (typeof window === "undefined") return text;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};


export function MorningReportsTable({
  reports,
  isReadOnly = true,
  onContinue,
}: MorningReportsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRowExpansion = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const isIncomplete = (report: MorningReport) => {
    return !report.CompletedFromDispatcher || !report.SentFrom;
  };

  const getStatusBadge = (report: MorningReport) => {
    if (isIncomplete(report)) {
      return <Badge variant="destructive">Незавършен</Badge>;
    }
    return <Badge variant="default">Завършен</Badge>;
  };

  const columns: ColumnDef<MorningReport>[] = [
    {
      accessorKey: "ID",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">{row.original.ID}</div>,
    },
    {
      accessorKey: "ReportDate",
      header: "За Дата",
      cell: ({ row }) => (
        <div>
          {row.original.ReportDate
            ? format(new Date(row.original.ReportDate), "dd.MM.yyyy")
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "StartedFromDispatcher",
      header: "Започната от Диспечер",
      cell: ({ row }) => {
        const { fullName } = formatName(row.original.StartedFromDispatcher);
        return <div className="flex flex-col">{fullName}</div>;
      },
    },
    {
      accessorKey: "CompletedFromDispatcher",
      header: "Приключен от Диспечер",
      cell: ({ row }) => {
        const { fullName } = formatName(row.original.CompletedFromDispatcher);
        return <div>{fullName}</div>;
      },
    },
    {
      accessorKey: "CompletedOn",
      header: "Приключен на",
      cell: ({ row }) => (
        <div>
          {row.original.CompletedOn
            ? format(new Date(row.original.CompletedOn), "dd.MM.yyyy HH:mm")
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "SentFrom",
      header: "Изпратен от",
      cell: ({ row }) => {
        const { fullName } = formatName(row.original.SentFrom);
        return <div>{fullName}</div>;
      },
    },
    {
      accessorKey: "SentOn",
      header: "Изпратен на",
      cell: ({ row }) => (
        <div>
          {row.original.SentOn
            ? format(new Date(row.original.SentOn), "dd.MM.yyyy HH:mm")
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => getStatusBadge(row.original),
    },
    {
      id: "actions",
      header: "Действия",
      cell: ({ row }) => (
        <div className={cn("flex gap-2 justify-center", isReadOnly && "pr-4")} >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleRowExpansion(row.original.ID)}
            className="hover:bg-blue-50 hover:text-blue-700"
            title="Преглед"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {!isReadOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onContinue?.(row.original.ID);
              }}
              disabled={isReadOnly}
              title="Продължи редактиране"
              className="hover:bg-green-50 hover:text-green-700"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-gray-50 hover:bg-gray-50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`font-semibold text-gray-700 ${header.id === "ID" ? "w-[80px]" : ""
                      } ${header.id === "actions" ? "w-[100px]" : ""}`}
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
              table.getRowModel().rows.map((row, idx) => {
                const report = row.original;
                return (
                  <Fragment key={`${report.ID}_${idx}`}>
                    <TableRow
                      key={row.id}
                      className={`transition-colors hover:bg-gray-50 ${isIncomplete(report) ? "bg-red-50/50" : ""
                        }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {expandedRows.has(report.ID) && (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="bg-gray-50 p-4"
                        >
                          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                            <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                              <span>📄</span> Пълен текст на отчета:
                            </h4>
                            <div
                              className="prose max-w-none rounded border border-gray-200 bg-gray-50 p-4"
                              dangerouslySetInnerHTML={{
                                __html: report.ReportBody
                                  ? decodeHtmlEntities(
                                    decodeBase64(report.ReportBody),
                                  )
                                  : "Няма съдържание",
                              }}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center text-gray-500"
                >
                  <NoResults
                    title="Няма намерени сутрешни отчети"
                    description="Опитайте да заредите страницата отново или се свържете с администратор."
                    icon={
                      <FilePenLine className="text-ell-primary/50 size-12" />
                    }
                  />
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
