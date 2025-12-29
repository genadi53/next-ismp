"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Placeholder for PlanGasForm component
function PlanGasFormPlaceholder() {
  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        PlanGasForm component will be migrated in the next phase. This is a
        complex form with gas measurements that requires migration of components
        and schemas from the old project.
      </AlertDescription>
    </Alert>
  );
}

export function PlanGasPageClient() {
  const [measurements] = api.pvr.gas.getAll.useSuspenseQuery();

  return (
    <div className="space-y-6">
      {/* Form */}
      <PlanGasFormPlaceholder />

      {/* Measurements History */}
      <Card>
        <CardHeader>
          <CardTitle>Информация за всички последните 100 записа</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="max-w-[150px]">Дата</TableHead>
                  <TableHead>Газ</TableHead>
                  <TableHead className="max-w-[120px]">
                    Замерени стойности
                  </TableHead>
                  <TableHead>Замерен от</TableHead>
                  <TableHead>Хоризонт</TableHead>
                  <TableHead>Последна редакция</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements && measurements.length > 0 ? (
                  measurements.map((measurement, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Link
                          href={`/blasting/plan-gas/edit?date=${measurement.MeasuredOn}&elevation=${measurement.Horizont}`}
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {measurement.MeasuredOn}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {measurement.gasType}-{measurement.gasName}
                      </TableCell>
                      <TableCell>
                        <strong>
                          {measurement.GasValue} {measurement.Dimension}
                        </strong>
                      </TableCell>
                      <TableCell>
                        {measurement.MeasuredFrom}
                        <br />
                        {measurement.MeasuredDuty}
                      </TableCell>
                      <TableCell>{measurement.Horizont}</TableCell>
                      <TableCell>
                        {measurement.lrd}
                        {measurement.lrdFrom}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Няма намерени записи
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

