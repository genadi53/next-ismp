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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Calendar,
  Gauge,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useState } from "react";
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

// CYCLE_TIME_DATA is now fetched from the database via tRPC

const PAYLOAD_DATA = [
  { truck: "T-001", payload: 185 },
  { truck: "T-005", payload: 180 },
  { truck: "T-004", payload: 178 },
  { truck: "T-006", payload: 182 },
  { truck: "T-007", payload: 179 },
  { truck: "T-008", payload: 175 },
  { truck: "T-009", payload: 183 },
  { truck: "T-010", payload: 177 },
  { truck: "T-011", payload: 181 },
  { truck: "T-012", payload: 176 },
  { truck: "T-013", payload: 184 },
  { truck: "T-014", payload: 178 },
  { truck: "T-015", payload: 180 },
  { truck: "T-016", payload: 174 },
  { truck: "T-017", payload: 182 },
  { truck: "T-018", payload: 179 },
  { truck: "T-002", payload: 172 },
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
  type CycleMetricKey = "cycleTime" | "spotTime" | "queueTime";
  const [cycleMetric, setCycleMetric] = useState<CycleMetricKey>("cycleTime");

  const {
    miningDashboard: { overviewSheet },
  } = useDashboard();

  const {
    overviewGranularity,
    setOverviewGranularity,
    overviewDatePreset,
    setOverviewDatePreset,
    overviewShiftPreset,
    setOverviewShiftPreset,
  } = overviewSheet;

  // Fetch cycle time data from the database
  const { data: cycleTimeData = [] } =
    api.dashboardV2.trucks.getCycleTimes.useQuery({
      period: overviewDatePreset,
    });

  const cycleMetricConfig: Record<
    CycleMetricKey,
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
          <Select
            value={overviewDatePreset}
            onValueChange={(value) =>
              setOverviewDatePreset(value as "today" | "yesterday" | "month")
            }
          >
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Дата" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Днес</SelectItem>
              <SelectItem value="yesterday">Вчера</SelectItem>
              <SelectItem value="month">Този месец</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={overviewShiftPreset}
            onValueChange={(value) =>
              setOverviewShiftPreset(
                value as "shift1" | "shift2" | "night" | "all",
              )
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Смяна" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shift1">Първа смяна</SelectItem>
              <SelectItem value="shift2">Втора смяна</SelectItem>
              <SelectItem value="night">Нощна смяна</SelectItem>
              <SelectItem value="all">Всички смени</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="flex gap-4 overflow-x-auto pb-2">
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
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Time Series Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Извозен материал (т)</CardTitle>
              <div className="flex gap-1">
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Right Column: Payload Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Брой курсове на камион</CardTitle>
            <CardDescription>За месец януари 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={PAYLOAD_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  domain={[150, 200]}
                />
                <YAxis
                  type="category"
                  dataKey="truck"
                  tick={{ fontSize: 10 }}
                  width={60}
                />
                <Tooltip />
                <Bar
                  dataKey="payload"
                  fill="hsl(var(--chart-2))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cycle Time Distribution - Separate Row */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">
                Разпределение време на цикъл
              </CardTitle>
              <CardDescription>
                Средно време на курс, позициониране и изчакване на опашка на
                камион (минути)
              </CardDescription>
            </div>
            <div className="flex gap-1">
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={cycleTimeData.filter((d) => d.cycleTime > 0)}
              barCategoryGap="40%"
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
                label={{ value: "Минути", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey={cycleMetric}
                fill={cycleMetricConfig[cycleMetric].color}
                radius={[4, 4, 0, 0]}
                name={cycleMetricConfig[cycleMetric].label}
              />
            </BarChart>
          </ResponsiveContainer>
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
          </CardContent>
        </Card>

        {/* Idle Time Gauge */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Процент време в покой</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <GaugeChart value={12} label="В покой %" />
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
        </CardContent>
      </Card>
    </div>
  );
}
