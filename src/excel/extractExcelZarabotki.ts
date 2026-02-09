import type { RawExcelData } from "@/server/repositories/mine-planning";
import type {
  HermesZarabotki,
  RawExcelDataZarabotki,
} from "@/server/repositories/hermes";
import XLSX from "xlsx";

export const extractExcelZarabotki = (
  file: File,
): Promise<RawExcelDataZarabotki[] | undefined> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const workbook = XLSX.read(e.target?.result, { type: "binary" });

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
      let maxCol = -1;
      let minCol = Infinity;

      for (const cellAddress in worksheet) {
        if (cellAddress.startsWith("!")) continue;

        const column = /[A-Z]+/.exec(cellAddress)?.[0];

        if (column && column > "H") continue;

        const { r, c } = XLSX.utils.decode_cell(cellAddress);
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }

      const headerRow1 = minRow + 1;

      const headers: string[] = [];
      for (let col = minCol; col <= maxCol; col++) {
        const headerCell = worksheet[XLSX.utils.encode_cell({ r: headerRow1, c: col })] as { v?: unknown } | undefined;
        const headerValue = headerCell?.v;
        const headerString =
          typeof headerValue === "string"
            ? headerValue
            : typeof headerValue === "number"
              ? headerValue.toString()
              : `Column${col}`;
        headers.push(headerString);
      }

      const array: RawExcelDataZarabotki[] = [];
      for (let row = headerRow1 + 1; row <= maxRow; row++) {
        const rowData: RawExcelData = {};
        for (let col = minCol; col <= maxCol; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress] as { v?: unknown } | undefined;
          const value = cell?.v ?? null;
          const header = headers[col - minCol];
          if (header) {
            rowData[header] = value;
          }
        }
        // console.log(rowData);
        array.push(rowData as RawExcelDataZarabotki);
      }

      resolve(array);
    };

    reader.onerror = (e) => {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      reject(new Error(`Failed to read file: ${errorMessage}`));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const mapperZarabotki = (excelData: RawExcelDataZarabotki[]) => {
  return excelData.map((item) => {
    return {
      Година: item.Година,
      Месец: item.Месец,
      Цех: item.Цех,
      Звено: item.Звено,
      Код_на_машина: item["Код на машина"],
      Показател: item.Показател,
      Количество_показател: item["Количество показател"] ?? 0,
      Общо_сума: item["Общо сума"] ?? 0,
    };
  }) as HermesZarabotki[];
};
