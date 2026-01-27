import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type {
  DmaDepartment,
  CreateDmaDepartmentInput,
  UpdateDmaDepartmentInput,
} from "./types.departments";

/**
 * Get all DMA departments.
 */
export async function getAllDmaDepartments(): Promise<DmaDepartment[]> {
  return sqlQuery<DmaDepartment>(`
    SELECT [Id],
           [Department],
           [DepMol],
           [DepMolDuty],
           [DeptApproval],
           [DeptApprovalDuty],
           [DepartmentDesc],
           [lrd],
           [CreatedFrom],
           [LastUpdatedFrom]
    FROM [ISMP].[dma].[Departments]
  `);
}

/**
 * Create a new DMA department.
 */
export async function createDmaDepartment(
  input: CreateDmaDepartmentInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("Department", input.Department);
    request.input("DepMol", input.DepMol);
    request.input("DepMolDuty", input.DepMolDuty);
    request.input("DeptApproval", input.DeptApproval);
    request.input("DeptApprovalDuty", input.DeptApprovalDuty);
    request.input("CreatedFrom", input.CreatedFrom);
    request.input("DepartmentDesc", input.DepartmentDesc);

    await request.query(`
      INSERT INTO [ISMP].[dma].[Departments] (
        [Department], [DepMol], [DepMolDuty], [DeptApproval],
         [DeptApprovalDuty], [DepartmentDesc], [CreatedFrom]
      )
      VALUES (@Department, @DepMol, @DepMolDuty, @DeptApproval,
       @DeptApprovalDuty, @DepartmentDesc, @CreatedFrom)
    `);
  });
}

/**
 * Update an existing DMA department.
 */
export async function updateDmaDepartment(
  id: number,
  input: UpdateDmaDepartmentInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("Department", input.Department);
    request.input("DepMol", input.DepMol);
    request.input("DepMolDuty", input.DepMolDuty);
    request.input("DeptApproval", input.DeptApproval);
    request.input("DeptApprovalDuty", input.DeptApprovalDuty);
    request.input("DepartmentDesc", input.DepartmentDesc);
    request.input("LastUpdatedFrom", input.LastUpdatedFrom);
    request.input("active", input.active);

    await request.query(`
      UPDATE [ISMP].[dma].[Departments] 
      SET [Department] = @Department,
          [DepMol] = @DepMol,
          [DepMolDuty] = @DepMolDuty,
          [DeptApproval] = @DeptApproval,
          [LastUpdatedFrom] = @LastUpdatedFrom,
          [DepartmentDesc] = @DepartmentDesc,
          [DeptApprovalDuty] = @DeptApprovalDuty,
          [active] = @active
      WHERE Id = @id
    `);  
  });
}

/**
 * Delete DMA department.
 */
export async function deleteDmaDepartment(
  id: number,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    await request.query(`
      DELETE FROM [ISMP].[dma].[Departments] 
      WHERE Id = @id
    `);
  });
}