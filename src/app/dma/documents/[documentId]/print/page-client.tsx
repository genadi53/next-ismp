"use client";

import { api } from "@/trpc/react";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

type Props = {
  documentId: number;
};

export function DocumentPrintClient({ documentId }: Props) {
  const [document] = api.dma.documents.getById.useSuspenseQuery({
    id: documentId,
  });

  const [suppliers] = api.dma.documents.getSuppliers.useSuspenseQuery({
    documentId,
  });

  const [assets] = api.dma.documents.getAssets.useSuspenseQuery({
    documentId,
  });

  useEffect(() => {
    // Auto-trigger print dialog when data is loaded
    if (document) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [document]);

  if (!document) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="bg-destructive/10 mb-4 inline-block rounded-full p-3">
            <AlertCircle className="text-destructive h-8 w-8" />
          </div>
          <h1 className="mb-4 text-2xl font-bold">Документът не е намерен</h1>
          <p className="text-muted-foreground">
            Документ с ID {documentId} не съществува в системата.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 print:p-8">
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 2cm;
          }
        }
      `}</style>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">
          {document.Doctype === 1
            ? "АКТ ЗА ПРИЕМАНЕ НА ДМА"
            : "АКТ ЗА ПРИЕМАНЕ НА ДМА С РЕКОНСТРУКЦИЯ"}
        </h1>
        <p className="text-lg">
          № {document.DocTypeId} / {document.DocDate}
        </p>
      </div>

      {/* Document Info */}
      <div className="mb-6 space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Доставчик:</strong> {document.Supplier}
          </div>
          <div>
            <strong>Дирекция:</strong> {document.Department}
          </div>
          {document.Inv && (
            <div>
              <strong>Фактура:</strong> {document.Inv}
            </div>
          )}
          {document.InvDate && (
            <div>
              <strong>Дата на фактура:</strong> {document.InvDate}
            </div>
          )}
          {document.InvestitionID && (
            <div>
              <strong>Код инвестиция:</strong> {document.InvestitionID}
            </div>
          )}
          {document.Reconstruction && (
            <div className="col-span-2">
              <strong>Реконструкция:</strong> {document.Reconstruction}
            </div>
          )}
        </div>
      </div>

      {/* Suppliers Section */}
      {suppliers.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 border-b pb-2 text-xl font-bold">Доставчици</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Доставчик</th>
                <th className="border p-2 text-right">Сума (лв.)</th>
                <th className="border p-2 text-left">Фактура</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="border p-2">{supplier.Supplier}</td>
                  <td className="border p-2 text-right">
                    {supplier.DocSuplAmount
                      ? supplier.DocSuplAmount.toFixed(2)
                      : "0.00"}
                  </td>
                  <td className="border p-2">{supplier.Inv ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Assets Section */}
      {assets.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 border-b pb-2 text-xl font-bold">Активи</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Наименование</th>
                <th className="border p-2 text-center">Брой</th>
                <th className="border p-2 text-right">Цена (лв.)</th>
                <th className="border p-2 text-right">Обща стойност (лв.)</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.Id}>
                  <td className="border p-2">
                    {asset.ComponentName}
                    {asset.ComponentMarka && ` - ${asset.ComponentMarka}`}
                    {asset.SerialNum && (
                      <div className="text-sm text-gray-600">
                        SN: {asset.SerialNum}
                      </div>
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    {asset.CompUnits ?? 0}
                  </td>
                  <td className="border p-2 text-right">
                    {asset.Price ? asset.Price.toFixed(2) : "0.00"}
                  </td>
                  <td className="border p-2 text-right">
                    {asset.CompUnits && asset?.Price
                      ? (asset.CompUnits * asset.Price).toFixed(2)
                      : "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 border-t pt-4">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="mb-8">Предал:</p>
            <div className="border-t border-black pt-1">
              <p className="text-center text-sm">(подпис)</p>
            </div>
          </div>
          <div>
            <p className="mb-8">Приел:</p>
            <div className="border-t border-black pt-1">
              <p className="text-center text-sm">(подпис)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Button (hidden when printing) */}
      <div className="mt-8 text-center print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Отпечатай
        </button>
      </div>
    </div>
  );
}
