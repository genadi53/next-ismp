import type { RawExcelData } from "@/server/repositories/mine-planning";
import type {
  ZarabotkiEquipment,
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
      const worksheet = workbook.Sheets[sheetName];

      let minRow = Infinity;
      let maxRow = -1;
      let maxCol = -1;
      let minCol = Infinity;

      for (const cellAddress in worksheet) {
        if (cellAddress[0] === "!") continue;

        const column = cellAddress.match(/[A-Z]+/)?.[0];

        if (column && column > "H") continue;

        const { r, c } = XLSX.utils.decode_cell(cellAddress);
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }

      const headerRow1 = minRow + 1;

      const headers = [];
      for (let col = minCol; col <= maxCol; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: headerRow1, c: col });
        const headerValue = worksheet[headerCell]?.v ?? `Column${col}`;
        headers.push(headerValue);
      }

      let array: RawExcelDataZarabotki[] = [];
      for (let row = headerRow1 + 1; row <= maxRow; row++) {
        const rowData: RawExcelData = {};
        for (let col = minCol; col <= maxCol; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const value = worksheet[cellAddress]?.v ?? null;
          const header = headers[col - minCol];
          rowData[header] = value;
        }
        // console.log(rowData);
        array.push(rowData as RawExcelDataZarabotki);
      }

      resolve(array);
    };

    reader.onerror = (e) => {
      reject(e);
    };

    reader.readAsArrayBuffer(file);
  });
};

export const mapperZarabotki = (excelData: RawExcelDataZarabotki[]) => {
  return excelData.map((item) => {
    return {
      Year: item.Година,
      Month: item.Месец,
      Department: item.Цех,
      Zveno: item.Звено,
      Machine: item["Код на машина"],
      Indicator: item.Показател,
      Indicator_Quantity: item["Количество показател"] ?? 0,
      Total_Sum: item["Общо сума"] ?? 0,
    };
  }) as ZarabotkiEquipment[];
};
