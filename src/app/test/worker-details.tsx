"use client";

import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Truck, User } from "lucide-react";
import { GanttTimeline } from "./charts";
import { useDashboard } from "./store";

// =============================================================================
// TYPES
// =============================================================================

type EquipmentStatus = "active" | "idle" | "maintenance";
type ActivityType = "productive" | "queue" | "spot" | "idle" | "maintenance";

interface Worker {
  id: string;
  name: string;
  crew: string;
  role: string;
  photo?: string;
  oreTonnes: number;
  materialMoved: number;
  tkph: number;
  drillingRate: number | null;
  idleTimePercent: number;
  shiftUtilPercent: number;
  queueTime: number;
  status: "active" | "break" | "offline";
  sparklineData: number[];
}

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

interface ProductionEvent {
  start: string;
  end: string;
  activityType: ActivityType;
  tonsMoved: number | null;
  truckId: string;
  location: string;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const WORKERS: Worker[] = [
  {
    id: "w1",
    name: "Иван Петров",
    crew: "Екип А",
    role: "Шофьор камион",
    oreTonnes: 1240,
    materialMoved: 3100,
    tkph: 156,
    drillingRate: null,
    idleTimePercent: 8,
    shiftUtilPercent: 92,
    queueTime: 12,
    status: "active",
    sparklineData: [980, 1100, 1050, 1180, 1220, 1190, 1240],
  },
  {
    id: "w2",
    name: "Георги Димитров",
    crew: "Екип А",
    role: "Шофьор камион",
    oreTonnes: 1180,
    materialMoved: 2950,
    tkph: 148,
    drillingRate: null,
    idleTimePercent: 12,
    shiftUtilPercent: 88,
    queueTime: 18,
    status: "active",
    sparklineData: [1020, 1080, 1150, 1100, 1200, 1160, 1180],
  },
  {
    id: "w3",
    name: "Петър Стоянов",
    crew: "Екип А",
    role: "Машинист багер",
    oreTonnes: 2100,
    materialMoved: 5200,
    tkph: 0,
    drillingRate: null,
    idleTimePercent: 5,
    shiftUtilPercent: 95,
    queueTime: 8,
    status: "active",
    sparklineData: [1900, 2050, 1980, 2100, 2080, 2150, 2100],
  },
  {
    id: "w4",
    name: "Николай Георгиев",
    crew: "Екип А",
    role: "Машинист сонда",
    oreTonnes: 0,
    materialMoved: 0,
    tkph: 0,
    drillingRate: 45,
    idleTimePercent: 10,
    shiftUtilPercent: 90,
    queueTime: 0,
    status: "active",
    sparklineData: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: "w5",
    name: "Димитър Иванов",
    crew: "Екип Б",
    role: "Шофьор камион",
    oreTonnes: 1050,
    materialMoved: 2600,
    tkph: 138,
    drillingRate: null,
    idleTimePercent: 15,
    shiftUtilPercent: 85,
    queueTime: 22,
    status: "active",
    sparklineData: [920, 980, 1020, 1000, 1080, 1030, 1050],
  },
  {
    id: "w6",
    name: "Стоян Николов",
    crew: "Екип Б",
    role: "Шофьор камион",
    oreTonnes: 1120,
    materialMoved: 2800,
    tkph: 142,
    drillingRate: null,
    idleTimePercent: 11,
    shiftUtilPercent: 89,
    queueTime: 15,
    status: "break",
    sparklineData: [1000, 1050, 1100, 1080, 1150, 1100, 1120],
  },
  {
    id: "w7",
    name: "Марин Василев",
    crew: "Екип Б",
    role: "Машинист багер",
    oreTonnes: 1950,
    materialMoved: 4800,
    tkph: 0,
    drillingRate: null,
    idleTimePercent: 7,
    shiftUtilPercent: 93,
    queueTime: 10,
    status: "active",
    sparklineData: [1800, 1900, 1850, 1920, 1980, 1900, 1950],
  },
  {
    id: "w8",
    name: "Васил Маринов",
    crew: "Екип Б",
    role: "Машинист сонда",
    oreTonnes: 0,
    materialMoved: 0,
    tkph: 0,
    drillingRate: 42,
    idleTimePercent: 12,
    shiftUtilPercent: 88,
    queueTime: 0,
    status: "active",
    sparklineData: [0, 0, 0, 0, 0, 0, 0],
  },
];

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

const PRODUCTION_EVENTS: Record<string, ProductionEvent[]> = {
  w1: [
    {
      start: "06:00",
      end: "06:45",
      activityType: "productive",
      tonsMoved: 185,
      truckId: "T-001",
      location: "Кар'ер 3 → Отвал 1",
    },
    {
      start: "06:45",
      end: "07:02",
      activityType: "queue",
      tonsMoved: null,
      truckId: "T-001",
      location: "Багер Б-02",
    },
    {
      start: "07:02",
      end: "07:48",
      activityType: "productive",
      tonsMoved: 192,
      truckId: "T-001",
      location: "Кар'ер 3 → Отвал 1",
    },
    {
      start: "07:48",
      end: "08:05",
      activityType: "spot",
      tonsMoved: null,
      truckId: "T-001",
      location: "Отвал 1",
    },
    {
      start: "08:05",
      end: "08:52",
      activityType: "productive",
      tonsMoved: 188,
      truckId: "T-001",
      location: "Кар'ер 3 → Отвал 1",
    },
    {
      start: "08:52",
      end: "09:10",
      activityType: "idle",
      tonsMoved: null,
      truckId: "T-001",
      location: "Кар'ер 3",
    },
    {
      start: "09:10",
      end: "10:00",
      activityType: "productive",
      tonsMoved: 195,
      truckId: "T-001",
      location: "Кар'ер 3 → Дробилка",
    },
    {
      start: "10:00",
      end: "10:30",
      activityType: "maintenance",
      tonsMoved: null,
      truckId: "T-001",
      location: "Сервиз",
    },
    {
      start: "10:30",
      end: "11:20",
      activityType: "productive",
      tonsMoved: 190,
      truckId: "T-001",
      location: "Кар'ер 2 → Отвал 2",
    },
    {
      start: "11:20",
      end: "12:00",
      activityType: "productive",
      tonsMoved: 180,
      truckId: "T-001",
      location: "Кар'ер 2 → Отвал 2",
    },
  ],
};

export // Sheet 4: Worker/Equipment Detail
function Sheet4Detail() {
  const {
    miningDashboard: { detailSheet, ui },
  } = useDashboard();

  const {
    detailSelectedWorkerId,
    detailSelectedEquipmentId,
    setDetailSelectedWorkerId,
    setDetailSelectedEquipmentId,
  } = detailSheet;
  const { setActiveSheetId } = ui;

  const workerId = detailSelectedWorkerId;
  const equipmentId = detailSelectedEquipmentId;

  const handleBack = () => {
    setDetailSelectedWorkerId(null);
    setDetailSelectedEquipmentId(null);
    setActiveSheetId(1);
  };

  const worker = workerId ? WORKERS.find((w) => w.id === workerId) : null;
  const equipment = equipmentId
    ? EQUIPMENT.find((e) => e.id === equipmentId)
    : null;
  const defaultEvents = PRODUCTION_EVENTS.w1 ?? [];
  const events: ProductionEvent[] = workerId
    ? (PRODUCTION_EVENTS[workerId] ?? defaultEvents)
    : defaultEvents;

  if (worker) {
    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
              <User className="text-muted-foreground h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{worker.name}</h2>
              <p className="text-muted-foreground">
                {worker.crew} • {worker.role}
              </p>
              <Badge
                variant={worker.status === "active" ? "default" : "secondary"}
                className="mt-1"
              >
                {worker.status === "active"
                  ? "Активен"
                  : worker.status === "break"
                    ? "Почивка"
                    : "Офлайн"}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="flex gap-4">
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-xs">Руда (т)</p>
              <p className="text-2xl font-bold">
                {worker.oreTonnes.toLocaleString()}т
              </p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-xs">TKPH</p>
              <p className="text-2xl font-bold">{worker.tkph ?? "--"}</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-xs">Скорост сондаж</p>
              <p className="text-2xl font-bold">
                {worker.drillingRate ?? "--"}
              </p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-xs">Време в покой</p>
              <p className="text-2xl font-bold">{worker.idleTimePercent}%</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-xs">Време в опашка</p>
              <p className="text-2xl font-bold">{worker.queueTime} мин</p>
            </CardContent>
          </Card>
        </div>

        {/* Gantt Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Времева линия на смяната
            </CardTitle>
            <CardDescription>
              Детайлен разбив на активността за текущата смяна
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GanttTimeline events={events} />
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Производствени събития</CardTitle>
            <CardDescription>
              Дневник на активността с времеви маркери
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Начало</TableHead>
                  <TableHead>Край</TableHead>
                  <TableHead>Тип активност</TableHead>
                  <TableHead className="text-right">
                    Преместени тонове
                  </TableHead>
                  <TableHead>ID камион</TableHead>
                  <TableHead>Местоположение</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event, i) => (
                  <TableRow key={i}>
                    <TableCell>{event.start}</TableCell>
                    <TableCell>{event.end}</TableCell>
                    <TableCell>
                      {event.activityType === "productive"
                        ? "Продуктивно"
                        : event.activityType === "queue"
                          ? "Опашка"
                          : event.activityType === "spot"
                            ? "Позициониране"
                            : event.activityType === "idle"
                              ? "В покой"
                              : "Поддръжка"}
                    </TableCell>
                    <TableCell className="text-right">
                      {event.tonsMoved ? `${event.tonsMoved}т` : "--"}
                    </TableCell>
                    <TableCell>{event.truckId}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.location}
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

  if (equipment) {
    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
              <Truck className="text-muted-foreground h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{equipment.id}</h2>
              <p className="text-muted-foreground capitalize">
                {equipment.type === "truck"
                  ? "Камион"
                  : equipment.type === "excavator"
                    ? "Багер"
                    : equipment.type === "drill"
                      ? "Сонда"
                      : "Поддръжка"}
              </p>
              <Badge
                variant={
                  equipment.status === "active"
                    ? "default"
                    : equipment.status === "idle"
                      ? "secondary"
                      : "destructive"
                }
                className="mt-1"
              >
                {equipment.status === "active"
                  ? "Активен"
                  : equipment.status === "idle"
                    ? "В покой"
                    : "Поддръжка"}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="flex gap-4">
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-xs">Използваемост</p>
              <p className="text-2xl font-bold">
                {equipment.utilizationPercent}%
              </p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-xs">
                Време на цикъл (ср.)
              </p>
              <p className="text-2xl font-bold">
                {equipment.cycleTimeAvg ?? "--"} мин
              </p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-xs">
                Товароносимост (ср.)
              </p>
              <p className="text-2xl font-bold">
                {equipment.payloadAvg ?? "--"}т
              </p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-xs">Оператор</p>
              <p className="text-lg font-bold">{equipment.operator ?? "--"}</p>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-xs">
                Последна поддръжка
              </p>
              <p className="text-lg font-bold">{equipment.lastMaintenance}</p>
            </CardContent>
          </Card>
        </div>

        {/* Equipment Timeline placeholder */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Времева линия на използване на оборудването
            </CardTitle>
            <CardDescription>Активност за текущата смяна</CardDescription>
          </CardHeader>
          <CardContent>
            <GanttTimeline events={defaultEvents} />
          </CardContent>
        </Card>

        {/* Maintenance History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">История на поддръжка</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Продължителност</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>2026-01-12</TableCell>
                  <TableCell>Планирана</TableCell>
                  <TableCell>Смяна на масло и филтри</TableCell>
                  <TableCell>2 ч</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2026-01-07</TableCell>
                  <TableCell>Непланирана</TableCell>
                  <TableCell>Ремонт на хидравлична линия</TableCell>
                  <TableCell>4 ч</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2026-01-01</TableCell>
                  <TableCell>Планирана</TableCell>
                  <TableCell>Преглед и ротация на гуми</TableCell>
                  <TableCell>3 ч</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback - no selection
  return (
    <div className="text-muted-foreground flex h-96 flex-col items-center justify-center">
      <User className="mb-4 h-16 w-16" />
      <p>Изберете работник или оборудване за детайли</p>
      <Button variant="ghost" onClick={handleBack} className="mt-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад към обзора
      </Button>
    </div>
  );
}
