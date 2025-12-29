"use client";

import { api } from "@/trpc/react";
import type { DmaReport } from "@/types/dma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ReportsPageClient() {
  const [reports] = api.dma.assets.getReports.useSuspenseQuery(undefined);

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl">Отчет за актове</CardTitle>
            <CardDescription>
              Преглед на всички отчети за ДМА актове
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {reports && reports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Няма отчети</h3>
            <p className="text-muted-foreground">
              Все още няма генерирани отчети за актове.
            </p>
          </div>
        )}

        {reports && reports.length > 0 && (
          <div className="rounded-lg border overflow-hidden mt-6">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Година</TableHead>
                  <TableHead className="font-semibold">Месец</TableHead>
                  <TableHead className="font-semibold">Брой актове</TableHead>
                  <TableHead className="font-semibold">Обща стойност</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report, index) => (
                  <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="text-sm">{report.Year}</TableCell>
                    <TableCell className="text-sm">{report.Month}</TableCell>
                    <TableCell className="text-sm">{report.DocumentCount}</TableCell>
                    <TableCell className="text-sm">
                      {report.TotalAmount ? `${Number(report.TotalAmount).toFixed(2)} лв.` : "0.00 лв."}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

