"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { NoResults } from "@/components/NoResults";
import { api } from "@/trpc/react";
import { LoadsForm } from "@/components/loads/loadsForm";
import { DataTableLoads } from "@/components/loads/tableLoads";
import { loadsColumns } from "@/components/loads/columnsLoads";
import type { Load } from "@/types/loads";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Container } from "@/components/Container";

export function LoadsPageClient() {
  const router = useRouter();
  const [loadToEdit, setLoadToEdit] = useState<Load | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  const [loads] = api.loads.loads.getAll.useSuspenseQuery();
  const [unsentLoads] = api.loads.loads.getUnsent.useSuspenseQuery();

  const handleEdit = (load: Load) => {
    setLoadToEdit(load);
    setShowForm(true);
    // Scroll to form with a slight delay for animation
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleCancelEdit = () => {
    setLoadToEdit(null);
    setShowForm(false);
  };

  const handleDelete = (load: Load) => {
    console.log("Delete load:", load);
    // TODO: Implement delete functionality
  };

  return (
    <Container
      title="Промяна на Курсове"
      description="Добавяне и редактиране на липсващи курсове"
      headerChildren={
        <div className="mb-4 flex items-center gap-2">
          <Button
            className="min-w-28"
            variant="outline"
            size="lg"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              router.push("/loads/send");
            }}
          >
            {unsentLoads && unsentLoads.length > 0
              ? `Изпрати (${unsentLoads.length}) записа`
              : "Изпрати промени"}
          </Button>
          <Button
            onClick={() => {
              setShowForm((currShown) => !currShown);
              if (showForm) {
                handleCancelEdit();
              }
            }}
            variant={showForm ? "outline" : "ell"}
            size="lg"
            className={cn(
              "gap-2 transition-all duration-300 ease-in-out",
              showForm &&
                "text-ell-primary hover:text-ell-primary shadow-ell-primary/40",
            )}
          >
            {!showForm ? (
              <>
                <Plus className="h-5 w-5 animate-in fade-in spin-in-0 duration-300" />
                <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                  Нов Запис
                </span>
              </>
            ) : (
              <>
                <X className="h-5 w-5 animate-in fade-in spin-in-90 duration-300" />
                <span className="animate-in fade-in slide-in-from-right-2 duration-300">
                  Затвори
                </span>
              </>
            )}
          </Button>
        </div>
      }
    >
      {/* Form Section with smooth transition */}
      <div
        className={cn(
          "origin-top transform transition-all duration-500 ease-in-out",
          showForm
            ? "max-h-[2000px] translate-y-0 scale-y-100 opacity-100"
            : "max-h-0 -translate-y-4 scale-y-95 overflow-hidden opacity-0",
        )}
      >
        {showForm && (
          <Card className="mb-6 animate-in fade-in slide-in-from-top-4 shadow-lg duration-500">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {loadToEdit ? "Редактиране на Курс" : "Нов Курс"}
                  </CardTitle>
                  <CardDescription>
                    {loadToEdit
                      ? "Актуализирайте данните за избрания курс"
                      : "Попълнете формата за добавяне на нов курс"}
                  </CardDescription>
                </div>
                {loadToEdit && (
                  <Badge variant="secondary" className="ml-2">
                    Режим на редакция
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <LoadsForm
                loadToEdit={loadToEdit}
                onCancelEdit={handleCancelEdit}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Table Section with smooth transition */}
      <div
        className={cn(
          "origin-top transform transition-all duration-500 ease-in-out",
          !showForm
            ? "max-h-[10000px] translate-y-0 scale-y-100 opacity-100"
            : "max-h-0 -translate-y-4 scale-y-95 overflow-hidden opacity-0",
        )}
      >
        {!showForm && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 shadow-lg duration-500">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    История на Промените
                  </CardTitle>
                  <CardDescription>
                    Преглед на скорошни промени на курсове
                  </CardDescription>
                </div>
                {loads && (
                  <Badge variant="outline" className="text-ell-primary text-sm">
                    {loads.length} {loads.length === 1 ? "запис" : "записа"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loads && loads.length === 0 && (
                <NoResults
                  title="Няма намерени записи"
                  description="Опитайте отново или се свържете с администратор."
                  icon={<AlertCircle className="text-ell-primary size-12" />}
                />
              )}

              {loads && loads.length > 0 && (
                <DataTableLoads
                  columns={loadsColumns({
                    actions: {
                      edit: handleEdit,
                      delete: handleDelete,
                    },
                  })}
                  data={loads}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
