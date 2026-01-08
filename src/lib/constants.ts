import type { DrillType, MonthBG, ShiftNames } from "@/types/global.types";

export const HermesOperatorDlazhnost = [
  "Машинист,еднок.багер/Багерист",
  "Сондьор",
  "Шофьор,теж.авт./>25т,автомонт.",
] as const;

// CRK01	Рудник // CRK04	ТАТ
export const HermesOperatorDepartment = ["CRK01", "CRK04"] as const;

export const HermesZvena = {
  "001": "БАГЕРИ",
  "002": "СОНДИ",
  "003": "БУЛДОЗЕРИ",
  "004": "ПЪТИЩА И ОТВАЛИ",
  "009": "АВТОСАМОСВАЛИ ОСНОВНИ",
  "010": "АВТОСАМОСВАЛИ ПОМОЩНИ",
  "015": "ОБРУШВАНЕ",
};

export const HermesOperatorZveno = [
  "001",
  "002",
  "003",
  "004",
  "009",
  "010",
  "015",
] as const;

export const HermesEqmtGroupName = [
  "БАГЕРИ",
  "СОНДИ",
  "БУЛДОЗЕРИ",
  "ПЪТИЩА И ОТВАЛИ",
  "АВТОСАМОСВАЛИ ОСНОВНИ",
  "АВТОСАМОСВАЛИ ПОМОЩНИ",
  "ОБРУШВАНЕ",
] as const;

export const Materials = ["Руда", "Откривка", "Вътрешни"] as const;

export const Common_Problems = [] as const;

export const DispatcherSystemNames = {
  20034: "k.y.krastev",
  22041: "d.p.dimitrov",
  20043: "i.ts.marinov",
  20046: "i.peev",
  20068: "g.katsarov",
  20210: "ts.angelov",
  29301: "e.todorov",
  20211: "v.chikov",
  20047: "r.yolov",
  22002: "ts.genkov",
  22030: "t.i.ivanov",
  22177: "i.enkov",
  22388: "e.evtimov",
  29305: "s.stamenov",
};

export const DRILLS_TYPES: DrillType[] = [
  "A7",
  "A8",
  "A9",
  "A10",
  "C4",
  "C5",
  "C11",
  "C14",
  "SK1",
  "SK2",
  "SK3",
  "SK6",
  "S12",
  "S13",
];

export const SHOVELS = [
  "2B10",
  "2B11",
  "2B12",
  "2B13",
  "2B14",
  "2B15",
  "2B16",
  "2B17",
  "2B18",
  "2B19",
  "2B20",
  "2B21",
];

export const LOADERS = ["2L07", "2L11", "2L12", "2L13", "2L14", "2L15", "2L16"];

export const FUEL_TRUCKS = [
  // "2N001"
  // "2N002"
  // "2N003"
  "2N0601",
  "2N1862",
  "2N6337",
];

export const DRILLS_DISPATCH = [
  "2S03",
  "2S06",
  "2S10",
  "2S11",
  "2S14",
  // "2S98",
];

export const WATER_TRUCKS = [
  "2W088",
  "2W097",
  "2W106",
  "2W369",
  "2W370",
  "2W371",
  // "2W999",
];

export const DMA_EXPLOTATION_MEASURES = [
  " ",
  "Година",
  "Години",
  "Месец",
  "Месеци",
];

export const DMA_MEA = [
  " ",
  "Бр.",
  "Комплект",
  "Кг.",
  "Тон",
  "Тона",
  "Куб.м.",
  "Дка.",
  "Метър",
  "Лин. Метри",
];

export const MONTH_NAMES_BG: Record<number, MonthBG> = {
  1: "Януари",
  2: "Февруари",
  3: "Март",
  4: "Април",
  5: "Май",
  6: "Юни",
  7: "Юли",
  8: "Август",
  9: "Септември",
  10: "Октомври",
  11: "Ноември",
  12: "Декември",
};

export const SHIFT_NUMBERS: Record<number, ShiftNames> = {
  1: "Първа",
  2: "Обяд",
  3: "Втора",
  4: "Нощна",
};

export const LOGS_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
export const LOGS_MAX_ROTATED_FILES = 10;
