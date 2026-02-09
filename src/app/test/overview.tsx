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

  const { overviewStartShiftId, overviewEndShiftId, setOverviewShiftIds } =
    overviewSheet;

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

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/58d26b2b-bcf0-40c6-ab50-61f806b2e928", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "overview.tsx:164",
      message: "hasShiftIds check",
      data: { hasShiftIds, overviewStartShiftId, overviewEndShiftId },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "A",
    }),
  }).catch(() => {
    // Ignore fetch errors for agent logging
  });
  // #endregion

  // Fetch both cycle times and loads data in a single API request (queries run sequentially on server)
  const { data: truckData, isLoading: isLoadingTruckData } =
    api.dashboardV2.trucks.getTruckData.useQuery(
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

  // Fetch production data
  const {
    data: productionData,
    isLoading: isLoadingProduction,
    error: productionError,
  } = api.dashboardV2.production.getCurrentProduction.useQuery(
    {
      startShiftId: Number(overviewStartShiftId!),
      endShiftId: Number(overviewEndShiftId!),
    },
    {
      enabled: hasShiftIds,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      retry: false, // Don't retry on failure to avoid multiple timeout attempts
    },
  );

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/58d26b2b-bcf0-40c6-ab50-61f806b2e928", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "overview.tsx:196",
      message: "productionData query result with error check",
      data: {
        productionDataType: typeof productionData,
        isArray: Array.isArray(productionData),
        length: Array.isArray(productionData) ? productionData.length : "N/A",
        isLoadingProduction,
        hasShiftIds,
        hasError: !!productionError,
        errorMessage: productionError?.message ?? "N/A",
        errorData: productionError ? JSON.stringify(productionError) : "N/A",
        startShiftId: Number(overviewStartShiftId!),
        endShiftId: Number(overviewEndShiftId!),
        firstItem:
          Array.isArray(productionData) && productionData.length > 0 && productionData[0]
            ? Object.keys(productionData[0])
            : "N/A",
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run2",
      hypothesisId: "B,D",
    }),
  }).catch(() => {
    // Ignore fetch errors for agent logging
  });
  // #endregion

  // Helper function to extract evenly distributed values for sparkline (5-6 values)
  const extractSparklineData = <T,>(
    data: T[],
    extractor: (item: T) => number,
  ): number[] => {
    if (!data || data.length === 0) return [];
    if (data.length <= 6) return data.map(extractor);

    // Select 5-6 evenly distributed values
    const targetCount = data.length >= 6 ? 6 : 5;
    const step = Math.floor((data.length - 1) / (targetCount - 1));
    const result: number[] = [];

    // Always include first value
    result.push(extractor(data[0]!));

    // Add evenly distributed values
    for (let i = step; i < data.length - 1; i += step) {
      if (result.length < targetCount - 1) {
        result.push(extractor(data[i]!));
      }
    }

    // Always include last value
    if (data.length > 0) {
      const lastValue = extractor(data[data.length - 1]!);
      if (result[result.length - 1] !== lastValue) {
        result.push(lastValue);
      } else {
        // If last value is already included, replace it to ensure it's the actual last
        result[result.length - 1] = lastValue;
      }
    }

    return result;
  };

  // Calculate KPI values from production data
  const productionArray = productionData ?? [];

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/58d26b2b-bcf0-40c6-ab50-61f806b2e928", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "overview.tsx:237",
      message: "productionArray after null coalesce",
      data: {
        productionArrayLength: productionArray.length,
        firstItemKeys:
          productionArray.length > 0
            ? Object.keys(productionArray[0] ?? {})
            : [],
        firstItemSample:
          productionArray.length > 0
            ? JSON.stringify(productionArray[0])
            : "N/A",
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "C,D,E",
    }),
  }).catch(() => {
    // Ignore fetch errors for agent logging
  });
  // #endregion

  const lastEntry =
    productionArray.length > 0
      ? productionArray[productionArray.length - 1]!
      : null;

  // Stripping Ratio: Vol_Waste / Vol_Ore
  const strippingRatio =
    lastEntry?.Vol_Ore && lastEntry.Vol_Ore > 0
      ? lastEntry.Vol_Waste / lastEntry.Vol_Ore
      : 0;
  const strippingRatioSparkline = extractSparklineData(
    productionArray,
    (item) => (item.Vol_Ore > 0 ? item.Vol_Waste / item.Vol_Ore : 0),
  );
  const previousStrippingRatio =
    productionArray.length > 1 && productionArray[productionArray.length - 2]!
      ? productionArray[productionArray.length - 2]!.Vol_Ore > 0
        ? productionArray[productionArray.length - 2]!.Vol_Waste /
          productionArray[productionArray.length - 2]!.Vol_Ore
        : 0
      : 0;
  const strippingRatioDelta = strippingRatio - previousStrippingRatio;
  const strippingRatioTrend: "up" | "down" | "stable" =
    strippingRatioDelta > 0
      ? "up"
      : strippingRatioDelta < 0
        ? "down"
        : "stable";

  // Ore Tonnes
  const oreTonnes = lastEntry?.Tons_Ore ?? 0;
  const oreTonnesPlan = lastEntry?.PlanmassOreKet ?? 0;
  const oreTonnesDelta = oreTonnes - oreTonnesPlan;
  const oreTonnesTrend: "up" | "down" =
    oreTonnes >= oreTonnesPlan ? "up" : "down";
  const oreTonnesSparkline = extractSparklineData(
    productionArray,
    (item) => item.Tons_Ore,
  );

  // Waste Volume (Откривка)
  const wasteVolume = lastEntry?.Vol_Waste ?? 0;
  const wasteVolumePlan = lastEntry?.PlanVolWaste ?? 0;
  const wasteVolumeDelta = wasteVolume - wasteVolumePlan;
  const wasteVolumeTrend: "up" | "down" =
    wasteVolume >= wasteVolumePlan ? "up" : "down";
  const wasteVolumeSparkline = extractSparklineData(
    productionArray,
    (item) => item.Vol_Waste,
  );

  // Material Moved (Извозен материал)
  const materialMoved = lastEntry?.Tons_Total ?? 0;
  const materialMovedPlan =
    (lastEntry?.PlanmassOreKet ?? 0) + (lastEntry?.PlanMassWaste ?? 0);
  const materialMovedDelta = materialMoved - materialMovedPlan;
  const materialMovedTrend: "up" | "down" =
    materialMoved >= materialMovedPlan ? "up" : "down";
  const materialMovedSparkline = extractSparklineData(
    productionArray,
    (item) => item.Tons_Total,
  );

  // Transform production data into time series format for chart
  const timeSeriesData: TimeSeriesPoint[] = productionArray.map((item) => ({
    time: item.ShiftId.toString(),
    materialMoved: item.Tons_Total,
    oreTonnes: item.Tons_Ore,
    strippingRatioMA: item.Vol_Ore > 0 ? item.Vol_Waste / item.Vol_Ore : 0,
  }));

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/58d26b2b-bcf0-40c6-ab50-61f806b2e928", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "overview.tsx:307",
      message: "timeSeriesData after transformation",
      data: {
        timeSeriesDataLength: timeSeriesData.length,
        firstItem: timeSeriesData.length > 0 ? timeSeriesData[0] : null,
        lastEntry: lastEntry
          ? {
              ShiftId: lastEntry.ShiftId,
              Tons_Total: lastEntry.Tons_Total,
              Tons_Ore: lastEntry.Tons_Ore,
              Vol_Ore: lastEntry.Vol_Ore,
              Vol_Waste: lastEntry.Vol_Waste,
            }
          : null,
      },
      timestamp: Date.now(),
      sessionId: "debug-session",
      runId: "run1",
      hypothesisId: "C,E",
    }),
  }).catch(() => {
    // Ignore fetch errors for agent logging
  });
  // #endregion

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
      color: "var(--chart-1)",
    },
    spotTime: {
      label: "Време позициониране",
      color: "var(--chart-2)",
    },
    queueTime: {
      label: "Време в опашка",
      color: "var(--chart-3)",
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
        {isLoadingProduction || productionError ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
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
              value={strippingRatio.toFixed(2)}
              unit=":1"
              delta={
                strippingRatioDelta >= 0
                  ? `+${strippingRatioDelta.toFixed(2)}`
                  : strippingRatioDelta.toFixed(2)
              }
              trend={strippingRatioTrend}
              sparkline={strippingRatioSparkline}
              icon={Target}
            />
            <KPICard
              title="Руда (т)"
              value={Math.round(oreTonnes)}
              unit="т/ден"
              plan={oreTonnesPlan > 0 ? Math.round(oreTonnesPlan) : undefined}
              planUnit="т/ден"
              delta={Math.round(oreTonnesDelta)}
              trend={oreTonnesTrend}
              sparkline={oreTonnesSparkline}
              icon={Activity}
            />
            <KPICard
              title="Откривка (м3)"
              value={Math.round(wasteVolume)}
              unit="м3/ден"
              plan={
                wasteVolumePlan > 0 ? Math.round(wasteVolumePlan) : undefined
              }
              planUnit="м3/ден"
              delta={Math.round(wasteVolumeDelta)}
              trend={wasteVolumeTrend}
              sparkline={wasteVolumeSparkline}
              icon={Activity}
            />
            <KPICard
              title="Извозен материал"
              value={Math.round(materialMoved)}
              unit="т/ден"
              plan={
                materialMovedPlan > 0
                  ? Math.round(materialMovedPlan)
                  : undefined
              }
              planUnit="т/ден"
              delta={
                materialMovedDelta >= 0
                  ? `+${Math.round(materialMovedDelta)}`
                  : Math.round(materialMovedDelta).toString()
              }
              trend={materialMovedTrend}
              sparkline={materialMovedSparkline}
              icon={Truck}
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
            {isLoadingProduction ? (
              <Skeleton className="h-[250px] w-full" />
            ) : productionError ? (
              <div className="text-destructive flex h-[250px] flex-col items-center justify-center gap-2 text-sm">
                <AlertTriangle className="h-5 w-5" />
                <div>Грешка при зареждане на данни</div>
                <div className="text-muted-foreground text-xs">
                  {(() => {
                    const errorMessage =
                      productionError instanceof Error
                        ? productionError.message
                        : typeof productionError === "object" &&
                            productionError !== null &&
                            "message" in productionError &&
                            typeof productionError.message === "string"
                          ? productionError.message
                          : typeof productionError === "string"
                            ? productionError
                            : "Неизвестна грешка";
                    return errorMessage.includes("Timeout")
                      ? "Заявката отне твърде много време"
                      : errorMessage.includes("Failed to connect")
                        ? "Не може да се свърже с базата данни"
                        : errorMessage;
                  })()}
                </div>
              </div>
            ) : timeSeriesData.length === 0 ? (
              <div className="text-muted-foreground flex h-[250px] items-center justify-center">
                Няма данни за избрания период
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={timeSeriesData}>
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
                    fill="var(--chart-1)"
                    fillOpacity={0.3}
                    stroke="var(--chart-1)"
                    name="Извозен материал (т)"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="oreTonnes"
                    fill="var(--chart-2)"
                    fillOpacity={0.3}
                    stroke="var(--chart-2)"
                    name="Руда (т)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="strippingRatioMA"
                    stroke="var(--chart-3)"
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
                    fill="var(--chart-2)"
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
                        : Array.isArray(value) && value.length > 0
                          ? typeof value[0] === "number"
                            ? value[0]
                            : typeof value[0] === "string"
                              ? parseFloat(value[0])
                              : 0
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
                      fill="var(--chart-1)"
                      radius={[4, 4, 0, 0]}
                      name={cycleMetricConfig.cycleTime.label}
                    />
                    <Bar
                      dataKey="spotTime"
                      fill="var(--chart-4)"
                      radius={[4, 4, 0, 0]}
                      name={cycleMetricConfig.spotTime.label}
                    />
                    <Bar
                      dataKey="queueTime"
                      fill="var(--chart-5)"
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
            {isLoadingCycleTimes ? (
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
                    fill="var(--chart-4)"
                    stroke="var(--chart-4)"
                    name="Опашка"
                  />
                  <Area
                    type="monotone"
                    dataKey="spot"
                    stackId="1"
                    fill="var(--chart-5)"
                    stroke="var(--chart-5)"
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
