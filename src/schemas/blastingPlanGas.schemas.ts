import { z } from "zod";

export const planGasSchema = z.object({
  MeasuredFrom: z.string().min(1, "Името на замерващия е задължително"),
  MeasuredDuty: z.string(),
  MeasuredDateOn: z.date({ required_error: "Датата е задължителна" }),
  MeasuredTimeOn: z.string(),
  Horizont: z.string().min(1, "Хоризонтът трябва да е положително число"),
  measurements: z
    .object({
      GasID: z.number(),
      gasName: z.string(),
      gasType: z.string(),
      GasValue: z.number().nonnegative(),
      Dimension: z.string(),
    })
    .array()
    .length(6),
});

export const gasSchema = z.object({
  GasID: z.number().nonnegative(),
  gasName: z.string(),
  gasType: z.string(),
  Dimension: z.string(),
});

export type GAS = z.infer<typeof gasSchema>;
export type PlanGasDataType = z.infer<typeof planGasSchema>;

export const PLAN_GASES: GAS[] = [
  {
    GasID: 1,
    gasName: "Кислород",
    gasType: "O2",
    Dimension: "%",
  },
  {
    GasID: 2,
    gasName: "Въглероден диоксид",
    gasType: "CO2",
    Dimension: "%",
  },
  {
    GasID: 3,
    gasName: "Азотен моноксид",
    gasType: "NO",
    Dimension: "ppm",
  },
  {
    GasID: 4,
    gasName: "Азотен диоксид",
    gasType: "NO2",
    Dimension: "ppm",
  },
  {
    GasID: 5,
    gasName: "Въглероден моноксид",
    gasType: "CO",
    Dimension: "ppm",
  },
  {
    GasID: 6,
    gasName: "Серен диоксид",
    gasType: "SO2",
    Dimension: "ppm",
  },
];

