import { LOGS_MAX_FILE_SIZE, LOGS_MAX_ROTATED_FILES } from "@/lib/constants";
import { existsSync, statSync, renameSync, unlinkSync, readdirSync } from "fs";
import { join, dirname } from "path";

/**
 * Rotates a log file if it exceeds the maximum size.
 * Keeps up to MAX_ROTATED_FILES rotated files.
 *
 * @param filePath - Path to the log file to rotate
 */
export function rotateLogFile(filePath: string): void {
  try {
    // Check if file exists and get its size
    if (!existsSync(filePath)) {
      return;
    }

    const stats = statSync(filePath);

    // Only rotate if file exceeds max size
    if (stats.size < LOGS_MAX_FILE_SIZE) {
      return;
    }

    const dir = dirname(filePath);
    const baseName =
      filePath.split("/").pop() ?? filePath.split("\\").pop() ?? "log";

    // Shift existing rotated files
    // Start from the highest number and work backwards
    for (let i = LOGS_MAX_ROTATED_FILES - 1; i >= 1; i--) {
      const currentFile = join(dir, `${baseName}.${i}`);
      const nextFile = join(dir, `${baseName}.${i + 1}`);

      if (existsSync(currentFile)) {
        // If we're at max, delete the oldest
        if (i === LOGS_MAX_ROTATED_FILES - 1) {
          unlinkSync(currentFile);
        } else {
          renameSync(currentFile, nextFile);
        }
      }
    }

    // Rename current log file to .1
    const firstRotatedFile = join(dir, `${baseName}.1`);
    if (existsSync(firstRotatedFile)) {
      // If .1 exists, shift it first
      renameSync(firstRotatedFile, join(dir, `${baseName}.2`));
    }

    renameSync(filePath, firstRotatedFile);
  } catch (error) {
    // Silently fail rotation to avoid breaking the application
    // Log rotation errors would create a circular dependency
    console.error("Failed to rotate log file:", error);
  }
}

/**
 * Cleans up old rotated files beyond the retention limit.
 *
 * @param filePath - Path to the log file
 */
export function cleanupOldLogs(filePath: string): void {
  try {
    const dir = dirname(filePath);
    const baseName =
      filePath.split("/").pop() ?? filePath.split("\\").pop() ?? "log";

    // Get all rotated files
    const files = readdirSync(dir)
      .filter((file) => file.startsWith(`${baseName}.`))
      .map((file) => ({
        name: file,
        path: join(dir, file),
        number: parseInt(file.split(".").pop() ?? "0", 10),
      }))
      .filter((file) => !isNaN(file.number))
      .sort((a, b) => b.number - a.number);

    // Delete files beyond the retention limit
    files.slice(LOGS_MAX_ROTATED_FILES).forEach((file) => {
      try {
        unlinkSync(file.path);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // Silently fail cleanup
      }
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    // Silently fail cleanup
  }
}
