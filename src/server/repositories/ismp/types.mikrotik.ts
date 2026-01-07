import type { RouterConfig } from "@/schemas/mikrotik.schemas";

export type MikrotikRouterConfig = RouterConfig & {
  Id?: number;
  Username: string;
  lrd?: Date;
};

export type MikrotikRouterConfigRow = {
  Id: number;
  Username: string;
  Ip: string;
  Port: string;
  RouterUsername: string;
  Password: string;
  lrd: Date;
};
