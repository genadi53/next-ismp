"use client";
import AppLayout from "@/components/AppLayout";
import { Suspense, useMemo, useState } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { api } from "@/trpc/react";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Container } from "@/components/Container";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { buildRepairRequestsEmailTemplate } from "@/lib/email/requestRepairsTemplate";

export default function RequestsRepairsPage() {
    const searchParams = useSearchParams();
    const [dateStr, _setDateStr] = useState<string>(searchParams.get("date") || format(new Date(), 'yyyy-MM-dd'))
    const { data: requestRepairs } = api.dispatcher.repairs.getRequests.useQuery({ date: dateStr });

    const utils = api.useUtils();

    const { mutateAsync: sentRepairsEmail, isPending: isSendingRepairsEmail } = api.dispatcher.repairs.markSent.useMutation({
        onSuccess: () => {
            toast({
                title: "Успех",
                description: "Имейлът с заявките за ремонт е изпратен успешно.",
            });
            void utils.dispatcher.repairs.getRequests.invalidate();
        },
        onError: (error) => {
            toast({
                title: "Грешка",
                description: error.message || "Възникна грешка при изпращането на имейла. Опитайте отново.",
                variant: "destructive",
            });
        },
    });

    const [showPreview, setShowPreview] = useState(false);

    const previewHtml = useMemo(
        () =>
            requestRepairs
                ? buildRepairRequestsEmailTemplate(requestRepairs, dateStr)
                : "",
        [requestRepairs, dateStr],
    );
    return (
        <AppLayout>
            <Suspense
                fallback={
                    <div className="flex flex-col items-center justify-center py-12">
                        <LoadingSpinner
                            size="lg"
                            label="Зареждане на данни..."
                            showLabel
                        />
                    </div>
                }
            >
                <Container title={`Заявки за ремонти за дата ${dateStr}`}
                    headerChildren={
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="min-w-[150px]"
                                type="button"
                                onClick={() => setShowPreview((prev) => !prev)}
                                disabled={!requestRepairs || requestRepairs.length === 0}
                            >
                                {showPreview ? "Скрий шаблона" : "Преглед на шаблона"}
                            </Button>
                            <Button
                                variant="ell"
                                className="min-w-[120px]"
                                onClick={() => sentRepairsEmail({ date: dateStr })}
                                disabled={isSendingRepairsEmail}
                            >
                                {isSendingRepairsEmail ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Изпращане...
                                    </>
                                ) : (
                                    "Изпрати имейл"
                                )}
                            </Button>
                        </div>
                    }>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-2.5 py-1 text-left">
                                        ID
                                    </th>
                                    <th className="border border-gray-300 px-2.5 py-1 text-left min-w-28">
                                        Дата
                                    </th>
                                    <th className="border border-gray-300 px-2.5 py-1 text-left">
                                        Машина
                                    </th>
                                    <th className="border border-gray-300 px-2.5 py-1 text-left">
                                        Бр. Сондажи
                                    </th>
                                    <th className="border border-gray-300 px-2.5 py-1 text-left">
                                        Заявка
                                    </th>
                                    <th className="border border-gray-300 px-2.5 py-1 text-left">
                                        Създаден от
                                    </th>
                                    <th className="border border-gray-300 px-2.5 py-1 text-left">
                                        Създаден на
                                    </th>
                                    <th className="border border-gray-300 px-2.5 py-1 text-left">
                                        Изпратен на
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {requestRepairs?.map((request) => (
                                    <tr key={request.ID} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-2.5 py-1">
                                            {request.ID}
                                        </td>
                                        <td className="border border-gray-300 px-2.5 py-1 w-fit">
                                            {request.RequestDate}
                                        </td>
                                        <td className="border border-gray-300 px-2.5 py-1">
                                            {request.Equipment}
                                        </td>
                                        <td className="border border-gray-300 px-2.5 py-1">
                                            {request.DrillHoles_type ?? "-"}
                                        </td>
                                        <td className="border border-gray-300 px-2.5 py-1">
                                            {request.RequestRemont?.replace(/is\|\|mp/g, ";")}
                                        </td>
                                        <td className="border border-gray-300 px-2.5 py-1">
                                            {request.addUser?.replace(/\(/g, "\n(")}
                                        </td>
                                        <td className="border border-gray-300 px-2.5 py-1">
                                            {request.lrd}
                                        </td>
                                        <td className="border border-gray-300 px-2.5 py-1">
                                            {request.SentReportOn}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {showPreview && previewHtml && (
                        <div className="mt-8 border rounded-md overflow-hidden">
                            <iframe
                                title="repair-email-preview"
                                srcDoc={previewHtml}
                                style={{ width: "100%", minHeight: "600px", border: "none" }}
                            />
                        </div>
                    )}
                </Container>
            </Suspense>
        </AppLayout>
    );
}

