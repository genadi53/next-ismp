"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import type { DmaDocumentDetail } from "@/server/repositories/dma/types.documents";
import { DocumentsForm } from "./DocumentsForm";

type DocumentFormWrapperProps = {
  showForm: boolean;
  documentToEdit: DmaDocumentDetail | undefined;
  handleFormSubmit: (documentId?: number) => void;
};

export function DocumentFormWrapper({
  showForm,
  documentToEdit,
  handleFormSubmit,
}: DocumentFormWrapperProps) {
  if (!showForm) return null;

  return (
    <Card className="animate-in fade-in slide-in-from-top-4 shadow-lg duration-500">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl">
                {documentToEdit
                  ? "Редактиране на документ"
                  : "Нов документ"}
              </CardTitle>
              <CardDescription>
                {documentToEdit
                  ? "Актуализирайте данните за избрания документ"
                  : "Попълнете формата за добавяне на нов документ"}
              </CardDescription>
            </div>
          </div>
          {documentToEdit && (
            <Badge variant="secondary" className="ml-2">
              Режим на редакция
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DocumentsForm
          documentToEdit={documentToEdit}
          onFormSubmit={handleFormSubmit}
        />
      </CardContent>
    </Card>
  );
}
