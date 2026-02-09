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
import { cn } from "@/lib/cn";
import { Gauge, Target, Wrench } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Heatmap } from "./heatmap";
import { KPICard } from "./kpi-card";
import { useDashboard } from "./store";

// =============================================================================
// TYPES
// =============================================================================

type Granularity = "day" | "shift";
type EquipmentStatus = "active" | "idle" | "maintenance";

interface Equipment {
  id: string;
  type: "truck" | "excavator" | "drill" | "support";
  utilizationPercent: number;
  cycleTimeAvg: number;
  payloadAvg: number;
  status: EquipmentStatus;
  lastMaintenance: string;
  operator?: string;
}

interface FleetUtilPoint {
  time: string;
  utilized: number;
  idle: number;
  maintenance: number;
}

const FLEET_UTIL_DATA: FleetUtilPoint[] = [
  { time: "06:00", utilized: 75, idle: 15, maintenance: 10 },
  { time: "08:00", utilized: 85, idle: 10, maintenance: 5 },
  { time: "10:00", utilized: 90, idle: 5, maintenance: 5 },
  { time: "12:00", utilized: 70, idle: 20, maintenance: 10 },
  { time: "14:00", utilized: 88, idle: 7, maintenance: 5 },
  { time: "16:00", utilized: 92, idle: 5, maintenance: 3 },
  { time: "18:00", utilized: 85, idle: 10, maintenance: 5 },
  { time: "20:00", utilized: 78, idle: 15, maintenance: 7 },
];

const HEATMAP_DATA = [
  { type: "Камиони", values: [92, 88, 85, 90, 87, 91, 89] },
  { type: "Багери", values: [95, 92, 88, 94, 90, 93, 91] },
  { type: "Сонди", values: [88, 85, 90, 86, 89, 87, 88] },
  { type: "Поддръжка", values: [78, 82, 80, 85, 79, 83, 81] },
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

const EQUIPMENT: Equipment[] = [
  {
    id: "2C001",
    type: "truck",
    utilizationPercent: 89,
    cycleTimeAvg: 24.5,
    payloadAvg: 185,
    status: "active",
    lastMaintenance: "преди 2 дни",
    operator: "Иван Петров",
  },
  {
    id: "2C002",
    type: "truck",
    utilizationPercent: 76,
    cycleTimeAvg: 28.1,
    payloadAvg: 172,
    status: "idle",
    lastMaintenance: "преди 5 дни",
    operator: "Георги Димитров",
  },
  {
    id: "2C003",
    type: "truck",
    utilizationPercent: 0,
    cycleTimeAvg: 0,
    payloadAvg: 0,
    status: "maintenance",
    lastMaintenance: "В процес",
  },
  {
    id: "2C004",
    type: "truck",
    utilizationPercent: 82,
    cycleTimeAvg: 26.3,
    payloadAvg: 178,
    status: "active",
    lastMaintenance: "преди 3 дни",
    operator: "Димитър Иванов",
  },
  {
    id: "2C005",
    type: "truck",
    utilizationPercent: 85,
    cycleTimeAvg: 25.8,
    payloadAvg: 180,
    status: "active",
    lastMaintenance: "преди 4 дни",
    operator: "Стоян Николов",
  },
  {
    id: "2E001",
    type: "excavator",
    utilizationPercent: 94,
    cycleTimeAvg: 0,
    payloadAvg: 0,
    status: "active",
    lastMaintenance: "преди 1 седмица",
    operator: "Петър Стоянов",
  },
  {
    id: "2E002",
    type: "excavator",
    utilizationPercent: 91,
    cycleTimeAvg: 0,
    payloadAvg: 0,
    status: "active",
    lastMaintenance: "преди 5 дни",
    operator: "Марин Василев",
  },
  {
    id: "2D001",
    type: "drill",
    utilizationPercent: 88,
    cycleTimeAvg: 0,
    payloadAvg: 0,
    status: "active",
    lastMaintenance: "преди 3 дни",
    operator: "Николай Георгиев",
  },
  {
    id: "2D002",
    type: "drill",
    utilizationPercent: 85,
    cycleTimeAvg: 0,
    payloadAvg: 0,
    status: "active",
    lastMaintenance: "преди 6 дни",
    operator: "Васил Маринов",
  },
];

export function Sheet2Fleet({
  onEquipmentClick,
}: {
  onEquipmentClick: (equipmentId: string) => void;
}) {
  const {
    miningDashboard: { fleetSheet },
  } = useDashboard();

  const { fleetGranularity, setFleetGranularity } = fleetSheet;
  const statusColors: Record<EquipmentStatus, string> = {
    active: "bg-emerald-500",
    idle: "bg-amber-500",
    maintenance: "bg-red-500",
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Оборудване</h2>

      <div className="flex gap-4 overflow-x-auto pb-2">
        <KPICard
          title="Използваемост на оборудване %"
          value={KPI_DATA.fleetUtil.value}
          unit="%"
          delta={`+${KPI_DATA.fleetUtil.delta}%`}
          trend={KPI_DATA.fleetUtil.trend}
          sparkline={KPI_DATA.fleetUtil.sparkline}
          icon={Gauge}
        />
        <KPICard
          title="Наличност оборудване %"
          value={KPI_DATA.equipAvail.value}
          unit="%"
          delta="0%"
          trend={KPI_DATA.equipAvail.trend}
          sparkline={KPI_DATA.equipAvail.sparkline}
          icon={Wrench}
        />
        <KPICard
          title="Съответствие TKPH"
          value={KPI_DATA.tkphCompliance.value}
          unit="%"
          delta={`+${KPI_DATA.tkphCompliance.delta}%`}
          trend={KPI_DATA.tkphCompliance.trend}
          sparkline={KPI_DATA.tkphCompliance.sparkline}
          icon={Target}
        />
      </div>

      {/* Top Row Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fleet Utilization Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Тренд използваемост на оборудване %
              </CardTitle>
              <div className="flex gap-1">
                {(["day", "shift"] as Granularity[]).map((g) => {
                  const labels: Record<Granularity, string> = {
                    day: "Ден",
                    shift: "Смяна",
                  };
                  return (
                    <Button
                      key={g}
                      size="sm"
                      variant={fleetGranularity === g ? "default" : "ghost"}
                      onClick={() => setFleetGranularity(g)}
                      className="h-7 text-xs"
                    >
                      {labels[g]}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={FLEET_UTIL_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="utilized"
                  stackId="1"
                  fill="var(--chart-2)"
                  stroke="var(--chart-2)"
                  name="Използвани"
                />
                <Area
                  type="monotone"
                  dataKey="idle"
                  stackId="1"
                  fill="var(--chart-4)"
                  stroke="var(--chart-4)"
                  name="В покой"
                />
                <Area
                  type="monotone"
                  dataKey="maintenance"
                  stackId="1"
                  fill="var(--chart-5)"
                  stroke="var(--chart-5)"
                  name="Поддръжка"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Equipment Availability Heatmap */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Наличност на оборудване</CardTitle>
            <CardDescription>По тип за последните 7 дни</CardDescription>
          </CardHeader>
          <CardContent>
            <Heatmap
              data={HEATMAP_DATA}
              days={["Пон", "Вт", "Ср", "Чет", "Пет", "Съб", "Нед"]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Equipment Matrix Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Таблица на оборудване</CardTitle>
          <CardDescription>
            Кликнете върху ред за да видите детайли за оборудването
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead className="text-right">Използваемост %</TableHead>
                <TableHead className="text-right">
                  Време на курс (мин)
                </TableHead>
                <TableHead className="text-right">Брой курсове</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Оператор</TableHead>
                <TableHead>Последна поддръжка</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {EQUIPMENT.map((equip) => (
                <TableRow
                  key={equip.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onEquipmentClick(equip.id)}
                >
                  <TableCell className="font-medium">{equip.id}</TableCell>
                  <TableCell className="capitalize">
                    {equip.type === "truck"
                      ? "Камион"
                      : equip.type === "excavator"
                        ? "Багер"
                        : equip.type === "drill"
                          ? "Сонда"
                          : "Поддръжка"}
                  </TableCell>
                  <TableCell className="text-right">
                    {equip.utilizationPercent > 0
                      ? `${equip.utilizationPercent}%`
                      : "--"}
                  </TableCell>
                  <TableCell className="text-right">
                    {equip.cycleTimeAvg > 0
                      ? `${equip.cycleTimeAvg} min`
                      : "--"}
                  </TableCell>
                  <TableCell className="text-right">
                    {equip.payloadAvg > 0 ? `${equip.payloadAvg}t` : "--"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          statusColors[equip.status],
                        )}
                      />
                      <span className="text-sm capitalize">
                        {equip.status === "active"
                          ? "Активен"
                          : equip.status === "idle"
                            ? "В покой"
                            : "Поддръжка"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {equip.operator ?? "--"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {equip.lastMaintenance}
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
