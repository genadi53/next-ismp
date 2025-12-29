"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { MailGroupForm } from "@/components/admin/MailGroupForm";
import { MailGroupsTable } from "@/components/admin/MailGroupsTable";
import type { MailGroup } from "@/server/repositories/admin/types.mail-group";
import type { MailGroupFormData } from "@/schemas/admin.schemas";
import { Container } from "@/components/Container";

export function MailGroupsPageClient() {
  const [mailGroups] = api.admin.mailGroups.getAll.useSuspenseQuery();
  const utils = api.useUtils();

  const [showForm, setShowForm] = useState(false);
  const [editingMailGroup, setEditingMailGroup] = useState<MailGroup | null>(
    null,
  );

  const { mutateAsync: createMailGroup, isPending: isCreating } =
    api.admin.mailGroups.create.useMutation({
      onSuccess: () => {
        utils.admin.mailGroups.getAll.invalidate();
        toast.success("Успех", {
          description: "Имейл групата е успешно създадена.",
        });
        setShowForm(false);
        setEditingMailGroup(null);
      },
      onError: (_error) => {
        toast.error("Грешка", {
          description: "Възникна грешка при създаването. Опитайте отново.",
        });
      },
    });

  const { mutateAsync: updateMailGroup, isPending: isUpdating } =
    api.admin.mailGroups.update.useMutation({
      onSuccess: () => {
        utils.admin.mailGroups.getAll.invalidate();
        toast.success("Успех", {
          description: "Имейл групата е успешно обновена.",
        });
        setShowForm(false);
        setEditingMailGroup(null);
      },
      onError: (_error) => {
        toast.error("Грешка", {
          description: "Възникна грешка при обновяването. Опитайте отново.",
        });
      },
    });

  const { mutateAsync: deleteMailGroup } =
    api.admin.mailGroups.delete.useMutation({
      onSuccess: () => {
        utils.admin.mailGroups.getAll.invalidate();
        toast.success("Успех", {
          description: "Имейл групата е успешно изтрита.",
        });
      },
      onError: (_error) => {
        toast.error("Грешка", {
          description: "Възникна грешка при изтриването. Опитайте отново.",
        });
      },
    });

  const handleCreate = () => {
    setEditingMailGroup(null);
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleEdit = (mailGroup: MailGroup) => {
    setEditingMailGroup(mailGroup);
    setShowForm(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMailGroup(null);
  };

  const handleSubmit = async (data: MailGroupFormData): Promise<boolean> => {
    try {
      if (editingMailGroup) {
        await updateMailGroup({
          id: editingMailGroup.Id!,
          data: {
            ...data,
          },
        });
      } else {
        await createMailGroup(data);
      }
      return true;
    } catch (error) {
      console.error("Error saving mail group:", error);
      return false;
    }
  };

  return (
    <Container
      title="Имейл групи"
      description="Управление на потребителски имейл групи за различни модули"
      headerChildren={
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => {
              if (showForm) {
                handleCancel();
              } else {
                handleCreate();
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
                  Добавяне на група
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
          <div className="mb-6">
            <MailGroupForm
              mailGroup={editingMailGroup || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={isCreating || isUpdating}
            />
          </div>
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
                  <CardTitle className="text-xl">Всички имейл групи</CardTitle>
                  <CardDescription>
                    Преглед и управление на съществуващи имейл групи
                  </CardDescription>
                </div>
                {mailGroups && (
                  <Badge variant="outline" className="text-ell-primary text-sm">
                    {mailGroups.length}{" "}
                    {mailGroups.length === 1 ? "група" : "групи"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <MailGroupsTable
                mailGroups={mailGroups || []}
                onEdit={handleEdit}
                onDelete={async (id: number) => {
                  await deleteMailGroup({ id });
                }}
                loading={false}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
