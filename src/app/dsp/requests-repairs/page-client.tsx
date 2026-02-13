"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/react";
import { AlertTriangle, Info, Wrench } from "lucide-react";
import { RequestRepairForm } from "@/components/dsp/requests-repairs/RequestRepairForm";
import { Container } from "@/components/Container";
import Link from "next/link";

export function RequestsRepairsPageClient() {
  const [requestRepairs] =
    api.dispatcher.repairs.getRequests.useSuspenseQuery(undefined);

  return (
    <Container
      title="Заявки за ремонти"
      description="Управление на заявки за ремонти на оборудване"
    >
      {/* Important Notices */}
      <div className="mb-6 flex flex-col gap-4">
        <Alert variant="default" className="border-blue-300 bg-blue-50">
          <Info className="mt-2 h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Важна информация</AlertTitle>
          <AlertDescription className="text-blue-700">
            Заявки създадени през деня от 8:00 до 5:00 се изпращат само те!
          </AlertDescription>
        </Alert>

        <Alert variant="default" className="border-orange-300 bg-orange-50">
          <AlertTriangle className="mt-2 h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Внимание</AlertTitle>
          <AlertDescription className="text-orange-700">
            За една дата и машина може да се изпрати само една заявка!
          </AlertDescription>
        </Alert>
      </div>

      {/* Form Section */}
      <Card className="mb-6 shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <Wrench className="text-primary h-6 w-6" />
            <div>
              <CardTitle className="text-xl">Създаване на заявка</CardTitle>
              <CardDescription>
                Попълнете формата за да създадете нова заявка за ремонт
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RequestRepairForm />
        </CardContent>
      </Card>

      {/* Requests History */}
      <Card>
        <CardHeader>
          <CardTitle>Информация за последните 50 заявки</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <td className="border border-gray-300 px-2.5 py-1">
                      <Link
                        href={`/dsp/requests-repairs-report?date=${request.RequestDate}`}
                        className="text-blue-600 hover:underline"
                      >
                        {request.RequestDate}
                      </Link>
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
        </CardContent>
      </Card>
    </Container>
  );
}
