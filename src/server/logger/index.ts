import winston from "winston";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { LOG_CONFIG } from "./config";
import { rotateLogFile } from "./rotation";

// Ensure logs directory exists
const logsDir = dirname(LOG_CONFIG.INFO_LOG_PATH);
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

// Custom format for JSON logging
const jsonFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Custom format for console (development only)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    const metaString = Object.keys(metadata).length
      ? JSON.stringify(metadata, null, 2)
      : "";
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  }),
);

// Custom file transport that handles rotation
class RotatingFileTransport extends winston.transports.File {
  constructor(options: winston.transports.FileTransportOptions) {
    super(options);
  }

  log(info: winston.LogEntry, callback: () => void): void {
    // Check and rotate before writing
    if (this.filename) {
      rotateLogFile(this.filename);
    }

    if (super.log) {
      super.log(info, callback);
    }
  }
}

// Create transports
const transports: winston.transport[] = [
  // Info log file (info, debug, warn)
  new RotatingFileTransport({
    filename: LOG_CONFIG.INFO_LOG_PATH,
    level: "debug",
    format: jsonFormat,
    maxsize: LOG_CONFIG.MAX_FILE_SIZE,
  }),

  // Error log file (errors only)
  new RotatingFileTransport({
    filename: LOG_CONFIG.ERROR_LOG_PATH,
    level: "error",
    format: jsonFormat,
    maxsize: LOG_CONFIG.MAX_FILE_SIZE,
  }),
];

// Add console transport in development
if (LOG_CONFIG.CONSOLE_ENABLED) {
  transports.push(
    new winston.transports.Console({
      level: LOG_CONFIG.LOG_LEVEL,
      format: consoleFormat,
    }),
  );
}

// Create and configure the logger
export const logger = winston.createLogger({
  level: LOG_CONFIG.LOG_LEVEL,
  format: jsonFormat,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Export logger instance
export default logger;
