import sql from "mssql";
import mysql from "mysql2/promise";
import { env } from "@/env";

// =============================================================================
// SQL Server Configuration & Pool
// =============================================================================

const sqlConfig: sql.config = {
  server: env.SQL_SERVER,
  database: env.SQL_DATABASE,
  user: env.SQL_USER,
  password: env.SQL_PASSWORD,
  port: env.SQL_PORT,
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

// Global pool instance (lazy initialized)
let sqlPool: sql.ConnectionPool | null = null;

/**
 * Get the SQL Server connection pool.
 * Creates a new pool if one doesn't exist.
 */
async function getSqlPool(): Promise<sql.ConnectionPool> {
  if (!sqlPool) {
    sqlPool = await new sql.ConnectionPool(sqlConfig).connect();
  }
  return sqlPool;
}

/**
 * Execute a SQL Server query and return typed results.
 *
 * @example
 * const users = await sqlQuery<User>("SELECT * FROM Users WHERE id = @id", { id: 1 });
 */
export async function sqlQuery<T = Record<string, unknown>>(
  query: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const pool = await getSqlPool();
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
 */
export async function sqlQueryOne<T = Record<string, unknown>>(
  query: string,
  params?: Record<string, unknown>
): Promise<T | null> {
  const results = await sqlQuery<T>(query, params);
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
 */
export async function sqlTransaction(
  fn: (request: sql.Request) => Promise<void>
): Promise<void> {
  const pool = await getSqlPool();
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
  params?: unknown[]
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
  params?: unknown[]
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
  fn: (connection: mysql.PoolConnection) => Promise<void>
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
    connection.release();
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
  if (sqlPool) {
    await sqlPool.close();
    sqlPool = null;
  }
  if (mysqlPool) {
    await mysqlPool.end();
    mysqlPool = null;
  }
}

