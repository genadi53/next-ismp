"use client";

import { useState, useEffect, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/trpc/react";
import { AlertTriangle } from "lucide-react";
import { MorningReportForm } from "@/components/dsp/morning-report/MorningReportForm";
import { MorningReportEdit } from "@/components/dsp/morning-report/MorningReportEdit";
import { MorningReportsTable } from "@/components/dsp/morning-report/MorningReportsTable";

export function MorningReportPageClient() {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [dispatcher, setDispatcher] = useState<string>("");

  const [morningReports] =
    api.dispatcher.morningReport.getAll.useSuspenseQuery();
  const [currentDispatcher] =
    api.dashboard.dispatcher.getCurrent.useSuspenseQuery();

  // Find the most recent incomplete report (equivalent to startedMorningReport)
  const startedMorningReport = useMemo(() => {
    return (
      morningReports?.find((report) => !report.CompletedOn) ?? null
    );
  }, [morningReports]);

  const { data: selectedReport } =
    api.dispatcher.morningReport.getById.useQuery(
      { id: selectedReportId! },
      { enabled: !!selectedReportId },
    );

  // Determine which report to show in the form (selected report takes precedence)
  const activeReport = selectedReport ?? startedMorningReport ?? null;

  useEffect(() => {
    // Get dispatcher username from current dispatcher query
    if (currentDispatcher?.length > 0) {
      setDispatcher(currentDispatcher[0]?.DispatcherProfile ?? "");
    }
  }, [currentDispatcher]);

  // Check if user is current dispatcher (read-only mode)
  // Note: Original has isReadOnly = false hardcoded, but keeping the logic for future use
  const isReadOnly = false;

  const handleContinue = (reportId: number) => {
    setSelectedReportId(reportId);
  };

  const handleCancelEdit = () => {
    setSelectedReportId(null);
  };

  const handleFormSubmit = (success: boolean) => {
    if (success) {
      // Clear selected report after successful submit
      setSelectedReportId(null);
    }
  };

  // Loading state
  if (!currentDispatcher) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Зареждане...</div>
      </div>
    );
  }

  return (
    <>
      {/* Permission Alert */}
      {isReadOnly && (
        <Alert className="border-red-200 bg-red-50 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Вие не сте текущ Диспечер!</strong> Само активният диспечер
            може да редактира сутрешните отчети.
            {currentDispatcher?.length > 0 && (
              <span className="block mt-1">
                Текущ диспечер: {currentDispatcher[0]?.Name} (
                {currentDispatcher[0]?.DispatcherProfile})
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Формуляр за отчет
          </h2>
        </div>
        <div className="p-6">
          {activeReport ? (
            <MorningReportEdit
              report={activeReport}
              dispatcher={dispatcher}
              onSuccess={() => handleFormSubmit(true)}
              onCancel={handleCancelEdit}
            />
          ) : (
            <MorningReportForm
              dispatcher={dispatcher}
              onSuccess={() => handleFormSubmit(true)}
            />
          )}
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Информация за отчет Диспечери
          </h2>
        </div>
        <div className="p-6">
          {morningReports?.length > 0 ? (
            <MorningReportsTable
              reports={morningReports}
              isReadOnly={isReadOnly}
              onContinue={handleContinue}
            />
          ) : (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500 flex items-center gap-2">
                <span className="animate-spin">⏳</span> Зареждане...
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
