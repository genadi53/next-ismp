"use client";

import { SheetTabs } from "./bottom-tabs";
import { Sheet2Fleet } from "./fleet";
import { Sheet1Overview } from "./overview";
import { useDashboard } from "./store";
import { Sheet4Detail } from "./worker-details";
import { Sheet3Workers } from "./workers";

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

interface Alert {
  id: string;
  entity: string;
  entityType: "equipment" | "worker";
  metric: string;
  value: number;
  threshold: number;
  trend: "up" | "down" | "stable";
}

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

export default function MiningDashboard() {
  const { miningDashboard } = useDashboard();
  const { ui, detailSheet } = miningDashboard;
  const { activeSheetId, setActiveSheetId } = ui;
  const { setDetailSelectedWorkerId, setDetailSelectedEquipmentId } =
    detailSheet;

  const handleWorkerClick = (workerId: string) => {
    setDetailSelectedWorkerId(workerId);
    setDetailSelectedEquipmentId(null);
    setActiveSheetId(4);
  };

  const handleEquipmentClick = (equipmentId: string) => {
    setDetailSelectedEquipmentId(equipmentId);
    setDetailSelectedWorkerId(null);
    setActiveSheetId(4);
  };

  const handleAlertClick = (alert: Alert) => {
    if (alert.entityType === "worker") {
      // Try to find by name - handles Bulgarian names
      const worker = WORKERS.find((w) => w.name === alert.entity);
      if (worker) handleWorkerClick(worker.id);
    } else {
      handleEquipmentClick(alert.entity);
    }
  };

  return (
    <div className="bg-background min-h-screen pb-12">
      {/* Main Content */}
      <div className="mx-auto max-w-[1600px]">
        {activeSheetId === 1 && (
          <Sheet1Overview onAlertClick={handleAlertClick} />
        )}
        {activeSheetId === 2 && (
          <Sheet2Fleet onEquipmentClick={handleEquipmentClick} />
        )}
        {activeSheetId === 3 && (
          <Sheet3Workers onWorkerClick={handleWorkerClick} />
        )}
        {activeSheetId === 4 && <Sheet4Detail />}
      </div>

      {/* Excel-style Footer Tabs */}
      <SheetTabs />
    </div>
  );
}
