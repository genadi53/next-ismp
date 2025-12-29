// ===== PLAN TYPE ENUMS =====
export type MonthPlanType =
  | "Месечен оперативен план"
  | "Месечен ГР Проект"
  | "Месечен план добив багери"
  | "Месечен план по одобрени натурални показатели";

// ===== EXCEL DATA TYPES =====
export type RawExcelData = {
  [key: string]: any;
};

// ===== SHOVEL PLAN TYPES =====
export type ExcelShovelData = {
  Фирма: string;
  Дата: string;
  Хоризонт: number;
  "Минна\nмаса": string;
  Багер: string;
  План: number;
  "Етап на отработване": string;
};

// Processed shovel data with proper Date type
export type ProcessedShovelData = {
  Фирма: string;
  Дата: Date;
  Хоризонт: number;
  "Минна\nмаса": string;
  Багер: string;
  План: number;
  "Етап на отработване": string;
};

// Array of processed shovel data
export type ProcessedShovelDataArray = ProcessedShovelData[];

// Database insert type for shovel plans
export type ShovelPlanInsert = {
  PlanMonthDay: string;
  Object: string;
  Horizont: string;
  MMtype: string;
  Shovel: string;
  DumpLocation?: string;
  PlanVol: number;
  Etap: string;
  userAdded?: string;
};

export type ShovelPlanInsertArray = ShovelPlanInsert[];

// ===== OPERATIONAL PLAN TYPES =====
export type ExcelOperationalData = {
  id: number;
  Фирма: string;
  "Руда за преработка - куб.м": number;
  "Руда за преработка - тона": number;
  "Руда за преработка - Cu%": number;
  "Руда за преработка - t metal": number;
  "Добив руда - куб.м": number;
  "Добив руда - тона": number;
  "Добив руда - Cu%": number;
  "Добив руда - t metal": number;
  "Руда от ДЕПО - куб.м": number | null;
  "Руда от ДЕПО - тона": number | null;
  "Руда от ДЕПО - Cu%": number | null;
  "Руда от ДЕПО - t metal": number | null;
  "Руда от МАСИВ - куб.м": number | null;
  "Руда от МАСИВ - тона": number | null;
  "Руда от МАСИВ - Cu%": number | null;
  "Руда от МАСИВ - t metal": number | null;
  "РУДЕН_ПРОСИП_1/2 - куб.м": number | null;
  "РУДЕН_ПРОСИП_1/2 - тона": number | null;
  "РУДЕН_ПРОСИП_1/2 - Cu%": number | null;
  "РУДЕН_ПРОСИП_1/2 - t metal": number | null;
  "Руда НА ДЕПО - куб.м": number | null;
  "Руда НА ДЕПО - тона": number | null;
  "Руда НА ДЕПО - Cu%": number | null;
  "Руда НА ДЕПО - t metal": number | null;
  "Откривка - куб.м": number;
  "Откривка - тона": number;
  "в т.ч. ИБР - куб.м": number | null;
  "в т.ч. ИБР - тона": number | null;
  "в т.ч. ОТКРИВЕН_ПРОСИП - куб.м": number | null;
  "в т.ч. ОТКРИВЕН_ПРОСИП - тона": number | null;
  "ТОН  КМ - ТОН  КМ": number;
  "ТОН  КМ - среден бр. tkm/ на кола": number;
  Дата: string | null;
};

// Raw operational data with numeric date
export type ExcelOperationalDataWithNumericDate = Omit<
  ExcelOperationalData,
  "Дата"
> & {
  Дата: number;
};

// Database type for operational plan data
export type OperationalPlanData = {
  ID: number;
  PlanMonthDay: string;
  Object: string;
  PlanVolOre: number;
  PlanMassOre: number;
  PlanVolOreKet: number;
  PlanmassOreKet: number;
  PlanOreDepoVol: number;
  PlanOreDepoMass: number;
  PlanOreFromDepoVol: number;
  PlanOreFromDepoMass: number;
  PlanIBRDepoVol: number | null;
  PlanIBRDepoMass: number | null;
  PlanIBRFROMDepoVol: number | null;
  PlanIBRFROMDepoMass: number | null;
  PlanVolWaste: number;
  PlanMassWaste: number;
  PlanTkm: number;
  PlanTkmTruckDay: number;
  percent_ore: number;
  Cu_t: number;
  percent_oreFromDepo: number;
  Cu_t_FromDepo: number;
  Cu_t_IBRFromDepo: number | null;
  percent_IBRFromDepo: number | null;
  percent_ore_KET: number;
  Cu_t_KET: number;
  percent_IBRToDepo: number | null;
  Cu_t_IBRToDepo: number | null;
  percent_oreDepo: number;
  Cu_t_Depo: number;
  PlanVolOreMasiv: number | null;
  PlanMassOreMasiv: number | null;
  PlanVolOreProsip: number;
  PlanMassOreProsip: number | null;
  PlanVolWasteProsip: number | null;
  PlanMassWasteProsip: number | null;
  percent_oreMasiv: number;
  Cu_t_Masiv: number;
  percent_oreProsip: number;
  Cu_t_Prosip: number;
  PlanVolIBRToDepo: number;
  PlanMassIBRToDepo: number;
  lrd?: string;
  userAdded: string;
};

// Database insert type for operational plans (without ID and lrd)
export type OperationalPlanInsert = Omit<OperationalPlanData, "ID" | "lrd">;

// Array of operational plan inserts
export type OperationalPlanInsertArray = OperationalPlanInsert[];

// ===== Natural Indicators PLAN TYPES =====

export type NaturalIndicatorsPlanExcelData = {
  id: number;
  "АвтоРаб. ММ - tkm": number;
  Дата: string;
  "Минна маса - m³": number;
  "Минна маса - t": number;
  "Общо Обеми - m³": number;
  "Общо Обеми - t": number;
  "Откривка+ДЕПО - m³": number;
  "Откривка+ДЕПО - t": number;
  "Погасен запас руда от масив (над 0.10/0.10%, Cu) - %": number;
  "Погасен запас руда от масив (над 0.10/0.10%, Cu) - Cu, t": number;
  "Погасен запас руда от масив (над 0.10/0.10%, Cu) - m³": number;
  "Погасен запас руда от масив (над 0.10/0.10%, Cu) - t": number;
  "Руда за преработка - %": number;
  "Руда за преработка - Cu, t": number;
  "Руда за преработка - m³": number;
  "Руда за преработка - t": number;
  "в т.ч. БР за преработка ОТ ДЕПО - %": number;
  "в т.ч. БР за преработка ОТ ДЕПО - Cu, t": number;
  "в т.ч. БР за преработка ОТ ДЕПО - m³": number;
  "в т.ч. БР за преработка ОТ ДЕПО - t": number;
  "в т.ч. МО (ИБР) за преработка ОТ ДЕПО - %": number;
  "в т.ч. МО (ИБР) за преработка ОТ ДЕПО - Cu, t": number;
  "в т.ч. МО (ИБР) за преработка ОТ ДЕПО - m³": number;
  "в т.ч. МО (ИБР) за преработка ОТ ДЕПО - t": number;
  "в т.ч. Откр. (без ДЕПО) - m³": number;
  "в т.ч. Откр. (без ДЕПО) - t": number;
  "в т.ч. добит МО (ИБР) депониран НА ДЕПО - %": number;
  "в т.ч. добит МО (ИБР) депониран НА ДЕПО - Cu, t": number;
  "в т.ч. добит МО (ИБР) депониран НА ДЕПО - m³": number;
  "в т.ч. добит МО (ИБР) депониран НА ДЕПО - t": number;
  "в т.ч. добита БР депонирана НА ДЕПО - %": number;
  "в т.ч. добита БР депонирана НА ДЕПО - Cu, t": number;
  "в т.ч. добита БР депонирана НА ДЕПО - m³": number;
  "в т.ч. добита БР депонирана НА ДЕПО - t": number;
  "ср. р-н ММ - km": number;
};

export type NaturalIndicatorsPlanData = {
  ID: number;
  PlanMonthDay: string;
  PlanType: string;
  Object: string;
  PlanVolOre: number;
  PlanMassOre: number;
  percent_ore: number;
  Cu_t: number;
  PlanVolOreKet: number;
  PlanMassOreKet: number;
  percent_oreKet: number;
  Cu_t_Ket: number;
  PlanVolOreFromDepo: number;
  PlanMassOreFromDepo: number;
  percent_oreFromDepo: number;
  Cu_t_FromDepo: number;
  PlanVolIBRFromDepo: number;
  PlanMassIBRFromDepo: number;
  percent_IBRFromDepo: number;
  Cu_t_IBRFromDepo: number;
  PlanVolOreDepo: number;
  PlanMassOreDepo: number;
  percent_oreDepo: number;
  Cu_t_Depo: number;
  PlanVolIBRToDepo: number;
  PlanMassIBRToDepo: number;
  percent_IBRToDepo: number;
  Cu_t_IBRToDepo: number;
  PlanVolWaste: number;
  PlanMassWaste: number;
  PlanVolTot: number;
  PlanMassTot: number;
  Planvol: number;
  PlanMass: number;
  PlanTkmOre: number;
  AvgkmOre: number;
  PlanTkmWaste: number;
  AvgkmWaste: number;
  PlanTkm: number;
  Avgkm: number;
  userAdded: string;
};

// Database insert type for natural indicators plans
export type NaturalIndicatorsPlanInsert = Omit<NaturalIndicatorsPlanData, "ID">;

// Array of natural indicators plan inserts
export type NaturalIndicatorsPlanInsertArray = NaturalIndicatorsPlanInsert[];

// ===== UNION TYPES =====
// Union type for all plan insert types
export type PlanInsertTypes =
  | ShovelPlanInsertArray
  | OperationalPlanInsertArray
  | NaturalIndicatorsPlanInsertArray;

