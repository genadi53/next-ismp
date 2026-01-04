import z from "zod";
import type {
  CreateEquipmentInput,
  CreateOperatorInput,
  CreateZarabotkiInput,
  HermesOperator,
} from "@/server/repositories/hermes";

export const createEquipmentSchema = z.object({
  DT_smetka: z.number(),
  Obekt: z.string(),
  DT_Priz1_ceh: z.string(),
  DT_Priz2_kod_zveno: z.string(),
  DT_Priz3_kod_eqmt: z.string(),
  EqmtName: z.string().min(1, "Equipment name is required"),
  EqmtGroupName: z.string(),
  PriceMinnaMasa: z.number().nullable(),
  PriceShists: z.number().nullable(),
  PriceGrano: z.number().nullable(),
  DspEqmt: z.string().nullable(),
  Active: z.boolean().nullable(),
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
    WorkingCardId: z.number().nullable(),
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
  );

export const createZarabotkiSchema = z.object({
  Year: z.number(),
  Month: z.number().min(1).max(12),
  Department: z.string(),
  Zveno: z.string(),
  Machine: z.string(),
  Indicator: z.string(),
  Indicator_Quantity: z.number().nullable(),
  Total_Sum: z.number().nullable(),
}) satisfies z.ZodType<CreateZarabotkiInput>;
