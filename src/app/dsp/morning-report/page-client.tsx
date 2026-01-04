"use client";

import { useState, useEffect } from "react";
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
import { MorningReportForm } from "@/components/dsp/morning-report/MorningReportForm";
import { MorningReportEdit } from "@/components/dsp/morning-report/MorningReportEdit";

export function MorningReportPageClient() {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [dispatcher, setDispatcher] = useState<string>("");

  const [morningReports] =
    api.dispatcher.morningReport.getAll.useSuspenseQuery();
  const [currentDispatcher] =
    api.dashboard.dispatcher.getCurrent.useSuspenseQuery();

  const { data: selectedReport } =
    api.dispatcher.morningReport.getById.useQuery(
      { id: selectedReportId! },
      { enabled: !!selectedReportId },
    );

  useEffect(() => {
    // Get dispatcher username from current dispatcher query
    if (currentDispatcher && currentDispatcher.length > 0) {
      setDispatcher(currentDispatcher[0]?.DispatcherProfile || "");
    }
  }, [currentDispatcher]);

  // Check if user is current dispatcher (read-only mode)
  const isReadOnly =
    currentDispatcher &&
    currentDispatcher.length > 0 &&
    dispatcher !== currentDispatcher[0]?.DispatcherProfile;

  const handleContinue = (reportId: number) => {
    setSelectedReportId(reportId);
  };

  const handleCancelEdit = () => {
    setSelectedReportId(null);
  };

  const handleFormSuccess = () => {
    setSelectedReportId(null);
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
            {selectedReport
              ? "Редактиране на отчет"
              : "Формуляр за отчет"}
          </CardTitle>
          <CardDescription>
            {selectedReport
              ? "Редактирайте съществуващ отчет"
              : "Създайте нов сутрешен отчет"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {selectedReport ? (
            <MorningReportEdit
              report={selectedReport}
              dispatcher={dispatcher}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelEdit}
            />
          ) : (
            <MorningReportForm
              dispatcher={dispatcher}
              onSuccess={handleFormSuccess}
            />
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
                        {!report.CompletedOn && !isReadOnly && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContinue(report.ID)}
                          >
                            Продължи
                          </Button>
                        )}
                        {report.CompletedOn && !report.SentOn && (
                          <Badge variant="secondary">Завършен</Badge>
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
