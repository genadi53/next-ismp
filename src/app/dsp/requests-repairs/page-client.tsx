"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { api } from "@/trpc/react";
import { AlertCircle, AlertTriangle, Info, Wrench } from "lucide-react";
import Link from "next/link";

export function RequestsRepairsPageClient() {
  const [requestRepairs] =
    api.dispatcher.repairs.getRequests.useSuspenseQuery(undefined);

  return (
    <>
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
          <p className="text-muted-foreground">
            Формата за създаване на заявки за ремонти ще бъде имплементирана в
            следващ етап.
          </p>
        </CardContent>
      </Card>

      {/* Requests History */}
      <Card>
        <CardHeader>
          <CardTitle>Информация за последните 50 заявки</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Машина</TableHead>
                  <TableHead>Заявка</TableHead>
                  <TableHead>Създаден от</TableHead>
                  <TableHead>Създаден на</TableHead>
                  <TableHead>Изпратен на</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestRepairs && requestRepairs.length > 0 ? (
                  requestRepairs.map((request) => (
                    <TableRow key={request.ID} className="hover:bg-muted/50">
                      <TableCell>{request.ID}</TableCell>
                      <TableCell>
                        <Link
                          href={`/dsp/requests-repairs-report?date=${request.RequestDate}`}
                          className="text-blue-600 hover:underline"
                        >
                          {request.RequestDate}
                        </Link>
                      </TableCell>
                      <TableCell>{request.Equipment}</TableCell>
                      <TableCell>
                        {request.RequestRemont?.replace(/is\|\|mp/g, ";")}
                      </TableCell>
                      <TableCell>
                        {request.addUser?.replace(/\(/g, "\n(")}
                      </TableCell>
                      <TableCell>{request.lrd}</TableCell>
                      <TableCell>{request.SentReportOn || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      <div className="text-muted-foreground">
                        Няма намерени заявки
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
