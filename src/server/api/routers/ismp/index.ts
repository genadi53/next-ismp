import { createTRPCRouter } from "@/server/api/trpc";
import { logsRouter } from "./logs";
import { checklistRouter } from "./checklist";

export const ismpRouter = createTRPCRouter({
  logs: logsRouter,
  checklist: checklistRouter,
});

