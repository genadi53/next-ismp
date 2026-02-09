/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
// XLSX library has loose typing that would require extensive refactoring to fix properly
import type {
  ProcessedShovelDataArray,
  ExcelOperationalData,
  ExcelShovelData,
  RawExcelData,
  NaturalIndicatorsPlanExcelData,
  GRProjectPlanExcelData,
} from "@/server/repositories/mine-planning";
import { format } from "date-fns";
import * as XLSX from "xlsx";

/**
 * Processes Excel files containing monthly shovel plans
 *
 * This function reads an Excel file and processes it to create daily shovel plans
 * for each day of the specified month. It can either use a user-provided date
 * or extract the date from the Excel file itself.
 *
 * @param file - The Excel file to process
 * @param yearMonth - Optional Date object specifying year/month. If provided, overrides Excel date
 * @returns Promise<ProcessedShovelDataArray> - Array of processed shovel data with daily breakdown
 */
export const processExcelMonthPlanShovels = (
  file: File,
  yearMonth?: Date,
): Promise<ProcessedShovelDataArray> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first sheet from the workbook
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error("No sheet name found in the file"));
          return;
        }
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          reject(new Error("No worksheet found in the file"));
          return;
        }

        // Find the data range by scanning all cells
        // This determines the boundaries of the actual data in the Excel sheet
        let minRow = Infinity;
        let maxRow = -1;
        let minCol = Infinity;
        let maxCol = -1;

        for (const cellAddress in worksheet) {
          // Skip metadata properties (they start with '!')
          if (cellAddress.startsWith("!")) continue;

          const { r, c } = XLSX.utils.decode_cell(cellAddress);
          minRow = Math.min(minRow, r);
          maxRow = Math.max(maxRow, r);
          minCol = Math.min(minCol, c);
          maxCol = Math.max(maxCol, c);
        }

        // Extract column headers from the first row
        const headers: string[] = [];
        for (let col = minCol; col <= maxCol; col++) {
          const cell = XLSX.utils.encode_cell({ r: minRow, c: col });
          headers.push(worksheet[cell]?.v ?? `Column_${col}`);
        }

        // Extract data rows (skip the header row)
        const planShovels: ExcelShovelData[] = [];
        for (let row = minRow + 1; row <= maxRow; row++) {
          const rowData: RawExcelData = {};
          for (let col = minCol; col <= maxCol; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const header = headers[col - minCol];
            const value = worksheet[cellAddress]?.v ?? null;
            if (header && value !== undefined) {
              rowData[header] = value;
            }
          }
          planShovels.push(rowData as ExcelShovelData);
        }

        // Filter out rows that don't have valid horizont data
        // This removes empty or invalid rows from the dataset
        const filteredPlan = planShovels.filter(
          (el) => el["Хоризонт"] !== null,
        );

        if (filteredPlan.length === 0) {
          throw new Error("No valid data found in the Excel file");
        }

        // Determine the year and month for processing
        // If yearMonth is provided, use it; otherwise extract from Excel data
        const firstPlanDate = filteredPlan[0]?.["Дата"];
        const [year, month] = yearMonth
          ? [yearMonth.getFullYear(), yearMonth.getMonth() + 1]
          : typeof firstPlanDate === "string"
            ? firstPlanDate.split("-")
            : [new Date().getFullYear(), new Date().getMonth() + 1];
        const maxDays = new Date(Number(year), Number(month), 0).getDate();

        // Create daily breakdown for each shovel plan
        // This expands monthly totals into daily increments
        const finalPlan = filteredPlan.map((row) => {
          const daysPlan = [];
          for (let i = 1; i <= maxDays; i++) {
            daysPlan.push({
              ...row,
              Дата: new Date(Number(year), Number(month) - 1, i),
              // Distribute the monthly plan across all days proportionally
              План: (((row["План"] ?? 0) * 1000) / maxDays) * i,
            });
          }
          return daysPlan;
        });

        // Return the flatten the array
        resolve(finalPlan.flat());
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Processes Excel files containing monthly operational plans
 *
 * This function reads an Excel file with operational data and processes it to create
 * structured operational plans. It handles multi-row headers and can either use
 * a user-provided date or extract dates from the Excel file.
 *
 * @param file - The Excel file to process
 * @param yearMonth - Optional Date object specifying year/month. If provided, overrides Excel date
 * @returns Promise<ExcelOperationalData[]> - Array of processed operational data
 */
export const processExcelMonthPlanOperativen = (
  file: File,
  yearMonth?: Date,
): Promise<ExcelOperationalData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first sheet from the workbook
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error("No sheet name found in the file"));
          return;
        }
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          reject(new Error("No worksheet found in the file"));
          return;
        }

        // Find the data range by scanning all cells
        let minRow = Infinity;
        let maxRow = -1;
        let minCol = Infinity;
        let maxCol = -1;

        for (const cellAddress in worksheet) {
          // Skip metadata properties (they start with '!')
          if (cellAddress.startsWith("!")) continue;

          const { r, c } = XLSX.utils.decode_cell(cellAddress);
          minRow = Math.min(minRow, r);
          maxRow = Math.max(maxRow, r);
          minCol = Math.min(minCol, c);
          maxCol = Math.max(maxCol, c);
        }

        // Handle multi-row headers (common in operational Excel files)
        // Combine two header rows: row 0 and row 1
        // First header row - Руда за преработка, Second header row - vol, mass, Cu%, tons metal
        const headerRow1 = minRow;
        const headerRow2 = minRow + 1;

        // Track the last top-level header for grouping
        let lastTopHeader = "";
        const headers: string[] = [];

        for (let col = minCol; col <= maxCol; col++) {
          const cell1 =
            worksheet[XLSX.utils.encode_cell({ r: headerRow1, c: col })];
          const cell2 =
            worksheet[XLSX.utils.encode_cell({ r: headerRow2, c: col })];

          const topHeaderValue = cell1?.v;
          const subHeaderValue = cell2?.v;
          const topHeader =
            typeof topHeaderValue === "string"
              ? topHeaderValue.trim()
              : typeof topHeaderValue === "number"
                ? topHeaderValue.toString().trim()
                : "";
          const subHeader =
            typeof subHeaderValue === "string"
              ? subHeaderValue.trim()
              : typeof subHeaderValue === "number"
                ? subHeaderValue.toString().trim()
                : `Column_${col}`;

          // If we have a top-level header, remember it for grouping
          if (topHeader) {
            lastTopHeader = topHeader;
          }

          // Combine multi-row headers into a single descriptive header
          // Format: " Руда за преработка - Cu%" or just the Sub Header if no top header
          const fullHeader = lastTopHeader
            ? `${lastTopHeader} - ${subHeader}`
            : subHeader;

          headers.push(fullHeader);
        }

        // Extract data rows (skip the two header rows)
        const operativenPlan: RawExcelData[] = [];
        for (let row = minRow + 2; row <= maxRow; row++) {
          const rowData: RawExcelData = {};
          for (let col = minCol; col <= maxCol; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const header = headers[col - minCol];
            const value = worksheet[cellAddress]?.v ?? null;
            if (header && value !== undefined) {
              rowData[header] = value;
            }
          }
          operativenPlan.push(rowData);
        }

        // Process and format the operational data
        // Convert Excel serial dates and handle numeric formatting
        const formattedOperativenPlan: ExcelOperationalData[] =
          operativenPlan.map((row) => {
            let dateStr: string | null = null;

            // Handle date processing based on whether user provided yearMonth
            if (yearMonth) {
              // Use user-provided year/month but keep day from Excel
              const serialDate = row["Дата"] ?? null;
              if (typeof serialDate === "number") {
                // Convert Excel serial date to day number, then create new date
                const dateObj = XLSX.SSF.parse_date_code(serialDate);
                if (dateObj) {
                  const jsDate = new Date(
                    yearMonth.getFullYear(),
                    yearMonth.getMonth(),
                    dateObj.d,
                  );
                  dateStr = format(jsDate, "yyyy-LL-dd");
                }
              } else if (typeof serialDate === "string") {
                // Extract day number from string and create new date
                const dayMatch = /\d+/.exec(serialDate);
                if (dayMatch?.[0]) {
                  const day = parseInt(dayMatch[0]);
                  const jsDate = new Date(
                    yearMonth.getFullYear(),
                    yearMonth.getMonth(),
                    day,
                  );
                  dateStr = format(jsDate, "yyyy-LL-dd");
                } else {
                  dateStr = serialDate.trim();
                }
              }
            } else {
              // Use the date directly from Excel file
              const serialDate = row["Дата"] ?? null;
              if (typeof serialDate === "number") {
                // Convert Excel serial date to JavaScript Date
                const dateObj = XLSX.SSF.parse_date_code(serialDate);
                if (dateObj) {
                  const jsDate = new Date(dateObj.y, dateObj.m - 1, dateObj.d);
                  dateStr = format(jsDate, "yyyy-LL-dd");
                }
              } else if (typeof serialDate === "string") {
                dateStr = serialDate.trim();
              }
            }

            // Process numeric values and apply rounding rules
            const roundedRow: ExcelOperationalData = {} as ExcelOperationalData;
            for (const key in row) {
              if (key === "Дата") continue;
              let value: unknown = row[key];
              // Convert string numbers to actual numbers
              if (typeof value === "string") {
                const parsed = parseFloat(value.replace(",", "."));
                if (!isNaN(parsed)) {
                  value = parsed;
                }
              }
              // Apply appropriate rounding based on field type
              if (typeof value === "number") {
                if (key.includes("Cu%")) {
                  // Copper percentage fields: round to 3 decimal places
                  (roundedRow as Record<string, unknown>)[key] = Number(
                    value.toFixed(3),
                  );
                } else {
                  // Other numeric fields: round to nearest integer
                  (roundedRow as Record<string, unknown>)[key] =
                    Math.round(value);
                }
              } else {
                // Non-numeric values: keep as-is
                (roundedRow as Record<string, unknown>)[key] = value;
              }
            }
            roundedRow["Дата"] = dateStr;
            return roundedRow;
          });

        // Filter out rows that don't have valid ID data
        const filteredOperativenPlan = formattedOperativenPlan.filter(
          (el) => el.id !== null,
        );
        resolve(filteredOperativenPlan);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Processes Excel files containing monthly GR Project plans
 *
 * This function reads an Excel file with GR Project data and processes it to create
 * structured GR Project plans. It uses the same structure as Natural Indicators
 * but with a different plan type identifier.
 *
 * @param file - The Excel file to process
 * @returns Promise<GRProjectPlanExcelData[]> - Array of processed GR Project data
 */
export const processExcelMonthPlanGRProject = (
  file: File,
): Promise<GRProjectPlanExcelData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        reject(new Error("No sheet name found in the file"));
        return;
      }

      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        reject(new Error("No worksheet found in the file"));
        return;
      }

      let minRow = Infinity;
      let maxRow = -1;
      let minCol = Infinity;
      let maxCol = -1;

      for (const cellAddress in worksheet) {
        if (cellAddress.startsWith("!")) continue;

        const { r, c } = XLSX.utils.decode_cell(cellAddress);
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }

      const startCell = XLSX.utils.encode_cell({ r: minRow, c: minCol });
      const endCell = XLSX.utils.encode_cell({ r: maxRow, c: maxCol });

      const lastRow = maxRow + 1;
      const columnCount = maxCol + 1;

      console.log(`Actual data range: ${startCell} to ${endCell}`);
      console.log(`Last Row: ${lastRow}`);
      console.log(`Column Count: ${columnCount}`);

      // Headers
      // Combine two header rows: row 0 and row 1
      const headerRow1 = minRow + 1; // top header row (1)
      const headerRow2 = minRow + 2; // bottom header row (2)

      const headers = [];

      let lastTopHeader = "";

      for (let col = minCol; col <= maxCol; col++) {
        const cell2 =
          worksheet[XLSX.utils.encode_cell({ r: headerRow1, c: col })];
        const cell3 =
          worksheet[XLSX.utils.encode_cell({ r: headerRow2, c: col })];

        const topHeaderValue = cell2?.v;
        const botHeaderValue = cell3?.v;
        const topHeader =
          typeof topHeaderValue === "string"
            ? topHeaderValue.trim()
            : typeof topHeaderValue === "number"
              ? topHeaderValue.toString().trim()
              : "";
        const botHeader =
          typeof botHeaderValue === "string"
            ? botHeaderValue.trim()
            : typeof botHeaderValue === "number"
              ? botHeaderValue.toString().trim()
              : "";

        if (topHeader) {
          lastTopHeader = topHeader;
        }

        // Combine three headers, skipping empty ones
        const parts = [];
        if (lastTopHeader) parts.push(lastTopHeader);
        if (botHeader) parts.push(botHeader);

        const fullHeader = parts.join(" - ") || `Column_${col}`;
        headers.push(fullHeader);
      }

      //Rows with headers
      const array: RawExcelData[] = [];
      for (let row = minRow + 3; row <= maxRow; row++) {
        const rowData: RawExcelData = {};
        for (let col = minCol; col <= maxCol; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const header = headers[col - minCol];
          const value = worksheet[cellAddress]?.v ?? null;
          if (header && value !== undefined) {
            rowData[header] = value;
          }
        }
        array.push(rowData);
      }

      // Convert Excel serial dates in "Дата" column to JS ISO string (YYYY-MM-DD)
      const dateHeaderKey = headers.find((hdr) => hdr.toLowerCase() === "дата");

      const convertedArray = array.map((row) => {
        const serialDate = dateHeaderKey ? row[dateHeaderKey] : null;
        let dateStr = null;

        if (typeof serialDate === "number") {
          const dateObj = XLSX.SSF.parse_date_code(serialDate);
          if (dateObj) {
            const jsDate = new Date(dateObj.y, dateObj.m - 1, dateObj.d + 1);
            dateStr = jsDate.toISOString(); // "YYYY-MM-DD"
          }
        } else if (typeof serialDate === "string") {
          // If already string, try to keep it as is or parse if needed
          dateStr = serialDate.trim();
        }

        return { ...row, Дата: dateStr } as GRProjectPlanExcelData;
      });

      const filteredArray: GRProjectPlanExcelData[] = convertedArray.filter(
        (el) => el.id !== null,
      );
      resolve(filteredArray);
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Processes Excel files containing monthly natural indicators plans
 *
 * This function reads an Excel file with natural indicators data and processes it to create
 * structured natural indicators plans. It handles multi-row headers and can either use
 * a user-provided date or extract dates from the Excel file.
 *
 * @param file - The Excel file to process
 * @param yearMonth - Optional Date object specifying year/month. If provided, overrides Excel date
 * @returns Promise<NaturalIndicatorsPlanExcelData[]> - Array of processed natural indicators data
 */
export const processExcelMonthPlanNaturalIndicators = (
  file: File,
  // yearMonth?: Date
): Promise<NaturalIndicatorsPlanExcelData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        reject(new Error("No sheet name found in the file"));
        return;
      }

      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        reject(new Error("No worksheet found in the file"));
        return;
      }

      let minRow = Infinity;
      let maxRow = -1;
      let minCol = Infinity;
      let maxCol = -1;

      for (const cellAddress in worksheet) {
        if (cellAddress.startsWith("!")) continue;

        const { r, c } = XLSX.utils.decode_cell(cellAddress);
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }

      const startCell = XLSX.utils.encode_cell({ r: minRow, c: minCol });
      const endCell = XLSX.utils.encode_cell({ r: maxRow, c: maxCol });

      const lastRow = maxRow + 1;
      const columnCount = maxCol + 1;

      console.log(`Actual data range: ${startCell} to ${endCell}`);
      console.log(`Last Row: ${lastRow}`);
      console.log(`Column Count: ${columnCount}`);

      // Headers
      // Combine two header rows: row 0 and row 1
      const headerRow1 = minRow + 1; // top header row (1)
      const headerRow2 = minRow + 2; // bottom header row (2)

      const headers = [];

      let lastTopHeader = "";

      for (let col = minCol; col <= maxCol; col++) {
        const cell2 =
          worksheet[XLSX.utils.encode_cell({ r: headerRow1, c: col })];
        const cell3 =
          worksheet[XLSX.utils.encode_cell({ r: headerRow2, c: col })];

        const topHeaderValue = cell2?.v;
        const botHeaderValue = cell3?.v;
        const topHeader =
          typeof topHeaderValue === "string"
            ? topHeaderValue.trim()
            : typeof topHeaderValue === "number"
              ? topHeaderValue.toString().trim()
              : "";
        const botHeader =
          typeof botHeaderValue === "string"
            ? botHeaderValue.trim()
            : typeof botHeaderValue === "number"
              ? botHeaderValue.toString().trim()
              : "";

        if (topHeader) {
          lastTopHeader = topHeader;
        }

        // Combine three headers, skipping empty ones
        const parts = [];
        if (lastTopHeader) parts.push(lastTopHeader);
        if (botHeader) parts.push(botHeader);

        const fullHeader = parts.join(" - ") || `Column_${col}`;
        headers.push(fullHeader);
      }

      //Rows with headers
      const array: RawExcelData[] = [];
      for (let row = minRow + 3; row <= maxRow; row++) {
        const rowData: RawExcelData = {};
        for (let col = minCol; col <= maxCol; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const header = headers[col - minCol];
          const value = worksheet[cellAddress]?.v ?? null;
          if (header && value !== undefined) {
            rowData[header] = value;
          }
        }
        array.push(rowData);
      }

      // Convert Excel serial dates in "Дата" column to JS ISO string (YYYY-MM-DD)
      const dateHeaderKey = headers.find((hdr) => hdr.toLowerCase() === "дата");

      const convertedArray = array.map((row) => {
        const serialDate = dateHeaderKey ? row[dateHeaderKey] : null;
        let dateStr = null;

        if (typeof serialDate === "number") {
          const dateObj = XLSX.SSF.parse_date_code(serialDate);
          if (dateObj) {
            const jsDate = new Date(dateObj.y, dateObj.m - 1, dateObj.d + 1);
            dateStr = jsDate.toISOString(); // "YYYY-MM-DD"
          }
        } else if (typeof serialDate === "string") {
          // If already string, try to keep it as is or parse if needed
          dateStr = serialDate.trim();
        }

        return { ...row, Дата: dateStr } as NaturalIndicatorsPlanExcelData;
      });

      const filteredArray: NaturalIndicatorsPlanExcelData[] =
        convertedArray.filter((el) => el.id !== null);
      resolve(filteredArray);
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
};
