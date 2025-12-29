import { createTRPCRouter } from "@/server/api/trpc";
import { roadsRouter } from "./roads";
import { locationsRouter } from "./locations";
import { equipmentRouter } from "./equipment";

export const prestartRouter = createTRPCRouter({
  roads: roadsRouter,
  locations: locationsRouter,
  equipment: equipmentRouter,
});

