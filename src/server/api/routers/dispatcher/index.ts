import { createTRPCRouter } from "@/server/api/trpc";
import { mgtlOreRouter } from "./mgtl-ore";
import { repairsRouter } from "./repairs";
import { scheduleRouter } from "./schedule";
import { morningReportRouter } from "./morning-report";

export const dispatcherRouter = createTRPCRouter({
  mgtlOre: mgtlOreRouter,
  repairs: repairsRouter,
  schedule: scheduleRouter,
  morningReport: morningReportRouter,
});

