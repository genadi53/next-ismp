export type DmaAsset = {
  Id: number;
  Name: string;
  Currency: string | null;
  Marka: string | null;
  Model: string | null;
  EdPrice: number | null;
  Description: string | null;
  lrd: string | null;
  CreatedFrom: string | null;
  LastUpdatedFrom: string | null;
};

export type CreateDmaAssetInput = {
  Name: string;
  Marka: string | null;
  Model: string | null;
  EdPrice: number | null;
  Currency: string | null;
  Description: string | null;
  CreatedFrom: string | null;
};

export type UpdateDmaAssetInput = {
  Name: string;
  Marka: string | null;
  Model: string | null;
  EdPrice: number | null;
  Currency: string | null;
  Description: string | null;
  LastUpdatedFrom: string | null;
};

export type DmaReport = {
  ID: number;
  "Тип на документа / Дата": string;
  Доставчици: string;
  "Фактура / Дата": string;
  Код: string | null;
  Дирекция: string;
  Реконструкция: string | null;
  "Стойност на акта": number | null;
  Актив: string | null;
  Отпечатан: boolean | null;
  "Създаден от": string | null;
  "Последна редакция от / на": string | null;
};
