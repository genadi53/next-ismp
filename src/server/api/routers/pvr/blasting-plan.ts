import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getBlastingPlans,
  createBlastingPlan,
  updateBlastingPlan,
  deleteBlastingPlan,
} from "@/server/repositories/pvr/blasting-plan.repository";
import { nameInput } from "@/lib/username";

const createBlastingPlanSchema = z.object({
  OperDate: z.string(),
  BlastingField: z.string().nullable(),
  Horizont1: z.string().nullable(),
  Horizont2: z.string().nullable(),
  Drill: z.string().nullable(),
  Drill2: z.string().nullable(),
  TypeBlast: z.string().nullable(),
  Holes: z.number().nullable(),
  Konturi: z.number().nullable(),
  MineVolume: z.number().nullable(),
  Disabled: z.boolean().nullable(),
  Note: z.string().nullable(),
});

const updateBlastingPlanSchema = createBlastingPlanSchema;

export const blastingPlanRouter = createTRPCRouter({
  /**
   * Get all blasting plans from the last 2 months.
   */
  getAll: protectedProcedure.query(async () => {
    return getBlastingPlans();
  }),

  /**
   * Create a new blasting plan.
   */
  create: protectedProcedure
    .input(createBlastingPlanSchema)
    .mutation(async ({ input, ctx }) => {
      await createBlastingPlan({
        ...input,
        userAdded: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Blasting plan created successfully" };
    }),

  /**
   * Update an existing blasting plan.
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: updateBlastingPlanSchema }))
    .mutation(async ({ input, ctx }) => {
      await updateBlastingPlan(input.id, {
        ...input.data,
        userAdded: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Blasting plan updated successfully" };
    }),

  /**
   * Delete a blasting plan.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteBlastingPlan(input.id);
      return { success: true, message: "Blasting plan deleted successfully" };
    }),
});
