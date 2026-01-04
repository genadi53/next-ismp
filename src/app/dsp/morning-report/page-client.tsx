"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export function MorningReportPageClient() {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const [morningReports] =
    api.dispatcher.morningReport.getAll.useSuspenseQuery();
  const [currentDispatcher] =
    api.dashboard.dispatcher.getCurrent.useSuspenseQuery();

  const { data: selectedReport } =
    api.dispatcher.morningReport.getById.useQuery(
      { id: selectedReportId! },
      { enabled: !!selectedReportId },
    );

  const isReadOnly = false; // This should be determined based on current user vs active dispatcher

  const handleContinue = (reportId: number) => {
    setSelectedReportId(reportId);
  };

  return (
    <>
      {/* Current Dispatcher Info */}
      {currentDispatcher && currentDispatcher.length > 0 && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
          <span className="text-gray-500">Текущ диспечер:</span>{" "}
          <span className="font-semibold text-gray-800">
            {currentDispatcher[0]?.Name}
          </span>
        </div>
      )}

      {/* Permission Alert */}
      {isReadOnly && (
        <Alert className="mb-6 border-red-200 bg-red-50 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Вие не сте текущ Диспечер!</strong> Само активният диспечер
            може да редактира сутрешните отчети.
            {currentDispatcher && currentDispatcher.length > 0 && (
              <span className="mt-1 block">
                Текущ диспечер: {currentDispatcher[0]?.Name} (
                {currentDispatcher[0]?.DispatcherProfile})
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Form Section */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-green-50">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Формуляр за отчет
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Формата за създаване/редактиране на сутрешни отчети ще бъде
            имплементирана в следващ етап.
          </p>
          {selectedReport && (
            <div className="bg-muted mt-4 rounded-lg p-4">
              <p className="mb-2 text-sm font-medium">
                Избран отчет за редактиране:
              </p>
              <p className="text-muted-foreground text-sm">
                Дата: {selectedReport.ReportDate}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table Section */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-blue-50">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Информация за отчет Диспечери
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {morningReports && morningReports.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Започнат от</TableHead>
                    <TableHead>Завършен от</TableHead>
                    <TableHead>Завършен на</TableHead>
                    <TableHead>Изпратен на</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {morningReports.map((report) => (
                    <TableRow key={report.ID} className="hover:bg-muted/50">
                      <TableCell>{report.ID}</TableCell>
                      <TableCell>{report.ReportDate}</TableCell>
                      <TableCell>
                        {report.StartedFromDispatcher || "-"}
                      </TableCell>
                      <TableCell>
                        {report.CompletedFromDispatcher || "-"}
                      </TableCell>
                      <TableCell>
                        {report.CompletedOn
                          ? format(new Date(report.CompletedOn), "yyyy-MM-dd")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {report.SentOn
                          ? format(new Date(report.SentOn), "yyyy-MM-dd")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {report.SentOn ? (
                          <Badge variant="default">Изпратен</Badge>
                        ) : report.CompletedOn ? (
                          <Badge variant="secondary">Завършен</Badge>
                        ) : (
                          <Badge variant="outline">В процес</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!report.CompletedOn && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContinue(report.ID)}
                          >
                            Продължи
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              Няма намерени отчети
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
