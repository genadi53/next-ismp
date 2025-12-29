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
import type { MailGroup } from "@/types/admin/types.mail-group";
import { Mail, PencilIcon, TrashIcon } from "lucide-react";
import { NoResults } from "@/components/NoResults";
import { LoadingSpinner } from "@/components/ui/spinner";

interface MailGroupsTableProps {
  mailGroups: MailGroup[];
  onEdit: (mailGroup: MailGroup) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

export function MailGroupsTable({
  mailGroups,
  onEdit,
  onDelete,
  loading,
}: MailGroupsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <LoadingSpinner size="lg" label="Моля изчакайте..." showLabel />
      </div>
    );
  }

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
              <div className="flex flex-col items-end gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(mailGroup)}
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
                        onClick={() => onDelete(mailGroup.Id)}
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
