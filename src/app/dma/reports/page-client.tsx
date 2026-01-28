"use client";

import { api } from "@/trpc/react";
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
import { Badge } from "@/components/ui/badge";

export function ReportsPageClient() {
  const [reports] = api.dma.assets.getReports.useSuspenseQuery(undefined);

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-primary h-6 w-6" />
            <div>
              <CardTitle className="text-xl">Отчет за актове</CardTitle>
              <CardDescription>
                Преглед на всички отчети за ДМА актове
              </CardDescription>
            </div>
          </div>
          {reports?.length > 0 && (
            <Badge variant="outline" className="text-ell-primary text-sm">
              {reports.length} {reports.length === 1 ? "запис" : "записа"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {reports?.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Няма отчети</h3>
            <p className="text-muted-foreground">
              Все още няма генерирани отчети за актове.
            </p>
          </div>
        )}

        {reports?.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">
                    Тип документ / Дата
                  </TableHead>
                  <TableHead className="font-semibold">Доставчици</TableHead>
                  <TableHead className="font-semibold">Фактура / Дата</TableHead>
                  <TableHead className="font-semibold">Код</TableHead>
                  <TableHead className="font-semibold">Дирекция</TableHead>
                  <TableHead className="font-semibold">Стойност</TableHead>
                  <TableHead className="font-semibold">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow
                    key={report.ID}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="text-sm font-medium">
                      {report.ID}
                    </TableCell>
                    <TableCell className="text-sm">
                      {report["Тип на документа / Дата"]}
                    </TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      {report["Доставчици"]}
                    </TableCell>
                    <TableCell className="text-sm">
                      {report["Фактура / Дата"]}
                    </TableCell>
                    <TableCell className="text-sm">
                      {report["Код"] ?? "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {report["Дирекция"]}
                    </TableCell>
                    <TableCell className="text-sm text-right">
                      {report["Стойност на акта"]
                        ? `${Number(report["Стойност на акта"]).toFixed(2)} лв.`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {report["Отпечатан"] ? (
                        <Badge variant="default" className="bg-green-600">
                          Отпечатан
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Неотпечатан</Badge>
                      )}
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
