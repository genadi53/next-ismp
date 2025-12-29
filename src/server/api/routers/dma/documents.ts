import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getAllDmaDocuments,
  getDmaDocumentById,
  getDmaDocumentsDetails,
  createDmaDocument,
  updateDmaDocument,
  deleteDmaDocument,
  getDmaDocumentSuppliers,
  createDmaDocumentSupplier,
  updateDmaDocumentSupplier,
  deleteDmaDocumentSupplier,
  getDmaDocumentAssets,
  createDmaDocumentAsset,
  updateDmaDocumentAsset,
  deleteDmaDocumentAsset,
  getDmaAllowedDate,
  createDmaAllowedDate,
  stopDmaAllowedDate,
  requestDocumentEdit,
} from "@/server/repositories/dma/documents.repository";

const createDocumentSchema = z.object({
  Doctype: z.number(),
  DocDate: z.string(),
  SupplierId: z.number(),
  DepartmentId: z.number(),
  Inv: z.string().nullable(),
  InvDate: z.string().nullable(),
  DocAmount: z.number().nullable(),
  Reconstruction: z.string().nullable(),
  VuzlagatelnoDate: z.string().nullable(),
  Vuzlagatelno: z.string().nullable(),
  InvestitionID: z.string().nullable(),
  DocsDepartment: z.string().nullable(),
  DocsDepMol: z.string().nullable(),
  DocsDepMolDuty: z.string().nullable(),
  DocsDepartmentDesc: z.string().nullable(),
  DocsDeptApproval: z.string().nullable(),
  DocsDeptApprovalDuty: z.string().nullable(),
  DocsSuplierName: z.string().nullable(),
  DocsSuplierDesc: z.string().nullable(),
  CreatedFrom: z.string().nullable().default(null),
  LastUpdatedFrom: z.string().nullable().default(null),
});

const createDocumentSupplierSchema = z.object({
  DocSupplierId: z.number(),
  DocSuplierName: z.string().nullable(),
  DocSuplierDesc: z.string().nullable(),
  DocSuplAmount: z.number().nullable(),
  Inv: z.string().nullable(),
  InvDate: z.string().nullable(),
  CreatedFrom: z.string().nullable().default(null),
  LastUpdatedFrom: z.string().nullable().default(null),
});

const createDocumentAssetSchema = z.object({
  CompId: z.number(),
  CompUnits: z.number().nullable().default(null),
  Price: z.number().nullable().default(null),
  Mea: z.string().nullable(),
  SerialNum: z.string().nullable(),
  DetExploatation: z.number().nullable(),
  DetExploatationMeasure: z.string().nullable(),
  DetDateBuy: z.string().nullable(),
  DetStartExploatation: z.string().nullable(),
  DetApprovedDMA: z.string().nullable(),
  CreatedFrom: z.string().nullable().default(null),
  LastUpdatedFrom: z.string().nullable().default(null),
});

const createAllowedDateSchema = z.object({
  StartDate: z.string(),
  EndDate: z.string(),
  StoppedAll: z.boolean(),
});

export const documentsRouter = createTRPCRouter({
  /**
   * Get all DMA documents.
   */
  getAll: publicProcedure.query(async () => {
    return getAllDmaDocuments();
  }),

  /**
   * Get a single DMA document by ID.
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getDmaDocumentById(input.id);
    }),

  /**
   * Get document details for dropdowns.
   */
  getDetails: publicProcedure.query(async () => {
    return getDmaDocumentsDetails();
  }),

  /**
   * Create a new DMA document.
   */
  create: publicProcedure
    .input(createDocumentSchema)
    .mutation(async ({ input }) => {
      const result = await createDmaDocument(input);
      return { success: true, id: result.id, message: "Document created successfully" };
    }),

  /**
   * Update an existing DMA document.
   */
  update: publicProcedure
    .input(z.object({ id: z.number(), data: createDocumentSchema }))
    .mutation(async ({ input }) => {
      await updateDmaDocument(input.id, input.data);
      return { success: true, message: "Document updated successfully" };
    }),

  /**
   * Delete a DMA document.
   */
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteDmaDocument(input.id);
      return { success: true, message: "Document deleted successfully" };
    }),

  // Document Suppliers
  /**
   * Get suppliers for a document.
   */
  getSuppliers: publicProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input }) => {
      return getDmaDocumentSuppliers(input.documentId);
    }),

  /**
   * Create a document supplier.
   */
  createSupplier: publicProcedure
    .input(z.object({ documentId: z.number(), data: createDocumentSupplierSchema }))
    .mutation(async ({ input }) => {
      await createDmaDocumentSupplier(input.documentId, input.data);
      return { success: true, message: "Document supplier created successfully" };
    }),

  /**
   * Update a document supplier.
   */
  updateSupplier: publicProcedure
    .input(z.object({ 
      documentId: z.number(), 
      supplierId: z.number(), 
      data: createDocumentSupplierSchema 
    }))
    .mutation(async ({ input }) => {
      await updateDmaDocumentSupplier(input.documentId, input.supplierId, input.data);
      return { success: true, message: "Document supplier updated successfully" };
    }),

  /**
   * Delete a document supplier.
   */
  deleteSupplier: publicProcedure
    .input(z.object({ documentId: z.number(), supplierId: z.number() }))
    .mutation(async ({ input }) => {
      await deleteDmaDocumentSupplier(input.documentId, input.supplierId);
      return { success: true, message: "Document supplier deleted successfully" };
    }),

  // Document Assets
  /**
   * Get assets for a document.
   */
  getAssets: publicProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input }) => {
      return getDmaDocumentAssets(input.documentId);
    }),

  /**
   * Create a document asset.
   */
  createAsset: publicProcedure
    .input(z.object({ documentId: z.number(), data: createDocumentAssetSchema }))
    .mutation(async ({ input }) => {
      await createDmaDocumentAsset(input.documentId, input.data);
      return { success: true, message: "Document asset created successfully" };
    }),

  /**
   * Update a document asset.
   */
  updateAsset: publicProcedure
    .input(z.object({ 
      documentId: z.number(), 
      assetId: z.number(), 
      data: createDocumentAssetSchema 
    }))
    .mutation(async ({ input }) => {
      await updateDmaDocumentAsset(input.documentId, input.assetId, input.data);
      return { success: true, message: "Document asset updated successfully" };
    }),

  /**
   * Delete a document asset.
   */
  deleteAsset: publicProcedure
    .input(z.object({ documentId: z.number(), assetId: z.number() }))
    .mutation(async ({ input }) => {
      await deleteDmaDocumentAsset(input.documentId, input.assetId);
      return { success: true, message: "Document asset deleted successfully" };
    }),

  // Allowed Date
  /**
   * Get the current allowed date range for documents.
   */
  getAllowedDate: publicProcedure.query(async () => {
    return getDmaAllowedDate();
  }),

  /**
   * Create a new allowed date entry.
   */
  createAllowedDate: publicProcedure
    .input(createAllowedDateSchema)
    .mutation(async ({ input }) => {
      await createDmaAllowedDate(input);
      return { success: true, message: "Allowed date created successfully" };
    }),

  /**
   * Stop all documents for a specific allowed date entry.
   */
  stopAllowedDate: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await stopDmaAllowedDate(input.id);
      return { success: true, message: "Allowed date stopped successfully" };
    }),

  /**
   * Request edit for a document.
   */
  requestEdit: publicProcedure
    .input(z.object({ docId: z.number(), requestedFrom: z.string() }))
    .mutation(async ({ input }) => {
      await requestDocumentEdit(input.docId, input.requestedFrom);
      return { success: true, message: "Edit request submitted successfully" };
    }),
});

