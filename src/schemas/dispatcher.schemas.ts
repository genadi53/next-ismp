import { z } from "zod";

export const createPrestartCheckSchema = z.object({
  Dispatcher: z.string(),
  Shift: z.number(),
});

export const completePrestartCheckSchema = z.object({
  EndDispatcher: z.string(),
});

export const mgtlOreFormSchema = z.object({
  OperDate: z.date({ required_error: "Моля, изберете дата" }),
  sclad1: z.string().optional(),
  MGTL1: z.string().optional(),
  sclad2: z.string().optional(),
  MGTL2: z.string().optional(),
  sclad3: z.string().optional(),
  MGTL3: z.string().optional(),
});

export type MgtlOreFormData = z.infer<typeof mgtlOreFormSchema>;
