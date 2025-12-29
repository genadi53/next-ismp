"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  mailGroupSchema,
  type MailGroupFormData,
} from "@/schemas/admin.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MailGroup } from "@/types/admin/types.mail-group";
import { toast } from "sonner";

interface MailGroupFormProps {
  mailGroup?: MailGroup;
  onSubmit: (data: MailGroupFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

export function MailGroupForm({
  mailGroup,
  onSubmit,
  onCancel,
  loading,
}: MailGroupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MailGroupFormData>({
    resolver: zodResolver(mailGroupSchema),
    defaultValues: {
      module: mailGroup?.module || "",
      action: mailGroup?.action || "",
      mail_group_name: mailGroup?.mail_group_name || "",
      mail_group: mailGroup?.mail_group || "",
    },
  });

  const handleSubmit = async (data: MailGroupFormData) => {
    setIsSubmitting(true);
    try {
      const success = await onSubmit(data);
      if (success) {
        form.reset();
        toast.success("Успех", {
          description: "Имейл групата е успешно записана.",
        });
        return;
      }
      toast.error("Грешка", {
        description:
          "Възникна грешка при записването на имейл групата. Опитайте отново, или се обадете на администратор.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="animate-in fade-in slide-in-from-top-4 mx-auto w-full max-w-2xl shadow-lg duration-500">
      <CardHeader>
        <CardTitle>
          {mailGroup
            ? "Редактиране на имейл група"
            : "Добавяне на нова имейл група"}
        </CardTitle>
        <CardDescription>
          {mailGroup
            ? "Редактирайте информацията за имейл групата по-долу."
            : "Попълнете информацията за създаване на нова имейл група."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="module"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Модул</FormLabel>
                  <FormControl>
                    <Input placeholder="Въведете име на модул" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Действие</FormLabel>
                  <FormControl>
                    <Input placeholder="Въведете действие" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mail_group_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Име на имейл група</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Въведете име на имейл група"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mail_group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имейли</FormLabel>
                  <FormDescription>
                    Моля, разделете имейлите с ";"
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Въведете потребителски имейли"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                variant="ell"
                disabled={isSubmitting || loading}
                className="flex-1"
              >
                {isSubmitting
                  ? "Запазване..."
                  : mailGroup
                    ? "Редактиране"
                    : "Добавяне"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || loading}
              >
                Отказ
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
