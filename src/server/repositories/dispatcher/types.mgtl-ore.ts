export type MgtlOre = {
  ID: number;
  OperDate: string;
  Izvoz1: number | null;
  Mgtl1: number | null;
  Izvoz2: number | null;
  Mgtl2: number | null;
  Izvoz3: number | null;
  Mgtl3: number | null;
  Izvoz4: number | null;
  Mgtl4: number | null;
  SumMGTL: number;
  lrd: string;
  lrby: string | null;
};

export type CreateMgtlOreInput = {
  OperDate: string;
  Izvoz1: number | null;
  Mgtl1: number | null;
  Izvoz3: number | null;
  Mgtl3: number | null;
  Izvoz4: number | null;
  Mgtl4: number | null;
  lrby: string | null;
};

export type UpdateMgtlOreInput = {
  Izvoz1: number | null;
  Mgtl1: number | null;
  Izvoz3: number | null;
  Mgtl3: number | null;
  Izvoz4: number | null;
  Mgtl4: number | null;
  lrby: string | null;
};
