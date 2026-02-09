"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { NoResults } from "@/components/NoResults";
import { BlastingPlanForm } from "@/components/pvr/BlastingPlanForm";
import { PVRDataTable } from "@/components/pvr/pvrDataTable";
import { pvrColumns } from "@/components/pvr/pvrColumns";
import type { BlastingPlan } from "@/server/repositories/pvr";
import type { BlastingPlanDataType } from "@/schemas/blastingPlan.schemas";
import { Container } from "@/components/Container";

export function BlastingPlanPageClient() {
  const [editingPlan, setEditingPlan] = useState<BlastingPlan | null>(null);
  const [showForm, setShowForm] = useState(false);

  const utils = api.useUtils();
  const [plans] = api.pvr.blastingPlan.getAll.useSuspenseQuery();

  const { mutateAsync: createPlan, isPending: isCreating } =
    api.pvr.blastingPlan.create.useMutation({
      onSuccess: () => {
        toast({
          title: "Успешно",
          description: "Планът е успешно създаден",
        });
        void utils.pvr.blastingPlan.getAll.invalidate();
        setEditingPlan(null);
        setShowForm(false);
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          description:
            error.message || "Грешка при запазване на плана. Опитайте отново.",
          variant: "destructive",
        });
      },
    });

  const { mutateAsync: updatePlan, isPending: isUpdating } =
    api.pvr.blastingPlan.update.useMutation({
      onSuccess: () => {
        toast({
          title: "Успешно",
          description: "Планът е успешно обновен",
        });
        void utils.pvr.blastingPlan.getAll.invalidate();
        setEditingPlan(null);
        setShowForm(false);
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          description:
            error.message || "Грешка при обновяване на плана. Опитайте отново.",
          variant: "destructive",
        });
      },
    });

  const { mutateAsync: deletePlan } = api.pvr.blastingPlan.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Планът е успешно изтрит",
      });
      void utils.pvr.blastingPlan.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Грешка",
        description:
          error.message || "Грешка при изтриване на плана. Опитайте отново.",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = async (data: BlastingPlanDataType) => {
    try {
      if (editingPlan) {
        await updatePlan({
          id: editingPlan.ID,
          data: {
            OperDate: data.date,
            BlastingField: data.BlastingField ?? null,
            Horizont1: data.Horiz1 ?? null,
            Horizont2: data.Horiz2 ?? null,
            Drill: data.Drill.reduce(
              (prev: string, curr: string, idx: number) =>
                idx === 0 ? (prev += `${curr}`) : (prev += `_${curr}`),
              "",
            ),
            Drill2: null,
            Holes: data.Holes ?? null,
            Konturi: data.Konturi ?? null,
            MineVolume: data.MineVolume ?? null,
            TypeBlast: data.TypeBlast ?? null,
            Disabled: data.Disabled === 1,
            Note: data.Note ?? null,
            userAdded: null,
          },
        });
      } else {
        await createPlan({
          OperDate: data.date,
          BlastingField: data.BlastingField ?? null,
          Horizont1: data.Horiz1 ?? null,
          Horizont2: data.Horiz2 ?? null,
          Drill: data.Drill.reduce(
            (prev: string, curr: string, idx: number) =>
              idx === 0 ? (prev += `${curr}`) : (prev += `_${curr}`),
            "",
          ),
          Drill2: null,
          Holes: data.Holes ?? null,
          Konturi: data.Konturi ?? null,
          MineVolume: data.MineVolume ?? null,
          TypeBlast: data.TypeBlast ?? null,
          Disabled: data.Disabled === 1,
          Note: data.Note ?? null,
          userAdded: null,
        });
      }
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };

  const handleEdit = (plan: BlastingPlan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async (plan: BlastingPlan) => {
    try {
      await deletePlan({ id: plan.ID });
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const handleFormCancel = () => {
    setEditingPlan(null);
    setShowForm(false);
  };

  return (
    <Container
      title="План взривяване"
      description="Добавяне и управление на планове за взривяване"
      headerChildren={
        <div className="flex items-center justify-end">
          <Button
            onClick={() => {
              setShowForm((curr) => !curr);
              if (showForm) {
                setEditingPlan(null);
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
                <Plus className="animate-in fade-in spin-in-0 h-5 w-5 duration-300" />
                <span className="animate-in fade-in slide-in-from-left-2 duration-300">
                  Нов план
                </span>
              </>
            ) : (
              <>
                <X className="animate-in fade-in spin-in-90 h-5 w-5 duration-300" />
                <span className="animate-in fade-in slide-in-from-right-2 duration-300">
                  Затвори
                </span>
              </>
            )}
          </Button>
        </div>
      }
    >

      <div className="space-y-6">
        {/* Add/Edit Plan Form */}
        {showForm && (
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <Plus className="text-ell-primary h-5 w-5" />
                <div>
                  <CardTitle className="text-xl">
                    {editingPlan
                      ? "Редактиране на план"
                      : "Нов план за взривяване"}
                  </CardTitle>
                  <CardDescription>
                    Попълнете формата за създаване или редакция на план
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <BlastingPlanForm
                editingPlan={editingPlan}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                isLoading={isCreating || isUpdating}
              />
            </CardContent>
          </Card>
        )}

        {/* Plans List */}
        {!showForm && (
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Списък с планове</CardTitle>
                  <CardDescription>
                    Преглед и управление на съществуващи планове за взривяване
                  </CardDescription>
                </div>
                {plans && (
                  <Badge variant="outline" className="text-ell-primary text-sm">
                    {plans.length} {plans.length === 1 ? "план" : "плана"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!plans || plans.length === 0 ? (
                <NoResults
                  icon={<AlertCircle className="text-ell-primary size-12" />}
                  title="Няма намерени планове"
                  description="Няма намерени планове за взривяване. Започнете като добавите първия план."
                />
              ) : (
                <PVRDataTable
                  columns={pvrColumns({
                    actions: {
                      delete: (plan) => {
                        void handleDelete(plan);
                      },
                      edit: handleEdit,
                    },
                  })}
                  data={plans}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
