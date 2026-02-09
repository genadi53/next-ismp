import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    // SQL Server connection (MODDB)
    SQL_SERVER_MODDB: z.string().min(1),
    SQL_DATABASE_MODDB: z.string().min(1),
    SQL_USER_MODDB: z.string().min(1),
    SQL_PASSWORD_MODDB: z.string().min(1),
    SQL_PORT_MODDB: z.coerce.number().default(1433),

    // SQL Server connection (MODDB2)
    SQL_SERVER_MODDB2: z.string().min(1).optional(),
    SQL_DATABASE_MODDB2: z.string().min(1).optional(),
    SQL_USER_MODDB2: z.string().min(1).optional(),
    SQL_PASSWORD_MODDB2: z.string().min(1).optional(),
    SQL_PORT_MODDB2: z.coerce.number().default(1433).optional(),
    // MySQL connection
    MYSQL_HOST: z.string().min(1),
    MYSQL_DATABASE: z.string().min(1),
    MYSQL_USER: z.string().min(1),
    MYSQL_PASSWORD: z.string().min(1),
    MYSQL_PORT: z.coerce.number().default(3306),

    // Test mail settings
    TEST_EMAIL_USER: z.string().optional(),
    TEST_EMAIL_PASS: z.string().optional(),
    TEST_EMAIL_TO: z.string().optional(),

    MAIN_EMAIL_USER: z.string().min(1),
    MAIN_EMAIL_PASS: z.string().min(1),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    // SQL Server (MODDB)
    SQL_SERVER_MODDB: process.env.SQL_SERVER_MODDB,
    SQL_DATABASE_MODDB: process.env.SQL_DATABASE_MODDB,
    SQL_USER_MODDB: process.env.SQL_USER_MODDB,
    SQL_PASSWORD_MODDB: process.env.SQL_PASSWORD_MODDB,
    SQL_PORT_MODDB: process.env.SQL_PORT_MODDB,

    // SQL Server (MODDB2)
    SQL_SERVER_MODDB2: process.env.SQL_SERVER_MODDB2,
    SQL_DATABASE_MODDB2: process.env.SQL_DATABASE_MODDB2,
    SQL_USER_MODDB2: process.env.SQL_USER_MODDB2,
    SQL_PASSWORD_MODDB2: process.env.SQL_PASSWORD_MODDB2,
    SQL_PORT_MODDB2: process.env.SQL_PORT_MODDB2,
    // MySQL
    MYSQL_HOST: process.env.MYSQL_HOST,
    MYSQL_DATABASE: process.env.MYSQL_DATABASE,
    MYSQL_USER: process.env.MYSQL_USER,
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
    MYSQL_PORT: process.env.MYSQL_PORT,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,

    TEST_EMAIL_USER: process.env.TEST_EMAIL_USER,
    TEST_EMAIL_PASS: process.env.TEST_EMAIL_PASS,
    TEST_EMAIL_TO: process.env.TEST_EMAIL_TO,

    MAIN_EMAIL_USER: process.env.MAIN_EMAIL_USER,
    MAIN_EMAIL_PASS: process.env.MAIN_EMAIL_PASS,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
