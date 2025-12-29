export type Load = {
  id: number;
  Adddate: Date;
  Shift: number | null;
  Shovel: string;
  Truck: string;
  Br: number | null;
  AddMaterial: string | null;
  RemoveMaterial: string | null;
  lrd: Date | null;
  lrby: string | null;
  userAdded: string | null;
  sentReport: boolean;
};

export type CreateLoadInput = {
  Adddate: Date;
  Shift: number;
  Shovel: string;
  Truck: string;
  Br: number | null;
  AddMaterial?: string | null;
  RemoveMaterial?: string | null;
  userAdded?: string | null;
};
