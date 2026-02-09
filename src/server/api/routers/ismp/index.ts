import { createTRPCRouter } from "@/server/api/trpc";
import { logsRouter } from "./logs";
import { checklistRouter } from "./checklist";
import { mikrotikRouter } from "./mikrotik";

export const ismpRouter = createTRPCRouter({
  logs: logsRouter,
  checklist: checklistRouter,
  mikrotik: mikrotikRouter,
});
