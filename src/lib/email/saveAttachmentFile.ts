import { promises as fs } from "fs";
import path from "path";

/**
 * Save string content as an HTML file in the root-level `attachments` folder.
 * Returns the absolute filesystem path to the saved file.
 */
export const saveAttachmentFile = async (
  content: string,
  prefix: string,
): Promise<string> => {
  const attachmentsDir = path.join(process.cwd(), "attachments");
  await fs.mkdir(attachmentsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileNameOnDisk = `${prefix}-${timestamp}.html`;
  const filePath = path.join(attachmentsDir, fileNameOnDisk);

  await fs.writeFile(filePath, content, "utf8");
  return filePath;
};

