import * as XLSX from "xlsx";
import type {
  DayShift,
  ExtractedGrafikRow,
} from "@/types/dispatcher/types.schedule";

export const extractGrafikDispetchers = (
  file: File,
): Promise<ExtractedGrafikRow[] | undefined> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const workbook = XLSX.read(e.target?.result, { type: "binary" });
      const countSheets = workbook.SheetNames.length;
      // console.log(countSheets, workbook.SheetNames[countSheets - 1]);
      const sheetName = workbook.SheetNames[countSheets - 1];
      const worksheet = workbook.Sheets[sheetName];

      // Find bounds
      let minRow = Infinity;
      let maxRow = -1;
      let minCol = Infinity;
      let maxCol = -1;

      for (const cellAddress in worksheet) {
        if (cellAddress[0] === "!") continue;
        const { r, c } = XLSX.utils.decode_cell(cellAddress);
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }

      const dayHeaderRowIndex = 9;
      const dayStartCol = 3; // D column

      // Find last day column
      let dayEndCol = dayStartCol;
      let maxDayFound = 0;

      for (let col = dayStartCol; col <= maxCol; col++) {
        const dayAddress = XLSX.utils.encode_cell({
          r: dayHeaderRowIndex,
          c: col,
        });
        const dayCell = worksheet[dayAddress];
        const dayValue = dayCell?.v?.toString().trim();

        if (dayValue && /^\d+$/.test(dayValue)) {
          const dayNum = parseInt(dayValue);
          if (dayNum > maxDayFound) {
            maxDayFound = dayNum;
            dayEndCol = col;
          }
        }
      }

      // Get ALL day headers
      const allDayHeaders = [];
      for (let col = dayStartCol; col <= dayEndCol; col++) {
        const dayAddress = XLSX.utils.encode_cell({
          r: dayHeaderRowIndex,
          c: col,
        });
        const dayCell = worksheet[dayAddress];
        const dayValue = dayCell?.v?.toString().trim();

        if (dayValue && /^\d+$/.test(dayValue)) {
          allDayHeaders.push({
            header: `${dayValue.padStart(2, "0")}`,
            col,
            dayNum: parseInt(dayValue),
          });
        }
      }
      allDayHeaders.sort((a, b) => a.dayNum - b.dayNum);
      // console.log(allDayHeaders);

      const filteredRows: ExtractedGrafikRow[] = [];
      for (let row = dayHeaderRowIndex + 1; row <= maxRow; row++) {
        const firstCellAddress = XLSX.utils.encode_cell({ r: row, c: minCol });
        const firstCell = worksheet[firstCellAddress];
        if (!firstCell || firstCell.v == null) continue;

        // Get employee Name and Id -> col 1 and 2 in the sheet
        const employeeIdAddress = XLSX.utils.encode_cell({
          r: row,
          c: minCol,
        });
        const employeeIdCell = worksheet[employeeIdAddress];
        const employeeIdValue = employeeIdCell?.v?.toString().trim();

        const employeeNameAddress = XLSX.utils.encode_cell({
          r: row,
          c: minCol + 1,
        });
        const employeeNameCell = worksheet[employeeNameAddress];
        const employeeNameValue = employeeNameCell?.v?.toString().trim();

        const cellValue = firstCell.v.toString().trim();
        if (/^\d+$/.test(cellValue)) {
          const dataMap = new Map();

          // Add ONLY days with values 1 or 2
          // for (const { header, col, dayNum } of allDayHeaders) {
          for (const { header, col } of allDayHeaders) {
            const address = XLSX.utils.encode_cell({ r: row, c: col });
            const dayValue = worksheet[address]?.v;

            if (dayValue === 1 || dayValue === -2) {
              dataMap.set(header, dayValue === 1 ? 1 : 2);
            }
          }

          const orderedData: Record<string, DayShift> =
            Object.fromEntries(dataMap);
          filteredRows.push({
            ...orderedData,
            id: employeeIdValue,
            name: employeeNameValue,
          });
        }
      }

      resolve(filteredRows);
    };

    reader.onerror = (e) => {
      console.error("Error reading file:", e);
      reject(e);
    };

    reader.readAsArrayBuffer(file);
  });
};
