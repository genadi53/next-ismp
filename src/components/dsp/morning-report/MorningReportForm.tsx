"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const morningReportFormSchema = z.object({
  ReportDate: z.date({ required_error: "Моля, изберете дата" }),
  StartedFromDispatcher: z.string().min(1, "Моля, въведете диспечер"),
  ReportBody: z.string().min(1, "Моля, въведете съдържание на отчета"),
});

type MorningReportFormData = z.infer<typeof morningReportFormSchema>;

type MorningReportFormProps = {
  dispatcher: string;
  onSuccess?: () => void;
};

export function MorningReportForm({
  dispatcher,
  onSuccess,
}: MorningReportFormProps) {
  const [_templateLoaded, setTemplateLoaded] = useState(false);
  const utils = api.useUtils();

  const { data: template } =
    api.dispatcher.morningReport.getTemplate.useQuery();

  const { mutateAsync: createReport, isPending } =
    api.dispatcher.morningReport.create.useMutation({
      onSuccess: () => {
        toast.success("Успех", {
          description: "Отчетът е създаден успешно.",
        });
        utils.dispatcher.morningReport.getAll.invalidate();
        form.reset();
        setTemplateLoaded(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error("Грешка", {
          description:
            error.message ||
            "Възникна грешка при създаването на отчета. Опитайте отново.",
        });
      },
    });

  const form = useForm<MorningReportFormData>({
    resolver: zodResolver(morningReportFormSchema),
    defaultValues: {
      ReportDate: new Date(),
      StartedFromDispatcher: dispatcher,
      ReportBody: "",
    },
  });

  useEffect(() => {
    form.setValue("StartedFromDispatcher", dispatcher);
  }, [dispatcher, form]);

  const loadTemplate = () => {
    if (template) {
      // Decode base64 template
      try {
        const decoded = Buffer.from(template, "base64").toString("utf-8");
        form.setValue("ReportBody", decoded);
        setTemplateLoaded(true);
        toast.success("Успех", {
          description: "Темплейтът е зареден успешно.",
        });
      } catch (error) {
        // If decoding fails, use template as-is
        form.setValue("ReportBody", template);
        setTemplateLoaded(true);
        toast.success("Успех", {
          description: "Темплейтът е зареден успешно.",
        });
      }
    }
  };

  const onSubmit = async (data: MorningReportFormData) => {
    // Encode report body to base64
    const encodedBody = Buffer.from(data.ReportBody).toString("base64");

    await createReport({
      ReportDate: format(data.ReportDate, "yyyy-MM-dd"),
      StartedFromDispatcher: data.StartedFromDispatcher,
      ReportBody: encodedBody,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="ReportDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    За Дата <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "yyyy-MM-dd")
                          ) : (
                            <span>Изберете дата</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="StartedFromDispatcher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Започната от Диспечер</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      disabled
                      className="border-input bg-muted ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                Запиши
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setTemplateLoaded(false);
                }}
              >
                Изчисти
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={loadTemplate}
                disabled={!template}
              >
                Покажи темплейт &gt;&gt;
              </Button>
            </div>
          </div>

          {/* Right Column - Report Body */}
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="ReportBody"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Отчет <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={20}
                      className="font-mono text-sm"
                      placeholder="Въведете съдържанието на отчета..."
                    />
                  </FormControl>
                  <FormMessage />
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>
                        * За нов ред използвайте бутоните SHIFT+ENTER
                      </strong>
                    </AlertDescription>
                  </Alert>
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
