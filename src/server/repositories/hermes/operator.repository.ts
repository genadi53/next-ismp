import { sqlQuery, sqlQueryOne, sqlTransaction } from "@/server/database/db";
import type {
  HermesOperator,
  HermesOperatorNames,
  CreateOperatorInput,
} from "./types.operator";

/**
 * Get all operators from the database.
 */
export async function getAllOperators(): Promise<HermesOperator[]> {
  return sqlQuery<HermesOperator>(`
    SELECT [ID] AS Id
          ,[OperatorId]
          ,[OperatorNamre] AS OperatorName
          ,[Dlazhnost]
          ,[Department]
          ,[Zveno]
          ,[lrd]
    FROM [Hermes].[dbo].[OperatorsEnum]
  `);
}

/**
 * Get a single operator by ID.
 */
export async function getOperatorById(
  id: number,
): Promise<HermesOperator | null> {
  return sqlQueryOne<HermesOperator>(
    `
    SELECT [ID] AS Id
          ,[OperatorId]
          ,[OperatorNamre] AS OperatorName
          ,[Dlazhnost]
          ,[Department]
          ,[Zveno]
          ,[lrd]
    FROM [Hermes].[dbo].[OperatorsEnum]
    WHERE [ID] = @id
  `,
    { id },
  );
}

/**
 * Get operators formatted for dropdown/select lists.
 * Returns: "OperatorId | OperatorName | Dlazhnost"
 */
export async function getOperatorNames(): Promise<HermesOperatorNames[]> {
  return sqlQuery<HermesOperatorNames>(`
    SELECT [ID] AS Id,
           CAST([OperatorId] AS NVARCHAR(10)) + ' | ' + [OperatorNamre] + ' | ' + [Dlazhnost] AS Operator
    FROM [Hermes].[dbo].[OperatorsEnum]
  `);
}

/**
 * Create a new operator.
 */
export async function createOperator(
  input: CreateOperatorInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("OperatorId", input.OperatorId);
    request.input("OperatorName", input.OperatorName);
    request.input("Dlazhnost", input.Dlazhnost);
    request.input("Department", input.Department);
    request.input("Zveno", input.Zveno);

    await request.query(`
      INSERT INTO [Hermes].[dbo].[OperatorsEnum]
        ([OperatorId], [OperatorNamre], [Dlazhnost], [Department], [Zveno])
      VALUES
        (@OperatorId, @OperatorName, @Dlazhnost, @Department, @Zveno)
    `);
  });
}

/**
 * Update an existing operator.
 */
export async function updateOperator(
  id: number,
  input: CreateOperatorInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("OperatorId", input.OperatorId);
    request.input("OperatorName", input.OperatorName);
    request.input("Dlazhnost", input.Dlazhnost);
    request.input("Department", input.Department);
    request.input("Zveno", input.Zveno);

    await request.query(`
      UPDATE [Hermes].[dbo].[OperatorsEnum]
      SET [OperatorId] = @OperatorId,
          [OperatorNamre] = @OperatorName,
          [Dlazhnost] = @Dlazhnost,
          [Department] = @Department,
          [Zveno] = @Zveno,
          [lrd] = GETDATE()
      WHERE [ID] = @id
    `);
  });
}

/**
 * Delete an operator by ID.
 */
export async function deleteOperator(id: number): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    await request.query(`
      DELETE FROM [Hermes].[dbo].[OperatorsEnum]
      WHERE [ID] = @id
    `);
  });
}
