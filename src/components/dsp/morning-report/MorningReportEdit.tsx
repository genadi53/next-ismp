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
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/toast";
import { z } from "zod";
import { useRef, useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Lightbulb, Send } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import type { MorningReport } from "@/server/repositories/dispatcher";
import { format } from "date-fns";
import { decodeBase64, decodeHtmlEntities, encodeBase64UTF8 } from "@/lib/utf-decoder";
import { env } from "@/env";
import { defaultEditorConfig, ToolbarConfig } from "@/config/editor.config";

type MorningReportEditProps = {
  report?: MorningReport | null;
  dispatcher: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const template: string = `&lt;p&gt;Добро утро. &lt;br&gt;&lt;br&gt;&lt;span style=&quot;color: rgb(224, 62, 45);&quot;&gt;&lt;strong&gt;Първа смяна:&lt;/strong&gt;&lt;/span&gt;&lt;br&gt;Багери &amp;ndash;&amp;nbsp;&lt;br&gt;Багери подаващи Руда:&amp;nbsp;&lt;br&gt;Руда се подава на:&amp;nbsp;&lt;br&gt;Багери подаващи Откривка :&amp;nbsp;&lt;br&gt;Коли &amp;ndash;&amp;nbsp;&lt;br&gt;Престой МГТЛ, часове &amp;ndash;&amp;nbsp;&lt;br&gt;Празен питател:&amp;nbsp;&lt;/p&gt;  &lt;p&gt;&lt;br&gt;&lt;span style=&quot;color: rgb(224, 62, 45);&quot;&gt;&lt;strong&gt;Втора смяна :&amp;nbsp;&lt;/strong&gt;&lt;/span&gt;&lt;br&gt;Багери &amp;ndash;&amp;nbsp;&lt;br&gt;Багери подаващи Руда:&amp;nbsp;&lt;br&gt;Руда се подава на:&amp;nbsp;&lt;br&gt;Багери подаващи Откривка :&amp;nbsp;&lt;br&gt;Коли &amp;ndash; &amp;nbsp;&lt;br&gt;Престой МГТЛ, часове &amp;ndash;&amp;nbsp;&lt;br&gt;Празен питател:&amp;nbsp;&lt;br&gt;&amp;nbsp;&lt;br&gt;&lt;span style=&quot;color: rgb(224, 62, 45);&quot;&gt;&lt;strong&gt;Трета смяна:&lt;/strong&gt;&lt;/span&gt;&lt;br&gt;Багери &amp;ndash;&amp;nbsp;&lt;br&gt;Багери подаващи Руда:&amp;nbsp;&lt;br&gt;Руда се подава на :&amp;nbsp;&lt;br&gt;Багери подаващи Откривка :&amp;nbsp;&lt;br&gt;Коли &amp;ndash; &amp;nbsp;&lt;br&gt;Престой МГТЛ, часове &amp;ndash;&amp;nbsp;&lt;br&gt;Празен питател:&amp;nbsp;&lt;/p&gt;  &lt;p&gt;&lt;br&gt;&lt;strong&gt;Проблеми и Аварии:&lt;/strong&gt;&lt;/p&gt;  &lt;p&gt;&amp;nbsp;&lt;/p&gt;`;

const morningReportCreateSchema = z.object({
  ReportDate: z.date({ required_error: "Моля, изберете дата" }),
  StartedFromDispatcher: z.string().min(1, "Моля, въведете диспечер"),
  ReportBody: z.string().min(1, "Моля, въведете съдържание на отчета"),
});

type MorningReportFormData = z.infer<typeof morningReportCreateSchema>;

const getDefaultValues = (report?: MorningReport | null, currentDispatcher?: string): MorningReportFormData => {
  if (report) {
    const base64Decoded = decodeBase64(report.ReportBody ?? "");
    const reportBody = base64Decoded ? decodeHtmlEntities(base64Decoded) : "";
    return {
      ReportDate: new Date(report.ReportDate),
      StartedFromDispatcher: report.StartedFromDispatcher ?? "",
      ReportBody: reportBody,
    };
  }
  return {
    ReportDate: new Date(),
    StartedFromDispatcher: currentDispatcher ?? "",
    ReportBody: "",
  };
};



export function MorningReportEdit({
  report,
  dispatcher,
  onSuccess,
  onCancel,
}: MorningReportEditProps) {
  const isEditMode = !!report;
  const sendReportRef = useRef(false);
  const [, setTemplateLoaded] = useState(false);
  const utils = api.useUtils();

  // const { data: template } = api.dispatcher.morningReport.getTemplate.useQuery(
  //   undefined,
  //   { enabled: !isEditMode },
  // );


  const form = useForm<MorningReportFormData>({
    resolver: zodResolver(morningReportCreateSchema),
    defaultValues: getDefaultValues(report, dispatcher),
  });

  useEffect(() => {
    form.reset(getDefaultValues(report, dispatcher));
  }, [report, dispatcher]);

  useEffect(() => {
    if (!isEditMode) {
      form.setValue("StartedFromDispatcher", dispatcher);
    }
  }, [dispatcher, isEditMode, form]);

  const { mutateAsync: updateReport, isPending: isUpdating } =
    api.dispatcher.morningReport.update.useMutation({
      onSuccess: async () => {
        if (report && sendReportRef.current) {
          sendReportRef.current = false;
          try {
            await sendReportMutation({
              id: report.ID,
              data: { SentOn: new Date().toISOString() },
            });
          } catch {
            toast({
              title: "Грешка",
              description:
                "Отчетът е запазен, но възникна грешка при изпращането.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Успех",
            description: "Отчетът е запазен успешно.",
          });
        }
        void utils.dispatcher.morningReport.getAll.invalidate();
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          description:
            error.message ||
            "Възникна грешка при запазването на отчета. Опитайте отново.",
          variant: "destructive",
        });
      },
    });

  const { mutateAsync: sendReportMutation, isPending: isSending } =
    api.dispatcher.morningReport.send.useMutation({
      onSuccess: () => {
        toast({
          title: "Успех",
          description: "Отчетът е изпратен успешно.",
        });
        void utils.dispatcher.morningReport.getAll.invalidate();
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          description:
            error.message ||
            "Възникна грешка при изпращането на отчета. Опитайте отново.",
          variant: "destructive",
        });
      },
    });

  const { mutateAsync: createReport, isPending: isCreating } =
    api.dispatcher.morningReport.create.useMutation({
      onSuccess: () => {
        toast({
          title: "Успех",
          description: "Отчетът е създаден успешно.",
        });
        void utils.dispatcher.morningReport.getAll.invalidate();
        form.reset({
          ReportDate: new Date(),
          StartedFromDispatcher: dispatcher,
          ReportBody: "",
        });
        setTemplateLoaded(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          description:
            error.message ||
            "Възникна грешка при създаването на отчета. Опитайте отново.",
          variant: "destructive",
        });
      },
    });

  const loadTemplate = () => {
    if (template) {
      try {
        const base64Decoded = decodeBase64(template);
        const decodedTemplate = decodeHtmlEntities(base64Decoded);
        form.setValue("ReportBody", decodedTemplate);
        setTemplateLoaded(true);
      } catch {
        form.setValue("ReportBody", template);
        setTemplateLoaded(true);
        toast({
          title: "Грешка",
          description: "Възникна грешка при зареждането на темплейта.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Грешка",
        description: "Темплейтът не е наличен.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    form.reset({
      ReportDate: new Date(),
      StartedFromDispatcher: dispatcher,
      ReportBody: "",
    });
    setTemplateLoaded(false);
  };

  const onSubmitEdit = async (data: MorningReportFormData) => {
    if (!report) return;
    const encodedBody = encodeBase64UTF8(data.ReportBody);

    await updateReport({
      id: report.ID,
      data: {
        CompletedOn: new Date().toISOString(),
        ReportBody: encodedBody,
      },
    });
  };

  const onSubmitCreate = async (data: MorningReportFormData) => {
    const encodedBody = encodeBase64UTF8(data.ReportBody);

    await createReport({
      ReportDate: format(data.ReportDate, "yyyy-MM-dd"),
      ReportBody: encodedBody,
    });
  };

  const onSubmit = isEditMode ? onSubmitEdit : onSubmitCreate;

  const handleSaveAndSend = () => {
    if (!report) return;
    sendReportRef.current = true;
    void form.handleSubmit(onSubmitEdit)();
  };

  const isLoading = isUpdating || isSending || isCreating;
  const isSent = !!report?.SentOn;

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
                          disabled={isEditMode}
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
                    <Input
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <label className="text-sm font-medium">
                Приключен от Диспечер
              </label>
              <Input
                value={report?.CompletedFromDispatcher ?? ""}
                disabled
                className="bg-muted mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Приключен на</label>
              <Input
                value={
                  report?.CompletedOn
                    ? format(new Date(report.CompletedOn), "yyyy-MM-dd")
                    : ""
                }
                disabled
                className="bg-muted mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Изпратен от</label>
              <Input
                value={report?.SentFrom ?? ""}
                disabled
                className="bg-muted mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Изпратен на</label>
              <Input
                value={
                  report?.SentOn
                    ? format(new Date(report.SentOn), "yyyy-MM-dd")
                    : ""
                }
                disabled
                className="bg-muted mt-1"
              />
            </div>

            <div className="flex flex-col gap-2 pt-4">

              {isEditMode ? (
                <>

                  <Button
                    type="submit"
                    disabled={isLoading || (isEditMode && isSent)}
                  >
                    Запиши
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleSaveAndSend}
                    disabled={isLoading || isSent}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Запиши и Изпрати
                  </Button>
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      disabled={isLoading}
                    >
                      Отказ от редакция
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    type="reset"
                    variant="outline"
                    onClick={handleClear}
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
                  <Button
                    variant={"ell"}
                    type="submit"
                    disabled={isLoading || (isEditMode && isSent)}
                  >
                    Запиши
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Report Body */}
          <div className="md:col-span-2 space-y-2">
            <FormField
              control={form.control}
              name="ReportBody"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Отчет <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="border-2 border-gray-200 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
                      <Editor
                        apiKey={env.NEXT_PUBLIC_TINYMCE_API_KEY}
                        value={field.value}
                        onEditorChange={(content) => field.onChange(content)}
                        disabled={isSent}
                        init={{
                          ...defaultEditorConfig,
                          toolbar: ToolbarConfig(isSent),
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  <Alert className="bg-blue-50 border-blue-200">
                    <Lightbulb className="size-6 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm flex flex-col gap-1">
                      <strong>Съвет:</strong> За нов ред използвайте SHIFT+ENTER
                      {isSent && (
                        <span className="mt-1 text-red-600">
                          Отчетът вече е изпратен и не може да бъде редактиран.
                        </span>
                      )}
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
