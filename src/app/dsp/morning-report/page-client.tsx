"use client";

import { useState, } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/trpc/react";
import { AlertTriangle } from "lucide-react";
import { MorningReportEdit } from "@/components/dsp/morning-report/MorningReportEdit";
import { MorningReportsTable } from "@/components/dsp/morning-report/MorningReportsTable";
import { DispatcherSystemNames } from "@/lib/constants";

export function MorningReportPageClient() {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const [morningReports] = api.dispatcher.morningReport.getAll.useSuspenseQuery();
  const [currentDispatcher] = api.dashboard.dispatcher.getCurrent.useSuspenseQuery();
  const { data: userData } = api.auth.getCurrentUser.useQuery();

  // Find the most recent incomplete report (equivalent to startedMorningReport)
  // const startedMorningReport = useMemo(() => {
  //   if (!morningReports?.length) return null;
  //   const incomplete = morningReports.filter((r) => !r.CompletedOn && (r.ReportDate === format(today, 'yyyy-MM-dd') || r.ReportDate === format(subDays(today, 1), 'yyyy-MM-dd')));
  //   if (incomplete.length === 0) return null;
  // }, [morningReports]);

  const { data: selectedReport } = api.dispatcher.morningReport.getById.useQuery(
    { id: selectedReportId! },
    { enabled: !!selectedReportId },
  );

  // Determine which report to show in the form (selected report takes precedence)
  const activeReport = selectedReport
    // ?? startedMorningReport 
    ?? null;

  // Only the current dispatcher can edit. Read-only when user is NOT the current dispatcher.
  console.log(currentDispatcher)
  console.log(userData)

  const isReadOnly = !currentDispatcher || !Object.values(DispatcherSystemNames).includes(userData?.user?.username ?? "")
  // !!currentDispatcher && (userData?.user?.username ?? "") !== (currentDispatcher.DispatcherProfile ?? "");
  console.log("isReadOnly " + isReadOnly)
  console.log(Object.values(DispatcherSystemNames).includes(userData?.user?.username ?? ""))



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
      {userData?.user && isReadOnly && (
        <Alert className="border-red-200 bg-red-50 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Вие не сте текущ Диспечер!</strong> Само активният диспечер
            може да редактира сутрешните отчети.
            {currentDispatcher && (
              <span className="block mt-1">
                Текущ диспечер: {currentDispatcher.Name} (
                {currentDispatcher.DispatcherProfile})
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-linear-to-r from-blue-50 to-green-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Формуляр за отчет
          </h2>
        </div>
        <div className="p-6">
          {
            !isReadOnly && userData?.user && <MorningReportEdit
              report={activeReport ?? undefined}
              dispatcher={userData.user.fullName}
              onSuccess={() => {
                setSelectedReportId(null);
              }}
              onCancel={() => {
                setSelectedReportId(null);
              }}
            />
          }
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-linear-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Информация за предходни отчети
          </h2>
        </div>
        <div className="p-6">
          <MorningReportsTable
            reports={morningReports ?? []}
            isReadOnly={isReadOnly}
            onContinue={(reportId: number) => {
              setSelectedReportId(reportId);
            }}
          />
        </div>
      </div>
    </>
  );
}
