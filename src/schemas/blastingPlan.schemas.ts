import { DRILLS_TYPES } from "@/lib/constants";
import { z } from "zod";

// Validation schema
export const blastingPlanSchema = z.object({
  date: z.string().min(1, "Датата е задължителна"),
  BlastingField: z.string().optional(),
  Horiz1: z.string().optional(),
  Horiz2: z.string().optional(),
  Drill: z
    .array(z.enum(DRILLS_TYPES as [string, ...string[]]).or(z.string()))
    .min(1, "Поне една сонда е задължителна"),
  TypeBlast: z.enum(["Контур", "Поле", "Поле-Контур", "Проби"]),
  Holes: z
    .number()
    .min(0, "Броят сондажи не може да бъде отрицателен")
    .optional(),
  Konturi: z
    .number()
    .min(0, "Контурите не могат да бъдат отрицателни")
    .optional(),
  MineVolume: z
    .number()
    .min(0, "Обемът не може да бъде отрицателен")
    .optional(),
  Disabled: z.number().min(0).max(1),
  Note: z.string().optional(),
});

export type BlastingPlanDataType = z.infer<typeof blastingPlanSchema>;
