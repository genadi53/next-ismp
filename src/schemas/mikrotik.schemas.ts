import { z } from "zod";

export const routerConfigSchema = z.object({
  ip: z.string().min(1, "IP адресът е задължителен"),
  port: z.string().default("8728"),
  username: z.string().min(1, "Потребителското име е задължително"),
  password: z.string().min(1, "Паролата е задължителна"),
});

export type RouterConfig = z.infer<typeof routerConfigSchema>;

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  macAddress: z.string(),
  ipAddress: z.string(),
  signalStrength: z.number(),
  ccqTx: z.number(),
  ccqRx: z.number(),
  uploadSpeed: z.number(),
  downloadSpeed: z.number(),
  interface: z.string(),
  connected: z.boolean(),
});

export type Client = z.infer<typeof clientSchema>;
