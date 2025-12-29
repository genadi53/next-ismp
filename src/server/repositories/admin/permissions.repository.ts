import { sqlQuery, sqlTransaction } from "@/server/database/db";
import type {
  Permission,
  CreatePermissionInput,
  UpdatePermissionInput,
} from "./types.permissions";

/**
 * Get all permissions, optionally filtered by username prefix.
 */
export async function getPermissions(username?: string): Promise<Permission[]> {
  if (username) {
    return sqlQuery<Permission>(
      `
      SELECT *
      FROM [ISMP].[dbo].[Permissions]
      WHERE Username LIKE @username + '%'
      ORDER BY ordermenu
    `,
      { username },
    );
  }

  return sqlQuery<Permission>(`
    SELECT *
    FROM [ISMP].[dbo].[Permissions]
    ORDER BY ordermenu
  `);
}

/**
 * Get permissions for a specific user and main menu.
 */
export async function getPermissionsByUser(
  username: string,
  mainMenu: string,
): Promise<Permission[]> {
  return sqlQuery<Permission>(
    `
    SELECT *
    FROM [ISMP].[dbo].[Permissions]
    WHERE Username = @username 
    --AND main_menu = @mainMenu
    ORDER BY ordermenu
  `,
    { username, mainMenu },
  );
}

/**
 * Get list of distinct usernames with permissions.
 */
export async function getPermissionUsers(): Promise<string[]> {
  const results = await sqlQuery<{ Username: string }>(`
    SELECT DISTINCT Username
    FROM [ISMP].[dbo].[Permissions]
    ORDER BY Username
  `);
  return results.map((r) => r.Username);
}

/**
 * Create multiple permission entries.
 */
export async function createPermissions(
  permissions: CreatePermissionInput[],
): Promise<void> {
  await sqlTransaction(async (request) => {
    for (let i = 0; i < permissions.length; i++) {
      const perm = permissions[i]!;
      const s = `_${i}`;

      request.input(`Username${s}`, perm.Username);
      request.input(`main_menu${s}`, perm.main_menu);
      request.input(`main_menuName${s}`, perm.main_menuName);
      request.input(`submenu${s}`, perm.submenu);
      request.input(`submenuName${s}`, perm.submenuName);
      request.input(`action${s}`, perm.action);
      request.input(`ordermenu${s}`, perm.ordermenu);
      request.input(`specialPermisions${s}`, perm.specialPermisions);
      request.input(`DMAAdmins${s}`, perm.DMAAdmins);
      request.input(`Active${s}`, perm.Active);
      request.input(`IsDispatcher${s}`, perm.IsDispatcher);
      request.input(`Departmant${s}`, perm.Departmant);
      request.input(`ro${s}`, perm.ro);

      await request.query(`
        INSERT INTO [ISMP].[dbo].[Permissions] (
          [Username], [main_menu], [main_menuName], [submenu], [submenuName],
          [action], [ordermenu], [specialPermisions], [DMAAdmins], [Active],
          [IsDispatcher], [Departmant], [ro]
        )
        VALUES (
          @Username${s}, @main_menu${s}, @main_menuName${s}, @submenu${s}, @submenuName${s},
          @action${s}, @ordermenu${s}, @specialPermisions${s}, @DMAAdmins${s}, @Active${s},
          @IsDispatcher${s}, @Departmant${s}, @ro${s}
        )
      `);
    }
  });
}

/**
 * Update an existing permission.
 */
export async function updatePermission(
  id: number,
  input: UpdatePermissionInput,
): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("id", id);
    request.input("Username", input.Username);
    request.input("main_menu", input.main_menu);
    request.input("main_menuName", input.main_menuName);
    request.input("submenu", input.submenu);
    request.input("submenuName", input.submenuName);
    request.input("action", input.action);
    request.input("ordermenu", input.ordermenu);
    request.input("specialPermisions", input.specialPermisions);
    request.input("DMAAdmins", input.DMAAdmins);
    request.input("Active", input.Active);
    request.input("IsDispatcher", input.IsDispatcher);
    request.input("Departmant", input.Departmant);
    request.input("ro", input.ro);

    await request.query(`
      UPDATE [ISMP].[dbo].[Permissions]
      SET [Username] = @Username,
          [main_menu] = @main_menu,
          [main_menuName] = @main_menuName,
          [submenu] = @submenu,
          [submenuName] = @submenuName,
          [action] = @action,
          [ordermenu] = @ordermenu,
          [specialPermisions] = @specialPermisions,
          [DMAAdmins] = @DMAAdmins,
          [Active] = @Active,
          [IsDispatcher] = @IsDispatcher,
          [Departmant] = @Departmant,
          [ro] = @ro
      WHERE ID = @id
    `);
  });
}

/**
 * Deactivate a user's permission.
 */
export async function deactivatePermission(input: {
  Username: string;
  main_menu: string;
  submenu: string | null;
  action: string;
}): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("Username", input.Username);
    request.input("main_menu", input.main_menu);
    request.input("submenu", input.submenu);
    request.input("action", input.action);

    await request.query(`
      UPDATE [ISMP].[dbo].[Permissions]
      SET [Active] = 0
      WHERE [Username] = @Username 
        AND [main_menu] = @main_menu
        AND [submenu] = @submenu
        AND [action] = @action
    `);
  });
}
