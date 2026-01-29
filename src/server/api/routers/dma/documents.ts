import { z } from "zod";
import { usernameFromEmail } from "@/lib/username";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
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
  getAll: protectedProcedure.query(async () => {
    return getAllDmaDocuments();
  }),

  /**
   * Get a single DMA document by ID.
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getDmaDocumentById(input.id);
    }),

  /**
   * Get document details for dropdowns.
   */
  getDetails: protectedProcedure.query(async () => {
    return getDmaDocumentsDetails();
  }),

  /**
   * Create a new DMA document.
   */
  create: protectedProcedure
    .input(createDocumentSchema)
    .mutation(async ({ input, ctx }) => {
      const audit = usernameFromEmail(ctx.user.email);
      const result = await createDmaDocument({
        ...input,
        CreatedFrom: audit,
        LastUpdatedFrom: audit,
      });
      return {
        success: true,
        id: result.id,
        message: "Document created successfully",
      };
    }),

  /**
   * Update an existing DMA document.
   */
  update: protectedProcedure
    .input(z.object({ id: z.number(), data: createDocumentSchema }))
    .mutation(async ({ input, ctx }) => {
      await updateDmaDocument(input.id, {
        ...input.data,
        CreatedFrom: usernameFromEmail(ctx.user.email),
        LastUpdatedFrom: usernameFromEmail(ctx.user.email),
      });
      return { success: true, message: "Document updated successfully" };
    }),

  /**
   * Delete a DMA document.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteDmaDocument(input.id);
      return { success: true, message: "Document deleted successfully" };
    }),

  // Document Suppliers
  /**
   * Get suppliers for a document.
   */
  getSuppliers: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input }) => {
      return getDmaDocumentSuppliers(input.documentId);
    }),

  /**
   * Create a document supplier.
   */
  createSupplier: protectedProcedure
    .input(
      z.object({ documentId: z.number(), data: createDocumentSupplierSchema }),
    )
    .mutation(async ({ input, ctx }) => {
      const audit = usernameFromEmail(ctx.user.email);
      await createDmaDocumentSupplier(input.documentId, {
        ...input.data,
        CreatedFrom: audit,
        LastUpdatedFrom: audit,
      });
      return {
        success: true,
        message: "Document supplier created successfully",
      };
    }),

  /**
   * Update a document supplier.
   */
  updateSupplier: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        supplierId: z.number(),
        data: createDocumentSupplierSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await updateDmaDocumentSupplier(input.documentId, input.supplierId, {
        ...input.data,
        LastUpdatedFrom: usernameFromEmail(ctx.user.email),
      });
      return {
        success: true,
        message: "Document supplier updated successfully",
      };
    }),

  /**
   * Delete a document supplier.
   */
  deleteSupplier: protectedProcedure
    .input(z.object({ documentId: z.number(), supplierId: z.number() }))
    .mutation(async ({ input }) => {
      await deleteDmaDocumentSupplier(input.documentId, input.supplierId);
      return {
        success: true,
        message: "Document supplier deleted successfully",
      };
    }),

  // Document Assets
  /**
   * Get assets for a document.
   */
  getAssets: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .query(async ({ input }) => {
      return getDmaDocumentAssets(input.documentId);
    }),

  /**
   * Create a document asset.
   */
  createAsset: protectedProcedure
    .input(
      z.object({ documentId: z.number(), data: createDocumentAssetSchema }),
    )
    .mutation(async ({ input, ctx }) => {
      await createDmaDocumentAsset(input.documentId, {
        ...input.data,
        CreatedFrom: usernameFromEmail(ctx.user.email),
        LastUpdatedFrom: usernameFromEmail(ctx.user.email),
      });
      return { success: true, message: "Document asset created successfully" };
    }),

  /**
   * Update a document asset.
   */
  updateAsset: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        assetId: z.number(),
        data: createDocumentAssetSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await updateDmaDocumentAsset(input.documentId, input.assetId, {
        ...input.data,
        LastUpdatedFrom: usernameFromEmail(ctx.user.email),
      });
      return { success: true, message: "Document asset updated successfully" };
    }),

  /**
   * Delete a document asset.
   */
  deleteAsset: protectedProcedure
    .input(z.object({ documentId: z.number(), assetId: z.number() }))
    .mutation(async ({ input }) => {
      await deleteDmaDocumentAsset(input.documentId, input.assetId);
      return { success: true, message: "Document asset deleted successfully" };
    }),

  // Allowed Date
  /**
   * Get the current allowed date range for documents.
   */
  getAllowedDate: protectedProcedure.query(async () => {
    return getDmaAllowedDate();
  }),

  /**
   * Create a new allowed date entry.
   */
  createAllowedDate: protectedProcedure
    .input(createAllowedDateSchema)
    .mutation(async ({ input }) => {
      await createDmaAllowedDate({
        StartDate: input.StartDate,
        EndDate: input.EndDate,
        StoppedAll: input.StoppedAll ? 1 : 0,
      });
      return { success: true, message: "Allowed date created successfully" };
    }),

  /**
   * Stop all documents for a specific allowed date entry.
   */
  stopAllowedDate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await stopDmaAllowedDate(input.id);
      return { success: true, message: "Allowed date stopped successfully" };
    }),

  /**
   * Request edit for a document.
   */
  requestEdit: protectedProcedure
    .input(z.object({ docId: z.number(), requestedFrom: z.string() }))
    .mutation(async ({ input }) => {
      await requestDocumentEdit(input.docId, input.requestedFrom);
      return { success: true, message: "Edit request submitted successfully" };
    }),
});
