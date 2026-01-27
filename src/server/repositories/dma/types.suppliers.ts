export type DmaSupplier = {
  Id: number;
  Supplier: string;
  SupplierDesc: string | null;
  lrd: Date | null;
  CreatedFrom: string | null;
  LastUpdatedFrom: string | null;
};

export type CreateDmaSupplierInput = {
  Supplier: string;
  SupplierDesc: string | null;
  CreatedFrom: string | null;
};

export type UpdateDmaSupplierInput = {
  Supplier: string;
  SupplierDesc: string | null;
  LastUpdatedFrom: string | null;
};
