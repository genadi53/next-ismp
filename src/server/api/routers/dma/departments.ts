import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getAllDmaDepartments,
  createDmaDepartment,
  updateDmaDepartment,
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
  getAll: publicProcedure.query(async () => {
    return getAllDmaDepartments();
  }),

  /**
   * Create a new DMA department.
   */
  create: publicProcedure
    .input(createDepartmentSchema)
    .mutation(async ({ input }) => {
      await createDmaDepartment(input);
      return { success: true, message: "Department created successfully" };
    }),

  /**
   * Update an existing DMA department.
   */
  update: publicProcedure
    .input(z.object({ id: z.number(), data: updateDepartmentSchema }))
    .mutation(async ({ input }) => {
      await updateDmaDepartment(input.id, input.data);
      return { success: true, message: "Department updated successfully" };
    }),
});

