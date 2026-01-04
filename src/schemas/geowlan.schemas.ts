import { z } from "zod";

export const geowlanAPFormSchema = z.object({
  name: z
    .string({ message: "Въведете име" })
    .min(1, { message: "Името е задължително" }),
  x: z.number({ message: "Въведете X координата" }).optional(),
  y: z.number({ message: "Въведете Y координата" }).optional(),
  enabled: z.boolean(),
  lat: z.number({ message: "Въведете ширина" }).optional(),
  lng: z.number({ message: "Въведете дължина" }).optional(),
  mac: z.string().optional().or(z.literal("")),
  rgb: z.string().optional().or(z.literal("")),
  ip: z.string().optional().or(z.literal("")),
  hardware: z.string().optional().or(z.literal("")),
  LAN: z.string().optional().or(z.literal("")),
});

export const geowlanMastUpdateFormSchema = z.object({
  name: z
    .string({ message: "Въведете име" })
    .min(1, { message: "Името е задължително" }),
  x: z.number({ message: "Въведете X координата" }).optional(),
  y: z.number({ message: "Въведете Y координата" }).optional(),
  enabled: z.boolean(),
  lat: z.number({ message: "Въведете ширина" }).optional(),
  lng: z.number({ message: "Въведете дължина" }).optional(),
});

export type GeowlanAPFormData = z.infer<typeof geowlanAPFormSchema>;
export type GeowlanMastFormData = z.infer<typeof geowlanMastUpdateFormSchema>;

