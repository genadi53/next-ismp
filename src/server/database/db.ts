import sql from "mssql";
import mysql from "mysql2/promise";
import { env } from "@/env";
import { logger } from "@/server/logger";

// =============================================================================
// SQL Server Configuration & Pool
// =============================================================================

/**
 * Type for selecting which SQL Server to use.
 */
export type SqlServer = "moddb" | "moddb2";

// Primary SQL Server configuration
const sqlConfigModdb: sql.config = {
  server: env.SQL_SERVER_MODDB,
  database: env.SQL_DATABASE_MODDB,
  user: env.SQL_USER_MODDB,
  password: env.SQL_PASSWORD_MODDB,
  port: env.SQL_PORT_MODDB,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Secondary SQL Server configuration (optional)
const sqlConfigModdb2: sql.config | null = env.SQL_SERVER_MODDB2
  ? {
      server: env.SQL_SERVER_MODDB2,
      database: env.SQL_DATABASE_MODDB2!,
      user: env.SQL_USER_MODDB2!,
      password: env.SQL_PASSWORD_MODDB2!,
      port: env.SQL_PORT_MODDB2 ?? 1433,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    }
  : null;

// Global pool instances (lazy initialized)
let sqlPoolPrimary: sql.ConnectionPool | null = null;
let sqlPoolSecondary: sql.ConnectionPool | null = null;

/**
 * Get the SQL Server connection pool for the specified server.
 * Creates a new pool if one doesn't exist.
 */
async function getSqlPool(
  server: SqlServer = "moddb2",
): Promise<sql.ConnectionPool> {
  if (server === "moddb") {
    if (!sqlPoolPrimary) {
      sqlPoolPrimary = await new sql.ConnectionPool(sqlConfigModdb).connect();
    }
    return sqlPoolPrimary;
  } else {
    if (!sqlConfigModdb2) {
      throw new Error(
        "Secondary SQL Server is not configured. Please set SQL_SERVER_2, SQL_DATABASE_2, SQL_USER_2, and SQL_PASSWORD_2 environment variables.",
      );
    }
    if (!sqlPoolSecondary) {
      sqlPoolSecondary = await new sql.ConnectionPool(
        sqlConfigModdb2,
      ).connect();
    }
    return sqlPoolSecondary;
  }
}

/**
 * Execute a SQL Server query and return typed results.
 *
 * @example
 * const users = await sqlQuery<User>("SELECT * FROM Users WHERE id = @id", { id: 1 });
 * const usersSecondary = await sqlQuery<User>("SELECT * FROM Users WHERE id = @id", { id: 1 }, "secondary");
 */
export async function sqlQuery<T = Record<string, unknown>>(
  query: string,
  params?: Record<string, unknown>,
  server: SqlServer = "moddb2",
): Promise<T[]> {
  const pool = await getSqlPool(server);
  const request = pool.request();

  // Add parameters if provided
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }

  const result = await request.query<T>(query);
  return result.recordset;
}

/**
 * Execute a SQL Server query and return a single result.
 *
 * @example
 * const user = await sqlQueryOne<User>("SELECT * FROM Users WHERE id = @id", { id: 1 });
 * const userSecondary = await sqlQueryOne<User>("SELECT * FROM Users WHERE id = @id", { id: 1 }, "secondary");
 */
export async function sqlQueryOne<T = Record<string, unknown>>(
  query: string,
  params?: Record<string, unknown>,
  server: SqlServer = "moddb2",
): Promise<T | null> {
  const results = await sqlQuery<T>(query, params, server);
  return results[0] ?? null;
}

/**
 * Execute multiple SQL Server queries within a transaction.
 * Automatically commits on success, rolls back on error.
 *
 * @example
 * await sqlTransaction(async (request) => {
 *   await request.query("INSERT INTO Users (name) VALUES (@name)", { name: "John" });
 *   await request.query("UPDATE Stats SET count = count + 1");
 * });
 * await sqlTransaction(async (request) => {
 *   await request.query("INSERT INTO Users (name) VALUES (@name)", { name: "John" });
 * }, "secondary");
 */
export async function sqlTransaction(
  fn: (request: sql.Request) => Promise<void>,
  server: SqlServer = "moddb2",
): Promise<void> {
  const pool = await getSqlPool(server);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const request = new sql.Request(transaction);
    await fn(request);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// =============================================================================
// MySQL Configuration & Pool
// =============================================================================

// MySQL pool configuration
const mysqlConfig: mysql.PoolOptions = {
  host: env.MYSQL_HOST,
  database: env.MYSQL_DATABASE,
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  port: env.MYSQL_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Global pool instance (lazy initialized)
let mysqlPool: mysql.Pool | null = null;

/**
 * Get the MySQL connection pool.
 * Creates a new pool if one doesn't exist.
 */
function getMysqlPool(): mysql.Pool {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool(mysqlConfig);
  }
  return mysqlPool;
}

/**
 * Execute a MySQL query and return typed results.
 *
 * @example
 * const users = await mysqlQuery<User>("SELECT * FROM users WHERE id = ?", [1]);
 */
export async function mysqlQuery<T = Record<string, unknown>>(
  query: string,
  params?: unknown[],
): Promise<T[]> {
  const pool = getMysqlPool();
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(query, params);
  return rows as T[];
}

/**
 * Execute a MySQL query and return a single result.
 *
 * @example
 * const user = await mysqlQueryOne<User>("SELECT * FROM users WHERE id = ?", [1]);
 */
export async function mysqlQueryOne<T = Record<string, unknown>>(
  query: string,
  params?: unknown[],
): Promise<T | null> {
  const results = await mysqlQuery<T>(query, params);
  return results[0] ?? null;
}

/**
 * Execute multiple MySQL queries within a transaction.
 * Automatically commits on success, rolls back on error.
 *
 * @example
 * await mysqlTransaction(async (connection) => {
 *   await connection.execute("INSERT INTO users (name) VALUES (?)", ["John"]);
 *   await connection.execute("UPDATE stats SET count = count + 1");
 * });
 */
export async function mysqlTransaction(
  fn: (connection: mysql.PoolConnection) => Promise<void>,
): Promise<void> {
  const pool = getMysqlPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await fn(connection);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    try {
      connection.release();
    } catch (error) {
      logger.error("[Database] Error releasing MySQL connection", error);
    }
  }
}

// =============================================================================
// Cleanup (for graceful shutdown)
// =============================================================================

/**
 * Close all database connections.
 * Call this during application shutdown.
 */
export async function closeConnections(): Promise<void> {
  if (sqlPoolPrimary) {
    try {
      await sqlPoolPrimary.close();
      sqlPoolPrimary = null;
    } catch (error) {
      logger.error(
        "[Database] Error closing primary SQL Server connection pool",
        error,
      );
      sqlPoolPrimary = null;
    }
  }
  if (sqlPoolSecondary) {
    try {
      await sqlPoolSecondary.close();
      sqlPoolSecondary = null;
    } catch (error) {
      logger.error(
        "[Database] Error closing secondary SQL Server connection pool",
        error,
      );
      sqlPoolSecondary = null;
    }
  }
  if (mysqlPool) {
    try {
      await mysqlPool.end();
      mysqlPool = null;
    } catch (error) {
      logger.error("[Database] Error closing MySQL connection pool", error);
      mysqlPool = null;
    }
  }
}
