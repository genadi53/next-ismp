import { z } from "zod";

export const dmaAssetFormSchema = z.object({
  Name: z
    .string({ required_error: "Въведете име на актива" })
    .min(1, { message: "Името на актива е задължително" }),
  Marka: z.string().nullish(),
  Model: z.string().nullish(),
  EdPrice: z
    .number()
    .nullish()
    .refine((val) => val === undefined || val === null || val >= 0, {
      message: "Цената трябва да бъде положително число",
    }),
  Description: z.string().nullish(),
});

export type DmaAssetFormData = z.infer<typeof dmaAssetFormSchema>;

// ---- Departments ----
export const dmaDepartmentFormSchema = z.object({
  Department: z
    .string({ required_error: "Името на отдела е задължително" })
    .min(2, { message: "Името на отдела е твърде кратко" }),
  DepMol: z.string().optional(),
  DepMolDuty: z.string().optional(),
  DeptApproval: z.string().optional(),
  DeptApprovalDuty: z.string().optional(),
  DepartmentDesc: z.string().optional(),
});

export type DmaDepartmentFormData = z.infer<typeof dmaDepartmentFormSchema>;

// ---- Suppliers ----
export const dmaSupplierFormSchema = z.object({
  Supplier: z
    .string({ required_error: "Името на доставчика е задължително" })
    .min(1, { message: "Името на доставчика е задължително" }),
  SupplierDesc: z.string().optional(),
});

export type DmaSupplierFormData = z.infer<typeof dmaSupplierFormSchema>;

// ---- Documents ----
export const dmaDocumentFormSchema = z
  .object({
    Doctype: z.number().min(1, "Типът на документа е задължителен"),
    DocTypeId: z.number().min(1).optional(),
    DocDate: z.string().min(1, "Датата на документа е задължителна"),
    SupplierId: z.number().min(0),
    DepartmentId: z.number().min(0),
    Inv: z.string().optional(),
    InvDate: z.string().optional(),
    DocAmount: z.number().min(0, "Стойността трябва да е положителна"),
    Reconstruction: z.string().optional(),
    VuzlagatelnoDate: z.string().optional(),
    Vuzlagatelno: z.string().optional(),
    InvestitionID: z.string().optional(),
    DocsDepartment: z.string().optional(),
    DocsDepMol: z.string().optional(),
    DocsDepMolDuty: z.string().optional(),
    DocsDepartmentDesc: z.string().optional(),
    DocsDeptApproval: z.string().optional(),
    DocsDeptApprovalDuty: z.string().optional(),
    DocsSuplierName: z.string().optional(),
    DocsSuplierDesc: z.string().optional(),
  })
  .refine((d) => d.SupplierId > 0 && d.DepartmentId > 0, {
    message: "Доставчикът и дирекцията са задължителни",
    path: ["SupplierId"],
  });

export type DmaDocumentFormData = z.infer<typeof dmaDocumentFormSchema>;

// ---- Document supplier (per-document) ----
export const dmaDocumentSupplierFormSchema = z.object({
  DocSupplierId: z.number().min(1, "Доставчикът е задължителен"),
  DocSuplAmount: z.number().min(0, "Стойността трябва да е положително число"),
  Inv: z.string().min(1, "Номерът на фактурата е задължителен"),
  InvDate: z.string().min(1, "Датата на фактурата е задължителна"),
});

export type DmaDocumentSupplierFormData = z.infer<
  typeof dmaDocumentSupplierFormSchema
>;

// ---- Document asset detail (per-document) ----
export const dmaDocumentAssetDetailFormSchema = z.object({
  CompId: z.number().min(1, "Активът е задължителен"),
  CompUnits: z.number().min(0.001, "Количеството трябва да е по-голямо от 0"),
  Price: z.number().min(0, "Цената трябва да е положително число"),
  Mea: z.string().optional(),
  SerialNum: z.string().optional(),
  DetExploatation: z.union([z.number(), z.string()]).optional(),
  DetExploatationMeasure: z.string().optional(),
  DetDateBuy: z.string().optional(),
  DetStartExploatation: z.string().optional(),
  DetApprovedDMA: z.string().optional(),
});

export type DmaDocumentAssetDetailFormData = z.infer<
  typeof dmaDocumentAssetDetailFormSchema
>;
