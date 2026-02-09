import { LOGS_MAX_FILE_SIZE, LOGS_MAX_ROTATED_FILES } from "@/lib/constants";
import { join } from "path";

/**
 * Logger configuration constants
 */
export const LOG_CONFIG = {
  // Log file paths (relative to project root)
  INFO_LOG_PATH: join(process.cwd(), "logs", "info.log"),
  ERROR_LOG_PATH: join(process.cwd(), "logs", "error.log"),

  // Rotation settings
  MAX_FILE_SIZE: LOGS_MAX_FILE_SIZE,
  MAX_ROTATED_FILES: LOGS_MAX_ROTATED_FILES,

  // Log levels based on environment
  LOG_LEVEL: process.env.NODE_ENV === "production" ? "info" : "debug",

  // Console output in development
  CONSOLE_ENABLED: process.env.NODE_ENV === "development",
} as const;
