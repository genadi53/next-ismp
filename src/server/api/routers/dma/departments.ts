import { z } from "zod";
import { nameInput } from "@/lib/username";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getAllDmaDepartments,
  createDmaDepartment,
  updateDmaDepartment,
  deleteDmaDepartment,
} from "@/server/repositories/dma/departments.repository";

const createDepartmentSchema = z.object({
  Department: z.string(),
  DepMol: z.string().nullable(),
  DepMolDuty: z.string().nullable(),
  DeptApproval: z.string().nullable(),
  DeptApprovalDuty: z.string().nullable(),
  DepartmentDesc: z.string().nullable(),
});

const updateDepartmentSchema = createDepartmentSchema.extend({
  active: z.boolean().nullable().default(null),
});

export const departmentsRouter = createTRPCRouter({
  /**
   * Get all DMA departments.
   */
  getAll: protectedProcedure.query(async () => {
    return getAllDmaDepartments();
  }),

  /**
   * Create a new DMA department.
   */
  create: protectedProcedure
    .input(createDepartmentSchema)
    .mutation(async ({ input, ctx }) => {
      await createDmaDepartment({
        ...input,
        CreatedFrom: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Department created successfully" };
    }),

  /**
   * Update an existing DMA department.
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: updateDepartmentSchema }))
    .mutation(async ({ input, ctx }) => {
      await updateDmaDepartment(input.id, {
        ...input.data,
        LastUpdatedFrom: nameInput(ctx.user.username, ctx.user.nameBg),
      });
      return { success: true, message: "Department updated successfully" };
    }),

  /**
   * Delete a DMA department.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteDmaDepartment(input.id);
      return { success: true, message: "Department deleted successfully" };
    }),
});
