export type GeowlanAP = {
  id: number;
  name: string;
  x: number | null;
  y: number | null;
  enabled: boolean | null;
  apId: number | null;
  ip: string | null;
  hardware: string | null;
  LAN: string | null;
  mac: string | null;
  mast_id: number | null;
  rgb: string | null;
};

export type CreateGeowlanAPInput = {
  name: string;
  x: number | null;
  y: number | null;
  enabled: boolean | null;
  ip: string | null;
  hardware: string | null;
  LAN: string | null;
  mac: string | null;
  rgb: string | null;
};

export type UpdateGeowlanAPInput = {
  name: string;
  x: number | null;
  y: number | null;
  enabled: boolean | null;
  apId: number | null;
  ip: string | null;
  hardware: string | null;
  LAN: string | null;
  mac: string | null;
  rgb: string | null;
};


