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
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { NoResults } from "@/components/NoResults";
import { LoadingSpinner } from "@/components/ui/spinner";

// Placeholder for BlastingPlanForm component
function BlastingPlanFormPlaceholder({
  editingPlan,
  onSubmit,
  onCancel,
  isLoading,
}: {
  editingPlan: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="p-4 border rounded-lg bg-muted/50">
      <p className="text-sm text-muted-foreground">
        BlastingPlanForm component will be migrated in the next phase.
      </p>
    </div>
  );
}

// Placeholder for PVRDataTable component
function PVRDataTablePlaceholder({
  columns,
  data,
}: {
  columns: any[];
  data: any[];
}) {
  return (
    <div className="p-4 border rounded-lg bg-muted/50">
      <p className="text-sm text-muted-foreground">
        PVRDataTable component will be migrated in the next phase. Found {data.length} plans.
      </p>
    </div>
  );
}

export function BlastingPlanPageClient() {
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  const utils = api.useUtils();
  const [plans] = api.pvr.blastingPlan.getAll.useSuspenseQuery();

  const { mutateAsync: createPlan, isPending: isCreating } =
    api.pvr.blastingPlan.create.useMutation({
      onSuccess: () => {
        toast.success("Успешно", {
          description: "Планът е успешно създаден",
        });
        utils.pvr.blastingPlan.getAll.invalidate();
        setEditingPlan(null);
        setShowForm(false);
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message || "Грешка при запазване на плана. Опитайте отново.",
        });
      },
    });

  const { mutateAsync: updatePlan, isPending: isUpdating } =
    api.pvr.blastingPlan.update.useMutation({
      onSuccess: () => {
        toast.success("Успешно", {
          description: "Планът е успешно обновен",
        });
        utils.pvr.blastingPlan.getAll.invalidate();
        setEditingPlan(null);
        setShowForm(false);
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message || "Грешка при обновяване на плана. Опитайте отново.",
        });
      },
    });

  const { mutateAsync: deletePlan, isPending: isDeleting } =
    api.pvr.blastingPlan.delete.useMutation({
      onSuccess: () => {
        toast.success("Успешно", {
          description: "Планът е успешно изтрит",
        });
        utils.pvr.blastingPlan.getAll.invalidate();
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message || "Грешка при изтриване на плана. Опитайте отново.",
        });
      },
    });

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingPlan) {
        await updatePlan({
          id: editingPlan.ID,
          data: {
            OperDate: data.date,
            BlastingField: data.BlastingField,
            Horizont1: data.Horiz1,
            Horizont2: data.Horiz2,
            Drill: data.Drill.reduce(
              (prev: string, curr: string, idx: number) =>
                idx === 0 ? (prev += `${curr}`) : (prev += `,${curr}`),
              "",
            ),
            Drill2: null,
            Holes: data.Holes,
            Konturi: data.Konturi,
            MineVolume: data.MineVolume,
            TypeBlast: data.TypeBlast,
            Disabled: data.Disabled,
            Note: data.Note,
            userAdded: null,
          },
        });
      } else {
        await createPlan({
          OperDate: data.date,
          BlastingField: data.BlastingField,
          Horizont1: data.Horiz1,
          Horizont2: data.Horiz2,
          Drill: data.Drill.reduce(
            (prev: string, curr: string, idx: number) =>
              idx === 0 ? (prev += `${curr}`) : (prev += `,${curr}`),
            "",
          ),
          Drill2: null,
          Holes: data.Holes,
          Konturi: data.Konturi,
          MineVolume: data.MineVolume,
          TypeBlast: data.TypeBlast,
          Disabled: data.Disabled,
          Note: data.Note,
          userAdded: null,
        });
      }
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePlan({ id });
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const handleFormCancel = () => {
    setEditingPlan(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-end">
        <Button
          onClick={() => {
            setShowForm((curr) => !curr);
            if (showForm) {
              setEditingPlan(null);
            }
          }}
          variant={showForm ? "outline" : "default"}
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
          <CardContent className="pt-6">
            <BlastingPlanFormPlaceholder
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
              <PVRDataTablePlaceholder
                columns={[]}
                data={plans}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

