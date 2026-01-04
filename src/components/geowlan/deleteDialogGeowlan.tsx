import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { GeowlanAP } from "@/types/geowlan/types.geowlan";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type GeowlanDeleteDialogProps = {
  geowlanAP: GeowlanAP | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess: () => void;
};

export const GeowlanDeleteDialog = ({
  geowlanAP,
  open,
  onOpenChange,
  onDeleteSuccess,
}: GeowlanDeleteDialogProps) => {
  const utils = api.useUtils();
  const { mutateAsync: deleteGeowlan } = api.geowlan.aps.delete.useMutation({
    onSuccess: () => {
      utils.geowlan.aps.getAll.invalidate();
      toast.success("Успех", {
        description: `Точка ${geowlanAP?.name} беше изтрита успешно.`,
      });
      onDeleteSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Грешка", {
        description:
          error.message || "Възникна грешка при изтриване. Опитайте отново.",
      });
    },
  });

  const handleDelete = async () => {
    if (!geowlanAP) return;

    try {
      await deleteGeowlan({ id: geowlanAP.id });
    } catch (error) {
      console.error("Error deleting geowlan:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Сигурни ли сте?</AlertDialogTitle>
          <AlertDialogDescription>
            Това действие не може да бъде отменено. Това ще изтрие за постоянно
            "{geowlanAP?.name}".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отказ</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Изтрий
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

