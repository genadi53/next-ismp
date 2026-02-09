"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { PlanGasForm } from "@/components/pvr/PlanGasForm";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Container } from "@/components/Container";
import { format } from "date-fns";

export function PlanGasPageClient() {
  const [measurements] = api.pvr.gas.getAll.useSuspenseQuery();
  console.log(measurements)

  return (
    <Container
      title="Въвеждане на информация от Дневник за измерване на газовете ФД 8-01-16"
    >
      <div className="space-y-6">
        {/* Form */}
        <PlanGasForm />

        {/* Measurements History */}
        <Card>
          <CardHeader>
            <CardTitle>Информация за всички последните 100 записа</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="w-full border-collapse border border-gray-300">
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-300 [&>th]:border [&>th]:border-gray-300 [&>th]:px-4 [&>th]:py-2 [&>th]:text-left">
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
                      <TableRow
                        key={index}
                        className="hover:bg-gray-50 [&>td]:border [&>td]:border-gray-300 [&>td]:px-4 [&>td]:py-2"
                      >
                        <TableCell>
                          <Link
                            href={`/blasting/plan-gas/edit?date=${measurement.MeasuredOn}&elevation=${measurement.Horizont}`}
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {measurement.MeasuredOn ? format(measurement.MeasuredOn, "dd.MM.yyyy") : ""}
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
                          {measurement.lrd ? format(measurement.lrd, "dd.MM.yyyy") : ""}
                          {measurement.lrdFrom}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="[&>td]:border [&>td]:border-gray-300 [&>td]:px-4 [&>td]:py-2">
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
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
    </Container>
  );
}
