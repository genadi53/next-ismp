import { createTRPCRouter } from "@/server/api/trpc";
import { documentsRouter } from "./documents";
import { suppliersRouter } from "./suppliers";
import { departmentsRouter } from "./departments";
import { assetsRouter } from "./assets";

export const dmaRouter = createTRPCRouter({
  documents: documentsRouter,
  suppliers: suppliersRouter,
  departments: departmentsRouter,
  assets: assetsRouter,
});

