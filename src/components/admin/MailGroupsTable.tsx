"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MailGroup } from "@/server/repositories/admin/types.mail-group";
import { Mail, PencilIcon, TrashIcon } from "lucide-react";
import { NoResults } from "@/components/NoResults";
import { api } from "@/trpc/react";
import { toast } from "../ui/toast";

interface MailGroupsTableProps {
  mailGroups: MailGroup[];
  onEditClick: (mailGroup: MailGroup) => void;
}

export function MailGroupsTable({
  mailGroups,
  onEditClick,
}: MailGroupsTableProps) {
  const utils = api.useUtils();
  const { mutateAsync: deleteMailGroup } =
    api.admin.mailGroups.delete.useMutation({
      onSuccess: () => {
        utils.admin.mailGroups.getAll.invalidate();
        toast({
          title: "Успех",
          description: "Имейл групата е успешно изтрита.",
        });
      },
      onError: (_error) => {
        toast({
          title: "Грешка",
          description: "Възникна грешка при изтриването. Опитайте отново.",
          variant: "destructive",
        });
      },
    });

  if (mailGroups.length === 0) {
    return (
      <NoResults
        title="Няма намерени имейл групи"
        description="Опитайте отново или се свържете с администратор."
        icon={<Mail className="text-ell-primary/50 size-12" />}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Модул</TableHead>
          <TableHead>Действие</TableHead>
          <TableHead>Име на имейл група</TableHead>
          <TableHead>Имейл група</TableHead>
          <TableHead className="w-[100px]">Редактиране</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mailGroups.map((mailGroup) => (
          <TableRow key={mailGroup.Id || mailGroup.mail_group_name}>
            <TableCell className="font-medium">{mailGroup.module}</TableCell>
            <TableCell>{mailGroup.action}</TableCell>
            <TableCell>{mailGroup.mail_group_name}</TableCell>
            <TableCell>
              <div
                className="flex flex-col whitespace-normal"
                title={mailGroup.mail_group || undefined}
              >
                {mailGroup.mail_group?.split(";").map((email, idx) => (
                  <div key={`${email}-${idx + 1}`}>{email}</div>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-row items-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEditClick(mailGroup)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Изтриване на имейл група
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Сигурни ли сте, че желаете да изтриете имейл групата "
                        {mailGroup.mail_group_name}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отказ</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMailGroup({ id: mailGroup.Id! })}
                        className="bg-destructive hover:bg-destructive/90 text-white"
                      >
                        Изтриване
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
