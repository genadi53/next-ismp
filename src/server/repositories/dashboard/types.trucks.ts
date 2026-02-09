export type TruckRegionCount = {
  part: string;
  RegionName: string;
  Status: string;
  trucksStatRegion: number;
};

export type TotalSumTrucks = {
  part: string;
  RegionName: string;
  Status: string;
  trucksStatRegion: number;
  totalTrucks: number;
};

export type HourCountTruck = {
  hour: string;
  РУДА: number;
  ОТКРИВКА1400: number;
  ОТКРИВКА: number;
  ВСИЧКИ: number;
  lrd: number;
};

export type HourProdTruck = {
  hour: string;
  РУДА: number;
  ОТКРИВКА1400: number;
  ОТКРИВКА: number;
  ВСИЧКИ: number;
};

export type InfoTruck = {
  truck: string;
  Loc: string;
  Assignment: string;
  ReasonDelay: string;
};


