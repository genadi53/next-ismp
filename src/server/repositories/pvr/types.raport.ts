export type BlastReport = {
  ID: number;
  ShiftDate: string | null;
  VP_num: string | null;
  Horiz: string | null;
  site_conditon: string | null;
  quality_do_1m: string | null;
  quality_nad_1m: string | null;
  quality_zone_prosip: string | null;
  water_presence_drilling: string | null;
  water_presence_fueling: string | null;
  E3400: number | null;
  ANFO: number | null;
  E1100: number | null;
  non_retaining: number | null;
  quality_explosive: string | null;
  quality_zatapka: string | null;
  smoke_presence: string | null;
  scattering: string | null;
  presence_negabarit: string | null;
  state_blast_material: string | null;
  state_blast_site_after: string | null;
  non_blasted_num: number | null;
  Initiate: string | null;
  lrd: Date | null;
  CreatedFrom: string | null;
  EditedFrom: string | null;
};

export type CreateBlastReportInput = {
  ShiftDate: string | null;
  VP_num: string | null;
  Horiz: string | null;
  site_conditon: string | null;
  quality_do_1m: string | null;
  quality_nad_1m: string | null;
  quality_zone_prosip: string | null;
  water_presence_drilling: string | null;
  water_presence_fueling: string | null;
  E3400: number | null;
  ANFO: number | null;
  E1100: number | null;
  non_retaining: number | null;
  quality_explosive: string | null;
  quality_zatapka: string | null;
  smoke_presence: string | null;
  scattering: string | null;
  presence_negabarit: string | null;
  state_blast_material: string | null;
  state_blast_site_after: string | null;
  non_blasted_num: number | null;
  Initiate: string | null;
  CreatedFrom: string | null;
  EditedFrom: string | null;
};

export type UpdateBlastReportInput = Omit<
  CreateBlastReportInput,
  "CreatedFrom" | "EditedFrom"
>;


