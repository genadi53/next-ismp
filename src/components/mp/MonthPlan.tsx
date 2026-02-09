import type {
  MonthPlanType,
  NaturalIndicatorsPlanInsertArray,
  OperationalPlanInsertArray,
  PlanInsertTypes,
  ShovelPlanInsertArray,
} from "@/server/repositories/mine-planning";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { format, getDaysInMonth, lastDayOfMonth } from "date-fns";
import { Badge } from "../ui/badge";
import React from "react";
import { formatNumber } from "@/lib/numbers";

type MonthPlanProps = {
  type: MonthPlanType;
  data: PlanInsertTypes;
};

export default function MonthPlan({ type, data }: MonthPlanProps) {
  if (type === "Месечен ГР Проект") {
    const filteredData = (data as NaturalIndicatorsPlanInsertArray).filter(
      (row) =>
        format(new Date(row.PlanMonthDay), "yyyy-MM-dd") ===
        format(
          lastDayOfMonth(new Date(data[0]?.PlanMonthDay ?? new Date())),
          "yyyy-MM-dd",
        ),
    );

    return (
      <>
        <Card className="">
          <CardHeader className="flex flex-row justify-between">
            <div>
              <CardTitle>Информация за Месечен ГР Проект</CardTitle>
              <span className="text-muted-foreground text-sm">
                (Въведен за месец:{" "}
                {format(
                  new Date(data[0]?.PlanMonthDay ?? new Date()),
                  "yyyy-MM",
                )}{" "}
                от: {data[0]?.userAdded ?? ""})
              </span>
            </div>
            <div>
              <Badge variant="outline" className="text-ell-primary text-sm">
                {data.length} записа
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="w-full border-separate border-spacing-x-4">
                <TableBody>
                  {(filteredData as NaturalIndicatorsPlanInsertArray).map(
                    (planRow) => (
                      <React.Fragment
                        key={`${planRow.PlanMonthDay}-${planRow.Object}`}
                      >
                        <TableRow className="">
                          <TableCell className="text-left text-xs font-medium">
                            <div className="flex w-full items-center justify-between gap-2 px-4 pr-6">
                              <span className="text-left text-xs font-medium">
                                Погасен запас руда от масив, m³
                              </span>
                              <span className="text-right text-xs">
                                {formatNumber(planRow.PlanVolOreKet)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (type === "Месечен оперативен план") {
    const filteredData = (data as OperationalPlanInsertArray).filter(
      (row) =>
        format(new Date(row.PlanMonthDay), "yyyy-MM-dd") ===
        format(
          lastDayOfMonth(new Date(data[0]?.PlanMonthDay ?? new Date())),
          "yyyy-MM-dd",
        ),
    );

    return (
      <>
        <Card className="max-w-7xl">
          <CardHeader className="flex flex-row justify-between">
            <div>
              <CardTitle>Информация за Месечен оперативен план</CardTitle>
              <span className="text-muted-foreground text-sm">
                (Въведен за месец:{" "}
                {format(
                  new Date(data[0]?.PlanMonthDay ?? new Date()),
                  "yyyy-MM",
                )}{" "}
                от: {data[0]?.userAdded ?? ""})
              </span>
            </div>
            <div>
              <Badge variant="outline" className="text-ell-primary text-sm">
                {data.length} записа
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableBody>
                  {(filteredData as OperationalPlanInsertArray).map(
                    (planRow) => (
                      <TableRow
                        key={`${planRow.PlanMonthDay}-${planRow.Object}`}
                      >
                        <TableCell className="text-left text-xs font-medium">
                          Руда за преработка, m³
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {formatNumber(planRow.PlanVolOreKet)}
                        </TableCell>
                        <TableCell className="text-left text-xs font-medium">
                          Руда за преработка, t
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {formatNumber(planRow.PlanmassOreKet)}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                  {/* Additional rows - simplified for brevity */}
                  {(filteredData as OperationalPlanInsertArray).map(
                    (planRow) => (
                      <TableRow
                        key={`${planRow.PlanMonthDay}-${planRow.Object}-2`}
                      >
                        <TableCell className="text-left text-xs font-medium">
                          Руда добита, m3
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {formatNumber(planRow.PlanVolOre)}
                        </TableCell>
                        <TableCell className="text-left text-xs font-medium">
                          Руда добита, t
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {formatNumber(planRow.PlanMassOre)}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (type === "Месечен план по одобрени натурални показатели") {
    const filteredData = (data as NaturalIndicatorsPlanInsertArray).filter(
      (row) =>
        format(new Date(row.PlanMonthDay), "yyyy-MM-dd") ===
        format(
          lastDayOfMonth(new Date(data[0]?.PlanMonthDay ?? new Date())),
          "yyyy-MM-dd",
        ),
    );

    return (
      <>
        <Card className="">
          <CardHeader className="flex flex-row justify-between">
            <div>
              <CardTitle>
                Информация за Месечен план по одобрени натурални показатели
              </CardTitle>
              <span className="text-muted-foreground text-sm">
                (Въведен за месец:{" "}
                {format(
                  new Date(data[0]?.PlanMonthDay ?? new Date()),
                  "yyyy-MM",
                )}{" "}
                от: {data[0]?.userAdded ?? ""})
              </span>
            </div>
            <div>
              <Badge variant="outline" className="text-ell-primary text-sm">
                {data.length} записа
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="w-full border-separate border-spacing-x-4">
                <TableBody>
                  {(filteredData as NaturalIndicatorsPlanInsertArray).map(
                    (planRow) => (
                      <React.Fragment
                        key={`${planRow.PlanMonthDay}-${planRow.Object}`}
                      >
                        <TableRow className="">
                          <TableCell className="text-left text-xs font-medium">
                            <div className="flex w-full items-center justify-between gap-2 px-4 pr-6">
                              <span className="text-left text-xs font-medium">
                                Погасен запас руда от масив, m³
                              </span>
                              <span className="text-right text-xs">
                                {formatNumber(planRow.PlanVolOreKet)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (type === "Месечен план добив багери") {
    return (
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div>
            <CardTitle>Информация за Месечен план добив багери</CardTitle>
            <span className="text-muted-foreground text-sm">
              (Въведен за месец:{" "}
              {format(new Date(data[0]?.PlanMonthDay ?? new Date()), "yyyy-MM")}{" "}
              от: {data[0]?.userAdded ?? ""})
            </span>
          </div>
          <div>
            <Badge variant="outline" className="text-ell-primary text-sm">
              {data.length /
                getDaysInMonth(data[0]?.PlanMonthDay ?? new Date())}{" "}
              записа
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Месец</TableHead>
                  <TableHead className="text-center">Фирма</TableHead>
                  <TableHead className="text-center">Хоризонт</TableHead>
                  <TableHead className="text-center">Минна Маса</TableHead>
                  <TableHead className="text-center">Багер</TableHead>
                  <TableHead className="text-center">План ММ, м3</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data as ShovelPlanInsertArray)
                  .filter(
                    (row) =>
                      row.PlanMonthDay ===
                      format(
                        lastDayOfMonth(
                          new Date(data[0]?.PlanMonthDay ?? new Date()) ??
                            new Date(),
                        ),
                        "yyyy-MM-dd",
                      ),
                  )
                  .map((planRow) => (
                    <TableRow
                      key={`${planRow.Horizont}-${planRow.Shovel}-${planRow.MMtype}`}
                    >
                      <TableCell className="text-center">
                        {format(new Date(planRow.PlanMonthDay), "yyyy-MM")}
                      </TableCell>
                      <TableCell className="text-center">
                        {planRow.Object}
                      </TableCell>
                      <TableCell className="text-center">
                        {planRow.Horizont}
                      </TableCell>
                      <TableCell className="text-center">
                        {planRow.MMtype}
                      </TableCell>
                      <TableCell className="text-center">
                        {planRow.Shovel}
                      </TableCell>
                      <TableCell className="text-center">
                        {planRow.PlanVol}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <div>Невалиден тип на месечен план</div>;
}
