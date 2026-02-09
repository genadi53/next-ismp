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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/toast";
import { z } from "zod";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Send } from "lucide-react";
import type { MorningReport } from "@/server/repositories/dispatcher";
import { format } from "date-fns";

const morningReportEditSchema = z.object({
  ReportBody: z.string().min(1, "Моля, въведете съдържание на отчета"),
});

type MorningReportEditData = z.infer<typeof morningReportEditSchema>;

type MorningReportEditProps = {
  report: MorningReport;
  dispatcher: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function MorningReportEdit({
  report,
  dispatcher,
  onSuccess,
  onCancel,
}: MorningReportEditProps) {
  const [sendReport, setSendReport] = useState(false);
  const utils = api.useUtils();

  const { mutateAsync: updateReport, isPending: isUpdating } =
    api.dispatcher.morningReport.update.useMutation({
      onSuccess: async () => {
        if (sendReport) {
          // Send the report
          try {
            await sendReportMutation({
              id: report.ID,
              data: {
                SentOn: new Date().toISOString(),
                SentFrom: dispatcher,
              },
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (_error) {
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

  // UTF-8 base64 decode helper
  const decodeBase64UTF8 = (str: string): string => {
    try {
      // Decode base64
      const binaryString = atob(str);
      // Convert binary string to UTF-8
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      // Decode UTF-8
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      return str;
    }
  };

  // Decode report body from base64
  const getDecodedReportBody = () => {
    if (!report.ReportBody) return "";
    return decodeBase64UTF8(report.ReportBody);
  };

  const form = useForm<MorningReportEditData>({
    resolver: zodResolver(morningReportEditSchema),
    defaultValues: {
      ReportBody: getDecodedReportBody(),
    },
  });

  // UTF-8 base64 encode helper
  const encodeBase64UTF8 = (str: string): string => {
    try {
      // Encode UTF-8 to bytes
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);
      // Convert bytes to binary string
      let binaryString = "";
      for (const byte of bytes) {
        binaryString += String.fromCharCode(byte);
      }
      // Encode to base64
      return btoa(binaryString);
    } catch {
      return str;
    }
  };

  const onSubmit = async (data: MorningReportEditData) => {
    // Encode report body to base64 with UTF-8 support
    const encodedBody = encodeBase64UTF8(data.ReportBody);

    await updateReport({
      id: report.ID,
      data: {
        CompletedFromDispatcher: dispatcher,
        CompletedOn: new Date().toISOString(),
        ReportBody: encodedBody,
      },
    });
  };

  const handleSaveAndSend = () => {
    setSendReport(true);
    void form.handleSubmit(onSubmit)();
  };

  const isLoading = isUpdating || isSending;
  const isSent = !!report.SentOn;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">За Дата</label>
              <Input
                value={report.ReportDate}
                disabled
                className="bg-muted mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Започната от Диспечер
              </label>
              <Input
                value={report.StartedFromDispatcher ?? ""}
                disabled
                className="bg-muted mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Приключен от Диспечер
              </label>
              <Input
                value={report.CompletedFromDispatcher ?? ""}
                disabled
                className="bg-muted mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Приключен на</label>
              <Input
                value={
                  report.CompletedOn
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
                value={report.SentFrom ?? ""}
                disabled
                className="bg-muted mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Изпратен на</label>
              <Input
                value={
                  report.SentOn
                    ? format(new Date(report.SentOn), "yyyy-MM-dd")
                    : ""
                }
                disabled
                className="bg-muted mt-1"
              />
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button type="submit" disabled={isLoading || isSent}>
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
                  Изход
                </Button>
              )}
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
                      disabled={isSent}
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
                      {isSent && (
                        <span className="mt-1 block text-red-600">
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
