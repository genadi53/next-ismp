"use client";

import { Badge } from "@/components/ui/badge";
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
import { ChevronDown, ChevronRight, Clock, Gauge, Users } from "lucide-react";
import { useMemo } from "react";
import { Sparkline } from "./charts";
import { useDashboard } from "./store";
import { WorkerTooltip } from "./worker-tooltip";

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

interface Task {
  id: string;
  workerId: string;
  description: string;
  tonnes: number;
  startTime: string;
  endTime: string;
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

const TASKS: Task[] = [
  {
    id: "t1",
    workerId: "w1",
    description: "Отвал 1 → КЕТ 3",
    tonnes: 2100,
    startTime: "14:00",
    endTime: "18:30",
  },
  {
    id: "t2",
    workerId: "w1",
    description: "РП 1400 → КЕТ 1",
    tonnes: 1000,
    startTime: "18:45",
    endTime: "22:00",
  },
  {
    id: "t3",
    workerId: "w2",
    description: "РП 1200 → КЕТ 1",
    tonnes: 1800,
    startTime: "14:00",
    endTime: "17:30",
  },
  {
    id: "t4",
    workerId: "w2",
    description: "РП 1240 → КЕТ 3",
    tonnes: 1150,
    startTime: "17:45",
    endTime: "22:00",
  },
  {
    id: "t5",
    workerId: "w3",
    description: "Товарене в КЕТ 3",
    tonnes: 5200,
    startTime: "14:00",
    endTime: "22:00",
  },
  {
    id: "t6",
    workerId: "w4",
    description: "Сондиране Зона А",
    tonnes: 0,
    startTime: "14:00",
    endTime: "22:00",
  },
];

export // Sheet 3: Workers & Production
function Sheet3Workers({
  onWorkerClick,
}: {
  onWorkerClick: (workerId: string) => void;
}) {
  const {
    miningDashboard: { workersSheet },
  } = useDashboard();

  const {
    workersSortKey,
    workersSortDir,
    setWorkersSort,
    expandedCrewNames,
    expandedWorkerIds,
    setExpandedCrewNames,
    setExpandedWorkerIds,
  } = workersSheet;

  const expandedCrews = new Set(expandedCrewNames);
  const expandedWorkers = new Set(expandedWorkerIds);

  const sortedWorkers = useMemo(() => {
    return [...WORKERS].sort((a, b) => {
      const aVal = a[workersSortKey as keyof Worker] ?? 0;
      const bVal = b[workersSortKey as keyof Worker] ?? 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return workersSortDir === "desc" ? bVal - aVal : aVal - bVal;
      }
      return 0;
    });
  }, [workersSortKey, workersSortDir]);

  const handleSort = (key: keyof Worker) => {
    setWorkersSort(
      key as
        | "name"
        | "oreTonnes"
        | "materialMoved"
        | "tkph"
        | "idleTimePercent"
        | "shiftUtilPercent",
    );
  };

  const crews = useMemo(() => {
    const crewMap = new Map<string, Worker[]>();
    WORKERS.forEach((w) => {
      const list = crewMap.get(w.crew) ?? [];
      list.push(w);
      crewMap.set(w.crew, list);
    });
    return Array.from(crewMap.entries());
  }, []);

  const toggleCrew = (crew: string) => {
    const next = new Set(expandedCrews);
    if (next.has(crew)) next.delete(crew);
    else next.add(crew);
    setExpandedCrewNames(Array.from(next));
  };

  const toggleWorker = (workerId: string) => {
    const next = new Set(expandedWorkers);
    if (next.has(workerId)) next.delete(workerId);
    else next.add(workerId);
    setExpandedWorkerIds(Array.from(next));
  };

  const totalWorkers = WORKERS.length;
  const totalWorkingTime = WORKERS.reduce(
    (acc, w) => acc + (w.shiftUtilPercent * 8) / 100,
    0,
  );
  const avgTkph = WORKERS.filter((w) => w.tkph > 0).reduce(
    (acc, w, _, arr) => acc + w.tkph / arr.length,
    0,
  );

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Работници и производство</h2>

      {/* Summary KPI Cards */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="text-muted-foreground h-8 w-8" />
            <div>
              <p className="text-muted-foreground text-xs">
                Работници на смяна
              </p>
              <p className="text-2xl font-bold">{totalWorkers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="text-muted-foreground h-8 w-8" />
            <div>
              <p className="text-muted-foreground text-xs">
                Общо работно време
              </p>
              <p className="text-2xl font-bold">
                {totalWorkingTime.toFixed(0)} ч
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="flex items-center gap-3 p-4">
            <Gauge className="text-muted-foreground h-8 w-8" />
            <div>
              <p className="text-muted-foreground text-xs">Средно TKPH</p>
              <p className="text-2xl font-bold">{avgTkph.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workers Leaderboard */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Класация работници</CardTitle>
          <CardDescription>
            Кликнете на заглавките за сортиране, на редовете за детайли
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="hover:text-foreground cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Работник{" "}
                  {workersSortKey === "name" &&
                    (workersSortDir === "desc" ? "↓" : "↑")}
                </TableHead>
                <TableHead
                  className="hover:text-foreground cursor-pointer text-right"
                  onClick={() => handleSort("oreTonnes")}
                >
                  Руда (т){" "}
                  {workersSortKey === "oreTonnes" &&
                    (workersSortDir === "desc" ? "↓" : "↑")}
                </TableHead>
                <TableHead
                  className="hover:text-foreground cursor-pointer text-right"
                  onClick={() => handleSort("materialMoved")}
                >
                  Материал (т){" "}
                  {workersSortKey === "materialMoved" &&
                    (workersSortDir === "desc" ? "↓" : "↑")}
                </TableHead>
                <TableHead
                  className="hover:text-foreground cursor-pointer text-right"
                  onClick={() => handleSort("tkph")}
                >
                  TKPH{" "}
                  {workersSortKey === "tkph" &&
                    (workersSortDir === "desc" ? "↓" : "↑")}
                </TableHead>
                <TableHead className="text-right">Скорост сондаж</TableHead>
                <TableHead
                  className="hover:text-foreground cursor-pointer text-right"
                  onClick={() => handleSort("idleTimePercent")}
                >
                  В покой %{" "}
                  {workersSortKey === "idleTimePercent" &&
                    (workersSortDir === "desc" ? "↓" : "↑")}
                </TableHead>
                <TableHead
                  className="hover:text-foreground cursor-pointer text-right"
                  onClick={() => handleSort("shiftUtilPercent")}
                >
                  Използ. %{" "}
                  {workersSortKey === "shiftUtilPercent" &&
                    (workersSortDir === "desc" ? "↓" : "↑")}
                </TableHead>
                <TableHead className="w-24">Тренд</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedWorkers.map((worker) => (
                <TableRow
                  key={worker.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onWorkerClick(worker.id)}
                >
                  <TableCell>
                    <WorkerTooltip worker={worker}>
                      <span className="font-medium hover:underline">
                        {worker.name}
                      </span>
                    </WorkerTooltip>
                  </TableCell>
                  <TableCell className="text-right">
                    {worker.oreTonnes.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {worker.materialMoved.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {worker.tkph ?? "--"}
                  </TableCell>
                  <TableCell className="text-right">
                    {worker.drillingRate ?? "--"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        worker.idleTimePercent > 10 ? "text-amber-500" : ""
                      }
                    >
                      {worker.idleTimePercent}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {worker.shiftUtilPercent}%
                  </TableCell>
                  <TableCell>
                    <Sparkline
                      data={worker.sparklineData}
                      color="var(--chart-1)"
                      width={60}
                      height={20}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hierarchical Matrix */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Екип → Работник → Задача</CardTitle>
          <CardDescription>
            Разгънете за да видите детайли за задача
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {crews.map(([crewName, workers]) => (
              <div key={crewName} className="overflow-hidden rounded-lg border">
                {/* Crew row */}
                <div
                  className="bg-muted/50 hover:bg-muted flex cursor-pointer items-center gap-2 p-3"
                  onClick={() => toggleCrew(crewName)}
                >
                  {expandedCrews.has(crewName) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="font-semibold">{crewName}</span>
                  <Badge variant="secondary" className="ml-2">
                    {workers.length} работника
                  </Badge>
                </div>

                {/* Workers */}
                {expandedCrews.has(crewName) && (
                  <div className="pl-6">
                    {workers.map((worker) => {
                      const workerTasks = TASKS.filter(
                        (t) => t.workerId === worker.id,
                      );
                      return (
                        <div key={worker.id}>
                          {/* Worker row */}
                          <div
                            className="hover:bg-muted/30 flex cursor-pointer items-center gap-2 border-t p-2"
                            onClick={() => toggleWorker(worker.id)}
                          >
                            {workerTasks.length > 0 ? (
                              expandedWorkers.has(worker.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )
                            ) : (
                              <div className="w-4" />
                            )}
                            <WorkerTooltip worker={worker}>
                              <span className="hover:underline">
                                {worker.name}
                              </span>
                            </WorkerTooltip>
                            <span className="text-muted-foreground ml-2 text-xs">
                              {worker.role}
                            </span>
                          </div>

                          {/* Tasks */}
                          {expandedWorkers.has(worker.id) &&
                            workerTasks.length > 0 && (
                              <div className="space-y-1 pb-2 pl-10">
                                {workerTasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="text-muted-foreground border-muted flex items-center gap-4 border-l-2 py-1 pl-3 text-sm"
                                  >
                                    <span className="text-foreground">
                                      {task.description}
                                    </span>
                                    <span>
                                      {task.tonnes > 0
                                        ? `${task.tonnes.toLocaleString()}t`
                                        : "--"}
                                    </span>
                                    <span>
                                      {task.startTime} - {task.endTime}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
