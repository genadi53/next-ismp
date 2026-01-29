import { sqlQueryOne, sqlTransaction } from "@/server/database/db";
import type { RouterConfig } from "@/schemas/mikrotik.schemas";
import type {
  MikrotikRouterConfig,
  MikrotikRouterConfigRow,
} from "./types.mikrotik";

/**
 * Get router configuration for a specific user.
 * Returns null if no configuration exists.
 * Password is masked with "••••••••" for security.
 */
export async function getRouterConfig(
  username: string,
): Promise<RouterConfig | null> {
  const config = await sqlQueryOne<MikrotikRouterConfigRow>(
    `
    SELECT [Id],
           [Username],
           [Ip],
           [Port],
           [RouterUsername],
           [Password],
           [lrd]
    FROM [ISMP].[dbo].[MikrotikRouterConfig]
    WHERE [Username] = @username
  `,
    { username },
  );

  if (!config) {
    return null;
  }

  return {
    ip: config.Ip,
    port: config.Port,
    username: config.RouterUsername,
    password: "••••••••", // Mask password for security
  };
}

/**
 * Get router configuration with actual password for connection.
 * This should only be used internally by the service layer.
 */
export async function getRouterConfigWithPassword(
  username: string,
): Promise<MikrotikRouterConfig | null> {
  const config = await sqlQueryOne<MikrotikRouterConfigRow>(
    `
    SELECT [Id],
           [Username],
           [Ip],
           [Port],
           [RouterUsername],
           [Password],
           [lrd]
    FROM [ISMP].[dbo].[MikrotikRouterConfig]
    WHERE [Username] = @username
  `,
    { username },
  );

  if (!config) {
    return null;
  }

  return {
    ip: config.Ip,
    port: config.Port,
    username: config.RouterUsername,
    password: config.Password,
    Username: config.Username,
    Id: config.Id,
    lrd: config.lrd,
  };
}

/**
 * Save or update router configuration for a user.
 * If password is "••••••••", it will use the existing password from the database.
 */
export async function setRouterConfig(
  username: string,
  config: RouterConfig,
): Promise<void> {
  // Check if config already exists (outside transaction for read)
  const existing = await sqlQueryOne<MikrotikRouterConfigRow>(
    `
    SELECT [Id], [Password]
    FROM [ISMP].[dbo].[MikrotikRouterConfig]
    WHERE [Username] = @username
  `,
    { username },
  );

  let passwordToStore = config.password;

  // If password is masked, use existing password
  if (config.password === "••••••••" && existing) {
    passwordToStore = existing.Password;
  }

  await sqlTransaction(async (request) => {
    if (existing) {
      // Update existing config
      request.input("username", username);
      request.input("ip", config.ip);
      request.input("port", config.port);
      request.input("routerUsername", config.username);
      request.input("password", passwordToStore);

      await request.query(`
        UPDATE [ISMP].[dbo].[MikrotikRouterConfig]
        SET [Ip] = @ip,
            [Port] = @port,
            [RouterUsername] = @routerUsername,
            [Password] = @password,
            [lrd] = GETDATE()
        WHERE [Username] = @username
      `);
    } else {
      // Insert new config
      request.input("username", username);
      request.input("ip", config.ip);
      request.input("port", config.port);
      request.input("routerUsername", config.username);
      request.input("password", passwordToStore);

      await request.query(`
        INSERT INTO [ISMP].[dbo].[MikrotikRouterConfig] (
          [Username], [Ip], [Port], [RouterUsername], [Password]
        )
        VALUES (@username, @ip, @port, @routerUsername, @password)
      `);
    }
  });
}

/**
 * Delete router configuration for a user.
 */
export async function deleteRouterConfig(username: string): Promise<void> {
  await sqlTransaction(async (request) => {
    request.input("username", username);
    await request.query(`
      DELETE FROM [ISMP].[dbo].[MikrotikRouterConfig]
      WHERE [Username] = @username
    `);
  });
}
