import z from "zod";
import type {
  CreateEquipmentInput,
  CreateOperatorInput,
  CreateWorkcardInput,
  CreateZarabotkiInput,
  HermesOperator,
} from "@/types/hermes";

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

export const createWorkcardSchema = z.object({
  Date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  StartTime: z.string().nullable(),
  EndTime: z.string().nullable(),
  OperatorId: z.number().nullable(),
  CodeAction: z.number().nullable(),
  Note: z.string().nullable(),
  WorkingCardId: z.number().nullable(),
  EqmtId: z.number().nullable(),
}) satisfies z.ZodType<CreateWorkcardInput>;

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
