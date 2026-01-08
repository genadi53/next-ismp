export type HermesZarabotki = {
  Година: number;
  Месец: number;
  Цех: string;
  Звено: string;
  Код_на_машина: string;
  Показател: string;
  Количество_показател: number | null;
  Общо_сума: number | null;
  lrd: string | null;
};

export type CreateZarabotkiInput = Omit<HermesZarabotki, "lrd">;

// export type HermesZarabotki = {
//   Year: number;
//   Month: number;
//   Department: string;
//   Zveno: string;
//   Machine: string;
//   Indicator: string;
//   Indicator_Quantity: number | null;
//   Total_Sum: number | null;
//   lrd: string | null;
// };

// export type CreateZarabotkiInput = Omit<HermesZarabotki, "lrd">;

// export type RawExcelDataZarabotki = {
//   [key: string]: string | number | null | undefined;
// };

export type RawExcelDataZarabotki = {
  Година: number;
  Месец: number;
  Цех: string;
  Звено: string;
  "Код на машина": string;
  Показател: string;
  "Количество показател": number;
  "Общо сума": number;
};
