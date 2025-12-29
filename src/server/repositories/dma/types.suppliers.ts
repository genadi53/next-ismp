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
};

