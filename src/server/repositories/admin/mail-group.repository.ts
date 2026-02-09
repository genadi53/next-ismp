import { sqlQuery, sqlQueryOne, sqlTransaction } from "@/server/database/db";
import type {
  MailGroup,
  CreateMailGroupInput,
  UpdateMailGroupInput,
} from "./types.mail-group";

/**
 * Get all mail groups.
 */
export async function getMailGroups(): Promise<MailGroup[]> {
  return sqlQuery<MailGroup>(`
    SELECT *
    FROM [ISMP].[ismp].[MailGroups]
  `);
}

/**
 * Get all mail groups.
 */
export async function getMailGroupsByName(
  name: string,
): Promise<MailGroup | null> {
  return sqlQueryOne<MailGroup>(
    `
    SELECT TOP 1 *
    FROM [ISMP].[ismp].[MailGroups]
    WHERE mail_group_name = @name
  `,
    { name },
  );
}

/**
 * Get list of mail group names.
 */
export async function getMailGroupNames(): Promise<string[]> {
  const results = await sqlQuery<{ mail_group_name: string }>(`
    SELECT [mail_group_name]
    FROM [ISMP].[ismp].[MailGroups]
  `);
  return results.map((r) => r.mail_group_name);
}

/**
 * Create a new mail group.
 */
export async function createMailGroup(
  input: CreateMailGroupInput,
): Promise<void> {
  if (!input.mail_group_name) {
    throw new Error("Mail group name is required");
  }

  await sqlTransaction(async (request) => {
    request.input("module", input.module);
    request.input("action", input.action);
    request.input("mail_group_name", input.mail_group_name);
    request.input("mail_group", input.mail_group);

    await request.query(`
      INSERT INTO [ISMP].[ismp].[MailGroups] (
        [module], [action], [mail_group_name], [mail_group]
      )
      VALUES (@module, @action, @mail_group_name, @mail_group)
    `);
  });
}

/**
 * Update an existing mail group.
 */
export async function updateMailGroup(
  id: number,
  input: UpdateMailGroupInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("module", input.module);
    request.input("action", input.action);
    request.input("mail_group_name", input.mail_group_name);
    request.input("mail_group", input.mail_group);

    await request.query(`
      UPDATE [ISMP].[ismp].[MailGroups]
      SET [module] = @module,
          [action] = @action,
          [mail_group_name] = @mail_group_name,
          [mail_group] = @mail_group
      WHERE id = @id
    `);
  });
}

/**
 * Delete a mail group.
 */
export async function deleteMailGroup(id: number): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    await request.query(`
      DELETE FROM [ISMP].[ismp].[MailGroups]
      WHERE id = @id
    `);
  });
}
