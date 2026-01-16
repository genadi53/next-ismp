"use client";

import { Button } from "@/components/ui/button";
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
import {
  Activity,
  AlertTriangle,
  Gauge,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GaugeChart } from "./charts";
import { KPICard } from "./kpi-card";
import { useDashboard } from "./store";
import { api } from "@/trpc/react";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";

// =============================================================================
// TYPES
// =============================================================================

type Granularity = "day" | "shift";

interface Alert {
  id: string;
  entity: string;
  entityType: "equipment" | "worker";
  metric: string;
  value: number;
  threshold: number;
  trend: "up" | "down" | "stable";
}

interface TimeSeriesPoint {
  time: string;
  materialMoved: number;
  oreTonnes: number;
  strippingRatioMA: number;
}

const ALERTS: Alert[] = [
  {
    id: "a1",
    entity: "2C003",
    entityType: "equipment",
    metric: "Време на курс(мин)",
    value: 38.5,
    threshold: 30,
    trend: "up",
  },
  {
    id: "a2",
    entity: "Димитър Иванов",
    entityType: "worker",
    metric: "Време в покой(мин)",
    value: 15,
    threshold: 10,
    trend: "up",
  },
  {
    id: "a3",
    entity: "2C002",
    entityType: "equipment",
    metric: "Използваемост",
    value: 76,
    threshold: 80,
    trend: "down",
  },
  {
    id: "a4",
    entity: "2E002",
    entityType: "equipment",
    metric: "TKPH",
    value: 128,
    threshold: 140,
    trend: "down",
  },
];

const TIME_SERIES_DATA: TimeSeriesPoint[] = [
  {
    time: "Ден 1",
    materialMoved: 42000,
    oreTonnes: 17500,
    strippingRatioMA: 2.3,
  },
  {
    time: "Ден 2",
    materialMoved: 44500,
    oreTonnes: 18200,
    strippingRatioMA: 2.35,
  },
  {
    time: "Ден 3",
    materialMoved: 41000,
    oreTonnes: 17000,
    strippingRatioMA: 2.32,
  },
  {
    time: "Ден 4",
    materialMoved: 46000,
    oreTonnes: 19000,
    strippingRatioMA: 2.38,
  },
  {
    time: "Ден 5",
    materialMoved: 43500,
    oreTonnes: 18000,
    strippingRatioMA: 2.36,
  },
  {
    time: "Ден 6",
    materialMoved: 45200,
    oreTonnes: 18800,
    strippingRatioMA: 2.4,
  },
  {
    time: "Ден 7",
    materialMoved: 47000,
    oreTonnes: 19500,
    strippingRatioMA: 2.42,
  },
];

const QUEUE_SPOT_DATA = [
  { hour: "06:00", queue: 8, spot: 5 },
  { hour: "08:00", queue: 12, spot: 6 },
  { hour: "10:00", queue: 15, spot: 8 },
  { hour: "12:00", queue: 10, spot: 5 },
  { hour: "14:00", queue: 14, spot: 7 },
  { hour: "16:00", queue: 18, spot: 9 },
  { hour: "18:00", queue: 16, spot: 8 },
  { hour: "20:00", queue: 11, spot: 6 },
];

const KPI_DATA = {
  strippingRatio: {
    value: 2.4,
    delta: 0.2,
    trend: "up" as const,
    sparkline: [2.2, 2.25, 2.3, 2.28, 2.35, 2.38, 2.4],
  },
  materialMoved: {
    value: 45200,
    delta: 2100,
    trend: "up" as const,
    sparkline: [42000, 44500, 41000, 46000, 43500, 45200, 47000],
  },
  oreTonnes: {
    value: 18800,
    delta: -400,
    trend: "down" as const,
    sparkline: [17500, 18200, 17000, 19000, 18000, 18800, 19500],
  },
  fleetUtil: {
    value: 87,
    delta: 3,
    trend: "up" as const,
    sparkline: [82, 84, 85, 83, 86, 85, 87],
  },
  equipAvail: {
    value: 94,
    delta: 0,
    trend: "stable" as const,
    sparkline: [93, 94, 92, 95, 94, 93, 94],
  },
  tkphCompliance: {
    value: 96,
    delta: 1,
    trend: "up" as const,
    sparkline: [94, 95, 93, 96, 95, 94, 96],
  },
};

export function Sheet1Overview({
  onAlertClick,
}: {
  onAlertClick: (alert: Alert) => void;
}) {
  type CycleMetricKey = "cycleTime" | "spotTime" | "queueTime" | "all";
  const [cycleMetric, setCycleMetric] = useState<CycleMetricKey>("all");

  const {
    miningDashboard: { overviewSheet },
  } = useDashboard();

  const {
    overviewGranularity,
    setOverviewGranularity,
    overviewStartShiftId,
    overviewEndShiftId,
    setOverviewShiftIds,
  } = overviewSheet;

  // Fetch all shifts for the comboboxes
  const { data: allShifts = [] } =
    api.dashboardV2.shifts.getAllShifts.useQuery();

  // Fetch current shift ID for default value
  const { data: currentShiftId } =
    api.dashboardV2.shifts.getCurrentShiftId.useQuery();

  // Set default values to current shift on mount
  useEffect(() => {
    if (
      currentShiftId !== null &&
      currentShiftId !== undefined &&
      overviewStartShiftId === null &&
      overviewEndShiftId === null
    ) {
      setOverviewShiftIds(currentShiftId, currentShiftId);
    }
  }, [
    currentShiftId,
    overviewStartShiftId,
    overviewEndShiftId,
    setOverviewShiftIds,
  ]);

  const hasShiftIds =
    overviewStartShiftId !== null &&
    overviewEndShiftId !== null &&
    overviewStartShiftId > 0 &&
    overviewEndShiftId > 0;

  // Fetch both cycle times and loads data in a single API request (queries run sequentially on server)
  const {
    data: truckData,
    isLoading: isLoadingTruckData,
    isFetching: isFetchingTruckData,
  } = api.dashboardV2.trucks.getTruckData.useQuery(
    {
      startShiftId: Number(overviewStartShiftId!),
      endShiftId: Number(overviewEndShiftId!),
    },
    {
      enabled: hasShiftIds,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 30000, // Consider data fresh for 30 seconds to prevent unnecessary refetches
    },
  );

  // Extract and transform data
  const cycleTimeDataRaw = truckData?.cycleTimes ?? [];
  const loadsDataRaw = truckData?.loads ?? [];
  const isLoadingCycleTimes = isLoadingTruckData;
  const isLoadingLoads = isLoadingTruckData;

  // Transform data: API returns spotTime and queueTime in seconds
  // For "all" view we need minutes, for individual views we need seconds
  const cycleTimeData = cycleTimeDataRaw.map((d) => ({
    ...d,
    spotTimeSeconds: d.spotTime, // Keep seconds for individual view
    queueTimeSeconds: d.queueTime, // Keep seconds for individual view
    spotTime: d.spotTime / 60, // Convert to minutes for "all" view
    queueTime: d.queueTime / 60, // Convert to minutes for "all" view
  }));

  const loadsData = loadsDataRaw
    .map((d) => ({
      truck: d.truck,
      loads: d.loads ?? 0,
    }))
    // Keep a stable order: highest number of loads first
    .sort((a, b) => b.loads - a.loads);

  const cycleMetricConfig: Record<
    Exclude<CycleMetricKey, "all">,
    { label: string; color: string }
  > = {
    cycleTime: {
      label: "Време на цикъл",
      color: "hsl(var(--chart-1))",
    },
    spotTime: {
      label: "Време позициониране",
      color: "hsl(var(--chart-2))",
    },
    queueTime: {
      label: "Време в опашка",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page-level filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Данни за смяна</h2>
        <div className="flex items-center gap-3">
          <Combobox
            list={allShifts.map((a) => ({
              label: a.FullShiftName,
              value: a.ShiftId.toString(),
            }))}
            placeholderString="Изберете начална смяна"
            value={
              overviewStartShiftId !== null ? String(overviewStartShiftId) : ""
            }
            onValueChange={(value) => {
              const startId = parseInt(value, 10);
              if (!isNaN(startId) && startId > 0) {
                setOverviewShiftIds(startId, overviewEndShiftId);
              }
            }}
            triggerStyles="lg:w-[250px] min-w-0"
          />

          <Combobox
            list={allShifts.map((a) => ({
              label: a.FullShiftName,
              value: a.ShiftId.toString(),
            }))}
            placeholderString="Изберете крайна смяна"
            value={
              overviewEndShiftId !== null ? String(overviewEndShiftId) : ""
            }
            onValueChange={(value) => {
              const endId = parseInt(value, 10);
              if (!isNaN(endId) && endId > 0) {
                setOverviewShiftIds(overviewStartShiftId, endId);
              }
            }}
            triggerStyles="lg:w-[250px] min-w-0"
          />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {isLoadingCycleTimes || isLoadingLoads ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="min-w-[140px] flex-1">
                <CardContent className="mb-0 px-4 pb-0">
                  <div className="flex w-full items-start justify-between">
                    <div className="w-full space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                  <div className="mt-2">
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <KPICard
              title="Коеф. Откривка/Руда"
              value={KPI_DATA.strippingRatio.value}
              unit=":1"
              delta={`+${KPI_DATA.strippingRatio.delta}`}
              trend={KPI_DATA.strippingRatio.trend}
              sparkline={KPI_DATA.strippingRatio.sparkline}
              icon={Target}
            />
            <KPICard
              title="Руда (т)"
              value={KPI_DATA.oreTonnes.value}
              unit="т/ден"
              plan={12255}
              planUnit="т/ден"
              delta={KPI_DATA.oreTonnes.delta}
              trend={KPI_DATA.oreTonnes.trend}
              sparkline={KPI_DATA.oreTonnes.sparkline}
              icon={Activity}
            />
            <KPICard
              title="Откривка (м3)"
              value={KPI_DATA.oreTonnes.value}
              unit="м3/ден"
              plan={25500}
              planUnit="м3/ден"
              delta={KPI_DATA.oreTonnes.delta}
              trend={KPI_DATA.oreTonnes.trend}
              sparkline={KPI_DATA.oreTonnes.sparkline}
              icon={Activity}
            />
            <KPICard
              title="Извозен материал"
              value={KPI_DATA.materialMoved.value}
              unit="т/ден"
              plan={45200}
              planUnit="м3/ден"
              delta={`+${KPI_DATA.materialMoved.delta}`}
              trend={KPI_DATA.materialMoved.trend}
              sparkline={KPI_DATA.materialMoved.sparkline}
              icon={Truck}
            />
            <KPICard
              title="Средно време на курс (мин)"
              value={KPI_DATA.fleetUtil.value}
              unit="%"
              delta={`+${KPI_DATA.fleetUtil.delta}%`}
              trend={KPI_DATA.fleetUtil.trend}
              sparkline={KPI_DATA.fleetUtil.sparkline}
              icon={Gauge}
            />
          </>
        )}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Time Series Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Извозен материал (т)</CardTitle>
              {/* <div className="flex gap-1">
                {(["day", "shift"] as Granularity[]).map((g) => (
                  <Button
                    key={g}
                    size="sm"
                    variant={overviewGranularity === g ? "default" : "ghost"}
                    onClick={() => setOverviewGranularity(g)}
                    className="h-7 text-xs capitalize"
                  >
                    {g}
                  </Button>
                ))}
              </div> */}
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingCycleTimes || isLoadingLoads ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={TIME_SERIES_DATA}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    domain={[2, 2.6]}
                  />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="materialMoved"
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.3}
                    stroke="hsl(var(--chart-1))"
                    name="Извозен материал (т)"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="oreTonnes"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.3}
                    stroke="hsl(var(--chart-2))"
                    name="Руда (т)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="strippingRatioMA"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Коеф. Откривка/Руда"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Payload Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Брой курсове на камион</CardTitle>
            <CardDescription>
              {overviewStartShiftId !== null && overviewEndShiftId !== null
                ? `От смяна ${overviewStartShiftId} до смяна ${overviewEndShiftId}`
                : "Изберете смени"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLoads ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={loadsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    domain={[0, "dataMax + 5"]}
                  />
                  <YAxis
                    type="category"
                    dataKey="truck"
                    tick={{ fontSize: 10 }}
                    width={60}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="loads"
                    fill="hsl(var(--chart-2))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cycle Time Distribution - Separate Row */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">
                Разпределение времена на курс
              </CardTitle>
              <CardDescription>
                {cycleMetric === "spotTime" || cycleMetric === "queueTime"
                  ? "Средно време в секунди на камион"
                  : "Средно време на курс, позициониране и изчакване на опашка на камион (минути)"}
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={cycleMetric === "all" ? "default" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setCycleMetric("all")}
              >
                Всички
              </Button>
              <Button
                size="sm"
                variant={cycleMetric === "cycleTime" ? "default" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setCycleMetric("cycleTime")}
              >
                Цикъл
              </Button>
              <Button
                size="sm"
                variant={cycleMetric === "spotTime" ? "default" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setCycleMetric("spotTime")}
              >
                Позициониране
              </Button>
              <Button
                size="sm"
                variant={cycleMetric === "queueTime" ? "default" : "ghost"}
                className="h-7 px-2 text-xs"
                onClick={() => setCycleMetric("queueTime")}
              >
                Опашка
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingCycleTimes ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={cycleTimeData?.filter((d) => d.cycleTime > 0)}
                barCategoryGap={cycleMetric === "all" ? "20%" : "40%"}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="truck"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{
                    value:
                      cycleMetric === "spotTime" || cycleMetric === "queueTime"
                        ? "Секунди"
                        : "Минути",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value: unknown, name: string) => {
                    // Recharts can pass value as an array or number
                    const numValue =
                      typeof value === "number"
                        ? value
                        : Array.isArray(value)
                          ? value[0]
                          : typeof value === "string"
                            ? parseFloat(value)
                            : 0;

                    // For individual spot/queue views, show seconds
                    if (
                      cycleMetric === "spotTime" ||
                      cycleMetric === "queueTime"
                    ) {
                      return [`${numValue.toFixed(1)} сек`, name];
                    }
                    // For "all" view and cycleTime, show minutes
                    return [`${numValue.toFixed(2)} мин`, name];
                  }}
                />
                <Legend />
                {cycleMetric === "all" ? (
                  <>
                    <Bar
                      dataKey="cycleTime"
                      fill="hsl(var(--chart-1))"
                      radius={[4, 4, 0, 0]}
                      name={cycleMetricConfig.cycleTime.label}
                    />
                    <Bar
                      dataKey="spotTime"
                      fill="hsl(var(--chart-4))"
                      radius={[4, 4, 0, 0]}
                      name={cycleMetricConfig.spotTime.label}
                    />
                    <Bar
                      dataKey="queueTime"
                      fill="hsl(var(--chart-5))"
                      radius={[4, 4, 0, 0]}
                      name={cycleMetricConfig.queueTime.label}
                    />
                  </>
                ) : (
                  <Bar
                    dataKey={
                      cycleMetric === "spotTime"
                        ? "spotTimeSeconds"
                        : cycleMetric === "queueTime"
                          ? "queueTimeSeconds"
                          : cycleMetric
                    }
                    fill={cycleMetricConfig[cycleMetric].color}
                    radius={[4, 4, 0, 0]}
                    name={cycleMetricConfig[cycleMetric].label}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Queue + Spot Time */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Време в опашка и позициониране
            </CardTitle>
            <CardDescription>Средно време в минути на час</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingCycleTimes || isLoadingLoads ? (
              <Skeleton className="h-[150px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={QUEUE_SPOT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="queue"
                    stackId="1"
                    fill="hsl(var(--chart-4))"
                    stroke="hsl(var(--chart-4))"
                    name="Опашка"
                  />
                  <Area
                    type="monotone"
                    dataKey="spot"
                    stackId="1"
                    fill="hsl(var(--chart-5))"
                    stroke="hsl(var(--chart-5))"
                    name="Позициониране"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Idle Time Gauge */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Процент време в покой</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {isLoadingCycleTimes || isLoadingLoads ? (
              <Skeleton className="h-32 w-32 rounded-full" />
            ) : (
              <GaugeChart value={12} label="В покой %" />
            )}
          </CardContent>
        </Card>
      </div>
      {/* Alerts Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Сигнали и изключения
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCycleTimes || isLoadingLoads ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="ml-auto h-4 w-16" />
                  <Skeleton className="h-3 w-3" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Обект</TableHead>
                  <TableHead className="text-xs">Метрика</TableHead>
                  <TableHead className="text-right text-xs">Стойност</TableHead>
                  <TableHead className="w-8 text-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ALERTS.slice(0, 4).map((alert) => (
                  <TableRow
                    key={alert.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => onAlertClick(alert)}
                  >
                    <TableCell className="text-xs font-medium">
                      {alert.entity}
                    </TableCell>
                    <TableCell className="text-xs">{alert.metric}</TableCell>
                    <TableCell className="text-right text-xs">
                      <span
                        className={
                          alert.value > alert.threshold
                            ? "text-red-500"
                            : "text-amber-500"
                        }
                      >
                        {alert.value}
                      </span>
                      <span className="text-muted-foreground">
                        /{alert.threshold}
                      </span>
                    </TableCell>
                    <TableCell>
                      {alert.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-red-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-amber-500" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
