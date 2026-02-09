import { z } from "zod";

export const blastingRapportSchema = z
  .object({
    ShiftDate: z.date(),
    VP_num: z.number(),
    Horiz: z.number(),
    site_conditon: z.string(),
    quality_do_1m: z.number(),
    quality_nad_1m: z.number(),
    quality_zone_prosip: z.number(),
    water_presence_drilling: z.number(),
    water_presence_fueling: z.number(),
    ANFO: z.number(),
    E1100: z.number(),
    E3400: z.number(),
    non_retaining: z.number(),
    quality_explosive: z.string(),
    quality_zatapka: z.number(),
    smoke_presence: z.array(z.string()),
    scattering: z.string(),
    presence_negabarit: z.string(),
    state_blast_material: z.array(z.string()),
    state_blast_site_after: z.array(z.string()),
    non_blasted_num: z.number(),
    Initiate: z.string(),
  })
  .refine(
    ({ E1100, E3400, ANFO }) => {
      const sum = ANFO + E1100 + E3400;
      if (sum > 132 || sum <= 0) {
        return false;
      } else {
        return true;
      }
    },
    {
      message:
        "Невалидно въведени параметри за 'Зареждане'. Максималната обща стойност е 100%.",
      path: ["E3400"],
    }
  );

export type BlastinReportFormData = z.infer<typeof blastingRapportSchema>;

export type SmokePresence =
  | "Липсват"
  | "Бял"
  | "Светло жълт"
  | "Оранжев"
  | "Тъмно оранжев"
  | "Липсва видимост";

export type Scattering = "Слаб" | "Нормален" | "Наднормален" | "Липсва видимост";

export type StateBlastMaterial =
  | "Отцепено по границите на полето"
  | "Наличие на върнат материал зад границите на полето"
  | "Взривеният материал е надигнат"
  | "Взривеният материал е разлят напред по площадката";

export type PresenceNegabarit =
  | "Липсват"
  | "Единични"
  | "Концентрирани"
  | "Навсякъде в материала";

export type StateBlastSiteAfter =
  | "Наличие на надгърмяване"
  | "Наличие на пукнатини - концентрирани"
  | "Наличие на пукнатини - по цялата дължина на границата"
  | "Нормално";

export type Initiate = "НОНЕЛ" | "Електронно";

export const FieldConditions = [
  "Добро",
  "Средно",
  "Лошо",
] as const;

export type PercentLabels = "100%" | ">2/3" | "1/3<X<2/3" | "<1/3" | "0%";

export const PercentValues: Record<PercentLabels, number> = {
  "0%": 0,
  "<1/3": 33,
  "1/3<X<2/3": 50,
  ">2/3": 66,
  "100%": 100,
};

const SMOKE_PRESENCE_OPTIONS: SmokePresence[] = [
  "Липсват",
  "Бял",
  "Светло жълт",
  "Оранжев",
  "Тъмно оранжев",
  "Липсва видимост",
];

const SCATTERING_OPTIONS: Scattering[] = [
  "Слаб",
  "Нормален",
  "Наднормален",
  "Липсва видимост",
];

const STATE_BLAST_MATERIAL_OPTIONS: StateBlastMaterial[] = [
  "Отцепено по границите на полето",
  "Наличие на върнат материал зад границите на полето",
  "Взривеният материал е надигнат",
  "Взривеният материал е разлят напред по площадката",
];

const PRESENCE_NEGABARIT_OPTIONS: PresenceNegabarit[] = [
  "Липсват",
  "Единични",
  "Концентрирани",
  "Навсякъде в материала",
];

const STATE_BLAST_SITE_AFTER_OPTIONS: StateBlastSiteAfter[] = [
  "Наличие на надгърмяване",
  "Наличие на пукнатини - концентрирани",
  "Наличие на пукнатини - по цялата дължина на границата",
  "Нормално",
];

export {
  SMOKE_PRESENCE_OPTIONS,
  SCATTERING_OPTIONS,
  STATE_BLAST_MATERIAL_OPTIONS,
  PRESENCE_NEGABARIT_OPTIONS,
  STATE_BLAST_SITE_AFTER_OPTIONS,
};

