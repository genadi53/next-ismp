import z from "zod";
import type {
  CreateEquipmentInput,
  CreateOperatorInput,
  CreateZarabotkiInput,
  HermesOperator,
  CreateWorkcardInput,
} from "@/server/repositories/hermes";

export const createEquipmentSchema = z.object({
  DT_smetka: z.number({ required_error: "Въведете сметка" }),
  Obekt: z.string({ required_error: "Невалиден обект" }).min(1),
  DT_Priz1_ceh: z.string({ required_error: "Невалиден отдел" }).min(1),
  DT_Priz2_kod_zveno: z.string({ required_error: "Невалидно звено" }).min(1),
  DT_Priz3_kod_eqmt: z
    .string({ required_error: "Въведете код на оборудване" })
    .min(1),
  EqmtName: z
    .string({ required_error: "Въведете име на оборудване" })
    .min(2, { message: "Името на оборудване е твърде кратко" }),
  EqmtGroupName: z.string({ required_error: "Невалидна група" }).min(1),
  PriceMinnaMasa: z.number().min(0).optional(),
  PriceShists: z.number().min(0).optional(),
  PriceGrano: z.number().min(0).optional(),
  //   Flag_new: z.number().min(0).max(1).optional(),
  //   Flag_brak: z.number().min(0).max(1).optional(),
  DspEqmt: z.string().min(0).optional(),
  Active: z
    .number({ required_error: "Изберете стойност" })
    .min(0)
    .max(1)
    .optional(),
}) satisfies z.ZodType<CreateEquipmentInput>;

export const createOperatorSchema = z.object({
  OperatorId: z.number(),
  OperatorName: z.string().min(1, "Operator name is required"),
  Dlazhnost: z.string(),
  Department: z.string(),
  Zveno: z.string(),
}) satisfies z.ZodType<CreateOperatorInput>;

export const updateOperatorSchema = z.object({
  Id: z.number(),
  OperatorId: z.number(),
  OperatorName: z.string().min(1, "Operator name is required"),
  Dlazhnost: z.string(),
  Department: z.string(),
  Zveno: z.string(),
  lrd: z.date().nullable(),
}) satisfies z.ZodType<HermesOperator>;

export const createWorkcardSchema = z
  .object({
    OperatorId: z.number({ required_error: "Изберете оператор" }).nullable(),
    // OperatorName: z.string({ error: "Изберете оператор" }),
    Date: z.date({ required_error: "Въведете дата" }),
    CodeAction: z
      .number({ required_error: "Въведете код на действие" })
      .nullable(),
    WorkingCardId: z.string().nullable(),
    EqmtId: z.number().nullable(),
    StartTime: z.string({ required_error: "Въведете начален час" }).nullable(),
    EndTime: z.string({ required_error: "Въведете краен час" }).nullable(),
    Note: z.string().nullable(),
  })
  .refine(
    ({ StartTime, EndTime }) => {
      // Compare times
      // Convert times to minutes for comparison

      if (!StartTime || !EndTime) {
        return false;
      }

      const startParts = StartTime.split(":");
      const endParts = EndTime.split(":");

      const startHour = startParts[0];
      const startMin = startParts[1];
      const endHour = endParts[0];
      const endMin = endParts[1];

      if (!startHour || !startMin || !endHour || !endMin) {
        return false;
      }

      const startMinutes = parseInt(startHour) * 60 + parseInt(startMin);
      const endMinutes = parseInt(endHour) * 60 + parseInt(endMin);

      return endMinutes > startMinutes;
    },
    {
      message: "Крайният час трябва да е по-голям от началния час",
      path: ["EndTime"], // This will show the error on the EndTime field
    },
  ) satisfies z.ZodSchema<CreateWorkcardInput>;

// export const createZarabotkiSchema = z.object({
//   Year: z.number(),
//   Month: z.number().min(1).max(12),
//   Department: z.string(),
//   Zveno: z.string(),
//   Machine: z.string(),
//   Indicator: z.string(),
//   Indicator_Quantity: z.number().nullable(),
//   Total_Sum: z.number().nullable(),
// }) satisfies z.ZodType<CreateZarabotkiInput>;

export const createZarabotkiSchema = z.object({
  Година: z.number(),
  Месец: z.number().min(1).max(12),
  Цех: z.string(),
  Звено: z.string(),
  Код_на_машина: z.string(),
  Показател: z.string(),
  Количество_показател: z.number().nullable(),
  Общо_сума: z.number().nullable(),
}) satisfies z.ZodType<CreateZarabotkiInput>;
