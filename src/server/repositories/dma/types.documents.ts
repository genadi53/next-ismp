export type DmaDocument = {
  ID: number;
  "Тип на документа / Дата": string;
  Доставчици: string;
  "Фактура / Дата": string;
  Дирекция: string;
  Реконструкция: string | null;
  "Стойност на акта": string;
  "Актив / Сериен №": string | null;
  "Код Инвестиция": string | null;
  "Създаден от / Отпечатан": string;
  "Последна редакция от": string | null;
  "Последна редакция на": string | null;
};

export type DmaDocumentDetail = {
  Id: number;
  Doctype: number;
  DocTypeId: number;
  DocDate: string;
  SupplierId: number;
  DepartmentId: number;
  Inv: string | null;
  InvDate: string | null;
  DocAmount: number | null;
  Reconstruction: string | null;
  VuzlagatelnoDate: string | null;
  Vuzlagatelno: string | null;
  InvestitionID: string | null;
  DocsDepartment: string | null;
  DocsDepMol: string | null;
  DocsDepMolDuty: string | null;
  DocsDepartmentDesc: string | null;
  DocsDeptApproval: string | null;
  DocsDeptApprovalDuty: string | null;
  DocsSuplierName: string | null;
  DocsSuplierDesc: string | null;
  lrd: string | null;
  CreatedFrom: string | null;
  LastUpdatedFrom: string | null;
  IsPrinted: boolean | null;
  Supplier: string;
  Department: string;
};

export type CreateDmaDocumentInput = {
  Doctype: number;
  DocDate: string;
  SupplierId: number;
  DepartmentId: number;
  Inv: string | null;
  InvDate: string | null;
  DocAmount: number | null;
  Reconstruction: string | null;
  VuzlagatelnoDate: string | null;
  Vuzlagatelno: string | null;
  InvestitionID: string | null;
  DocsDepartment: string | null;
  DocsDepMol: string | null;
  DocsDepMolDuty: string | null;
  DocsDepartmentDesc: string | null;
  DocsDeptApproval: string | null;
  DocsDeptApprovalDuty: string | null;
  DocsSuplierName: string | null;
  DocsSuplierDesc: string | null;
  CreatedFrom: string | null;
  LastUpdatedFrom: string | null;
};

export type DmaDocumentSupplier = {
  id: number;
  DocId: number;
  DocSupplierId: number;
  Supplier: string;
  DocSuplAmount: number | null;
  Inv: string | null;
  InvDate: string | null;
  lrd: string | null;
  CreatedFrom: string | null;
  LastUpdatedFrom: string | null;
};

export type CreateDmaDocumentSupplierInput = {
  DocSupplierId: number;
  DocSuplierName: string | null;
  DocSuplierDesc: string | null;
  DocSuplAmount: number | null;
  Inv: string | null;
  InvDate: string | null;
  CreatedFrom: string | null;
  LastUpdatedFrom: string | null;
};

export type DmaDocumentAsset = {
  Id: number;
  DocId: number;
  CompId: number;
  CompUnits: number | null;
  Price: number | null;
  Mea: string | null;
  SerialNum: string | null;
  DetExploatation: number | null;
  DetExploatationMeasure: string | null;
  DetDateBuy: string | null;
  DetStartExploatation: string | null;
  DetApprovedDMA: string | null;
  lrd: string | null;
  CreatedFrom: string | null;
  LastUpdatedFrom: string | null;
  ComponentName: string;
  ComponentMarka: string | null;
  ComponentModel: string | null;
};

export type CreateDmaDocumentAssetInput = {
  CompId: number;
  CompUnits: number | null;
  Price: number | null;
  Mea: string | null;
  SerialNum: string | null;
  DetExploatation: number | null;
  DetExploatationMeasure: string | null;
  DetDateBuy: string | null;
  DetStartExploatation: string | null;
  DetApprovedDMA: string | null;
  CreatedFrom: string | null;
  LastUpdatedFrom: string | null;
};

export type DmaAllowedDate = {
  StartDate: string;
  EndDate: string;
  StoppedAll: boolean;
};

export type CreateDmaAllowedDateInput = {
  StartDate: string;
  EndDate: string;
  StoppedAll: boolean;
};

export type DmaDocumentsDetails = {
  departments: string[];
  suppliers: string[];
};

