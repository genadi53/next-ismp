import type {
  ShovelPlanInsert,
  ExcelOperationalData,
  OperationalPlanInsert,
  ProcessedShovelData,
  NaturalIndicatorsPlanInsert,
  NaturalIndicatorsPlanExcelData,
  GRProjectPlanExcelData,
  GRProjectPlanInsert,
} from "@/server/repositories/mine-planning";
import { format, parse } from "date-fns";

export const monthPlanMapper = (
  data: ExcelOperationalData
): OperationalPlanInsert => {
  // Helper function to parse date string and return formatted date
  const parseAndFormatDate = (dateStr: string | null): string => {
    if (!dateStr) {
      return format(new Date(), "yyyy-MM-dd");
    }

    // Check if date is already in ISO format (yyyy-MM-dd)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      return dateStr.trim();
    }

    // Try to parse Bulgarian format (d.M.yyyy or dd.M.yyyy or d.MM.yyyy or dd.MM.yyyy)
    const bulgarianDateMatch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(dateStr);
    if (bulgarianDateMatch) {
      const [, day, month, year] = bulgarianDateMatch;
      const date = new Date(parseInt(year ?? "2026"), parseInt(month ?? "01") - 1, parseInt(day ?? "01"));
      if (!isNaN(date.getTime())) {
        return format(date, "yyyy-MM-dd");
      }
    }

    // Try to parse with date-fns parse function (handles various formats)
    try {
      // Try common date formats
      const formats = [
        "d.M.yyyy",
        "dd.M.yyyy",
        "d.MM.yyyy",
        "dd.MM.yyyy",
        "yyyy-MM-dd",
      ];
      for (const fmt of formats) {
        try {
          const parsed = parse(dateStr.trim(), fmt, new Date());
          if (!isNaN(parsed.getTime())) {
            return format(parsed, "yyyy-MM-dd");
          }
        } catch {
          continue;
        }
      }
    } catch {
      // Fall through to default
    }

    // If all parsing fails, return current date formatted
    return format(new Date(), "yyyy-MM-dd");
  };

  return {
    PlanMonthDay: parseAndFormatDate(data.Дата),
    Object: data.Фирма,

    PlanVolOre: data["Добив руда - куб.м"] ?? 0,
    PlanMassOre: data["Добив руда - тона"] ?? 0,
    percent_ore: data["Добив руда - Cu%"] ?? 0,
    Cu_t: data["Добив руда - t metal"] ?? 0,

    PlanVolOreKet: data["Руда за преработка - куб.м"] ?? 0,
    PlanmassOreKet: data["Руда за преработка - тона"] ?? 0,
    percent_ore_KET: data["Руда за преработка - Cu%"] ?? 0,
    Cu_t_KET: data["Руда за преработка - t metal"] ?? 0,

    PlanOreFromDepoVol: data["Руда от ДЕПО - куб.м"] ?? 0,
    PlanOreFromDepoMass: data["Руда от ДЕПО - тона"] ?? 0,
    percent_oreFromDepo: data["Руда от ДЕПО - Cu%"] ?? 0,
    Cu_t_FromDepo: data["Руда от ДЕПО - t metal"] ?? 0,

    PlanVolOreMasiv: data["Руда от МАСИВ - куб.м"] ?? null,
    PlanMassOreMasiv: data["Руда от МАСИВ - тона"] ?? null,
    percent_oreMasiv: data["Руда от МАСИВ - Cu%"] ?? 0,
    Cu_t_Masiv: data["Руда от МАСИВ - t metal"] ?? 0,

    PlanVolOreProsip: data["РУДЕН_ПРОСИП_1/2 - куб.м"] ?? 0,
    PlanMassOreProsip: data["РУДЕН_ПРОСИП_1/2 - тона"] ?? null,
    percent_oreProsip: data["РУДЕН_ПРОСИП_1/2 - Cu%"] ?? 0,
    Cu_t_Prosip: data["РУДЕН_ПРОСИП_1/2 - t metal"] ?? 0,

    PlanOreDepoVol: data["Руда НА ДЕПО - куб.м"] ?? 0,
    PlanOreDepoMass: data["Руда НА ДЕПО - тона"] ?? 0,
    percent_oreDepo: data["Руда НА ДЕПО - Cu%"] ?? 0,
    Cu_t_Depo: data["Руда НА ДЕПО - t metal"] ?? 0,

    PlanVolWaste: data["Откривка - куб.м"] ?? 0,
    PlanMassWaste: data["Откривка - тона"] ?? 0,

    PlanVolIBRToDepo: data["в т.ч. ИБР - куб.м"] ?? 0,
    PlanMassIBRToDepo: data["в т.ч. ИБР - тона"] ?? 0,

    PlanVolWasteProsip: data["в т.ч. ОТКРИВЕН_ПРОСИП - куб.м"] ?? null,
    PlanMassWasteProsip: data["в т.ч. ОТКРИВЕН_ПРОСИП - тона"] ?? null,

    PlanTkm: data["ТОН  КМ - ТОН  КМ"] ?? 0,
    PlanTkmTruckDay: data["ТОН  КМ - среден бр. tkm/ на кола"] ?? 0,

    PlanIBRDepoVol: null,
    PlanIBRDepoMass: null,

    PlanIBRFROMDepoVol: null,
    PlanIBRFROMDepoMass: null,

    Cu_t_IBRFromDepo: null,
    percent_IBRFromDepo: null,

    percent_IBRToDepo: null,
    Cu_t_IBRToDepo: null,
    userAdded: "test@testov",
  };
};

export const planShovelsMapper = (
  plan: ProcessedShovelData
): ShovelPlanInsert => {
  return {
    PlanMonthDay: format(plan.Дата, "yyyy-MM-dd"),
    Object: plan.Фирма,
    Horizont: `${plan.Хоризонт}`,
    MMtype: plan["Минна\nмаса"],
    Shovel: plan.Багер,
    PlanVol: Number(plan.План.toFixed(3)),
    Etap: plan["Етап на отработване"],
    userAdded: "test@testov",
  };
};

export const naturalIndicatorsPlanMapper = (
  plan: NaturalIndicatorsPlanExcelData
): NaturalIndicatorsPlanInsert => {
  return {
    PlanMonthDay: plan.Дата,
    PlanType: "НП", //РП_ПО // НП // РП_СМП;
    Object: "ELL",
    PlanVolOre: plan["Погасен запас руда от масив (над 0.10/0.10%, Cu) - m³"],
    PlanMassOre:
      plan["Погасен запас руда от масив (над 0.10/0.10%, Cu) - Cu, t"],
    percent_ore: plan["Погасен запас руда от масив (над 0.10/0.10%, Cu) - %"],
    Cu_t: plan["Погасен запас руда от масив (над 0.10/0.10%, Cu) - t"],
    PlanVolOreKet: plan["Руда за преработка - m³"],
    PlanMassOreKet: plan["Руда за преработка - t"],
    percent_oreKet: plan["Руда за преработка - %"],
    Cu_t_Ket: plan["Руда за преработка - Cu, t"],
    PlanVolOreFromDepo: plan["в т.ч. БР за преработка ОТ ДЕПО - m³"],
    PlanMassOreFromDepo: plan["в т.ч. БР за преработка ОТ ДЕПО - t"],
    percent_oreFromDepo: plan["в т.ч. БР за преработка ОТ ДЕПО - %"],
    Cu_t_FromDepo: plan["в т.ч. БР за преработка ОТ ДЕПО - Cu, t"],

    // =============== Not sure about this 8
    PlanVolIBRFromDepo: plan["в т.ч. МО (ИБР) за преработка ОТ ДЕПО - m³"],
    PlanMassIBRFromDepo: plan["в т.ч. МО (ИБР) за преработка ОТ ДЕПО - t"],
    percent_IBRFromDepo: plan["в т.ч. МО (ИБР) за преработка ОТ ДЕПО - %"],
    Cu_t_IBRFromDepo: plan["в т.ч. МО (ИБР) за преработка ОТ ДЕПО - Cu, t"],
    PlanVolOreDepo: plan["в т.ч. добита БР депонирана НА ДЕПО - m³"],
    PlanMassOreDepo: plan["в т.ч. добита БР депонирана НА ДЕПО - t"],
    percent_oreDepo: plan["в т.ч. добита БР депонирана НА ДЕПО - %"],
    Cu_t_Depo: plan["в т.ч. добита БР депонирана НА ДЕПО - Cu, t"],
    //================================

    PlanVolIBRToDepo: plan["в т.ч. добит МО (ИБР) депониран НА ДЕПО - m³"],
    PlanMassIBRToDepo: plan["в т.ч. добит МО (ИБР) депониран НА ДЕПО - t"],
    percent_IBRToDepo: plan["в т.ч. добит МО (ИБР) депониран НА ДЕПО - %"],
    Cu_t_IBRToDepo: plan["в т.ч. добит МО (ИБР) депониран НА ДЕПО - Cu, t"],
    PlanVolWaste: plan["Откривка+ДЕПО - m³"], //в т.ч. Откр. (без ДЕПО) - m³
    PlanMassWaste: plan["Откривка+ДЕПО - t"], //в т.ч. Откр. (без ДЕПО) - t
    PlanVolTot: plan["Общо Обеми - m³"],
    PlanMassTot: plan["Общо Обеми - t"],
    Planvol: plan["Минна маса - m³"],
    PlanMass: plan["Минна маса - t"],
    PlanTkmOre: plan["АвтоРаб. ММ - tkm"],
    AvgkmOre: plan["ср. р-н ММ - km"],
    PlanTkmWaste: 0,
    AvgkmWaste: 0,
    PlanTkm: 0,
    Avgkm: 0,
    userAdded: "test@testov",
  };
};

export const grProjectPlanMapper = (
  plan: GRProjectPlanExcelData
): GRProjectPlanInsert => {
  return {
    PlanMonthDay: plan.Дата,
    PlanType: "ГР_Проект", // GR Project plan type
    Object: "ELL",
    PlanVolOre: plan["Погасен запас руда от масив (над 0.10/0.10%, Cu) - m³"],
    PlanMassOre:
      plan["Погасен запас руда от масив (над 0.10/0.10%, Cu) - Cu, t"],
    percent_ore: plan["Погасен запас руда от масив (над 0.10/0.10%, Cu) - %"],
    Cu_t: plan["Погасен запас руда от масив (над 0.10/0.10%, Cu) - t"],
    PlanVolOreKet: plan["Руда за преработка - m³"],
    PlanMassOreKet: plan["Руда за преработка - t"],
    percent_oreKet: plan["Руда за преработка - %"],
    Cu_t_Ket: plan["Руда за преработка - Cu, t"],
    PlanVolOreFromDepo: plan["в т.ч. БР за преработка ОТ ДЕПО - m³"],
    PlanMassOreFromDepo: plan["в т.ч. БР за преработка ОТ ДЕПО - t"],
    percent_oreFromDepo: plan["в т.ч. БР за преработка ОТ ДЕПО - %"],
    Cu_t_FromDepo: plan["в т.ч. БР за преработка ОТ ДЕПО - Cu, t"],

    PlanVolIBRFromDepo: plan["в т.ч. МО (ИБР) за преработка ОТ ДЕПО - m³"],
    PlanMassIBRFromDepo: plan["в т.ч. МО (ИБР) за преработка ОТ ДЕПО - t"],
    percent_IBRFromDepo: plan["в т.ч. МО (ИБР) за преработка ОТ ДЕПО - %"],
    Cu_t_IBRFromDepo: plan["в т.ч. МО (ИБР) за преработка ОТ ДЕПО - Cu, t"],
    PlanVolOreDepo: plan["в т.ч. добита БР депонирана НА ДЕПО - m³"],
    PlanMassOreDepo: plan["в т.ч. добита БР депонирана НА ДЕПО - t"],
    percent_oreDepo: plan["в т.ч. добита БР депонирана НА ДЕПО - %"],
    Cu_t_Depo: plan["в т.ч. добита БР депонирана НА ДЕПО - Cu, t"],

    PlanVolIBRToDepo: plan["в т.ч. добит МО (ИБР) депониран НА ДЕПО - m³"],
    PlanMassIBRToDepo: plan["в т.ч. добит МО (ИБР) депониран НА ДЕПО - t"],
    percent_IBRToDepo: plan["в т.ч. добит МО (ИБР) депониран НА ДЕПО - %"],
    Cu_t_IBRToDepo: plan["в т.ч. добит МО (ИБР) депониран НА ДЕПО - Cu, t"],
    PlanVolWaste: plan["Откривка+ДЕПО - m³"],
    PlanMassWaste: plan["Откривка+ДЕПО - t"],
    PlanVolTot: plan["Общо Обеми - m³"],
    PlanMassTot: plan["Общо Обеми - t"],
    Planvol: plan["Минна маса - m³"],
    PlanMass: plan["Минна маса - t"],
    PlanTkmOre: plan["АвтоРаб. ММ - tkm"],
    AvgkmOre: plan["ср. р-н ММ - km"],
    PlanTkmWaste: 0,
    AvgkmWaste: 0,
    PlanTkm: 0,
    Avgkm: 0,
    userAdded: "test@testov",
  };
};
