"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  dmaDocumentAssetDetailFormSchema,
  type DmaDocumentAssetDetailFormData,
} from "@/schemas/dma.schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { format } from "date-fns";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";
import { Combobox } from "@/components/ui/combobox";
import { DMA_MEA, DMA_EXPLOTATION_MEASURES } from "@/lib/constants";
import type { DmaDocumentAsset } from "@/server/repositories/dma/types.documents";

type DocumentAssetDetailFormProps = {
  documentId: number;
  assetToEdit?: DmaDocumentAsset | null;
  onSuccess: () => void;
  onCancel?: () => void;
};

function toNumber(v: string | number | undefined | null): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isNaN(n) ? null : n;
}

export function DocumentAssetDetailForm({
  documentId,
  assetToEdit,
  onSuccess,
  onCancel,
}: DocumentAssetDetailFormProps) {
  const utils = api.useUtils();
  const { data: assets } = api.dma.assets.getAll.useQuery(undefined);
  const createMutation = api.dma.documents.createAsset.useMutation({
    onSuccess: () => {
      void utils.dma.documents.getAssets.invalidate({ documentId });
    },
  });
  const updateMutation = api.dma.documents.updateAsset.useMutation({
    onSuccess: () => {
      void utils.dma.documents.getAssets.invalidate({ documentId });
    },
  });
  const deleteMutation = api.dma.documents.deleteAsset.useMutation({
    onSuccess: () => {
      void utils.dma.documents.getAssets.invalidate({ documentId });
    },
  });

  const form = useForm<DmaDocumentAssetDetailFormData>({
    resolver: zodResolver(dmaDocumentAssetDetailFormSchema),
    defaultValues: {
      CompId: 0,
      CompUnits: 0,
      Price: 0,
      Mea: "",
      SerialNum: "",
      DetExploatation: undefined,
      DetExploatationMeasure: "",
      DetDateBuy: "",
      DetStartExploatation: "",
      DetApprovedDMA: "",
    },
  });

  useEffect(() => {
    if (assetToEdit && assets?.length) {
      const exists = assets.some((a) => a.Id === assetToEdit.CompId);
      if (exists) {
        form.reset({
          CompId: assetToEdit.CompId,
          CompUnits: assetToEdit.CompUnits ?? 0,
          Price: assetToEdit.Price ?? 0,
          Mea: assetToEdit.Mea ?? "",
          SerialNum: assetToEdit.SerialNum ?? "",
          DetExploatation: assetToEdit.DetExploatation ?? "",
          DetExploatationMeasure: assetToEdit.DetExploatationMeasure ?? "",
          DetDateBuy: assetToEdit.DetDateBuy ?? "",
          DetStartExploatation: assetToEdit.DetStartExploatation ?? "",
          DetApprovedDMA: assetToEdit.DetApprovedDMA ?? "",
        });
      }
    } else if (!assetToEdit) {
      form.reset({
        CompId: 0,
        CompUnits: 0,
        Price: 0,
        Mea: "",
        SerialNum: "",
        DetExploatation: undefined,
        DetExploatationMeasure: "",
        DetDateBuy: "",
        DetStartExploatation: "",
        DetApprovedDMA: "",
      });
    }
  }, [assetToEdit, assets, form]);

  async function onSubmit(values: DmaDocumentAssetDetailFormData) {
    try {
      const data = {
        CompId: values.CompId,
        CompUnits: values.CompUnits,
        Price: values.Price,
        Mea: values.Mea ?? null,
        SerialNum: values.SerialNum ?? null,
        DetExploatation: toNumber(values.DetExploatation),
        DetExploatationMeasure: values.DetExploatationMeasure ?? null,
        DetDateBuy: values.DetDateBuy ?? null,
        DetStartExploatation: values.DetStartExploatation ?? null,
        DetApprovedDMA: values.DetApprovedDMA ?? null,
      };
      if (assetToEdit) {
        await updateMutation.mutateAsync({
          documentId,
          assetId: assetToEdit.Id,
          data,
        });
        toast({
          title: "Успешно",
          description: "Детайлът на актива е редактиран успешно.",
        });
      } else {
        await createMutation.mutateAsync({ documentId, data });
        toast({
          title: "Успешно",
          description: "Детайлът на актива е добавен успешно.",
        });
      }
      form.reset();
      onSuccess();
    } catch {
      toast({
        title: "Грешка",
        description:
          assetToEdit
            ? "Възникна грешка при редактирането на детайла."
            : "Възникна грешка при добавянето на детайла.",
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    if (
      !assetToEdit ||
      !confirm("Сигурни ли сте, че искате да изтриете този детайл на актива?")
    )
      return;
    try {
      await deleteMutation.mutateAsync({
        documentId,
        assetId: assetToEdit.Id,
      });
      toast({
        title: "Успешно",
        description: "Детайлът на актива е изтрит успешно.",
      });
      onSuccess();
    } catch {
      toast({
        title: "Грешка",
        description: "Възникна грешка при изтриването на детайла.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="CompId"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Актив</FormLabel>
                <FormControl>
                  {assets && assets.length > 0 ? (
                    <Combobox
                      list={assets.map((a) => ({
                        label: a.Name,
                        value: String(a.Id),
                      }))}
                      placeholderString="Изберете актив"
                      value={(field.value ?? 0) > 0 ? String(field.value) : ""}
                      onValueChange={(v) =>
                        field.onChange(v ? Number(v) : 0)
                      }
                      triggerStyles="min-w-0 w-full"
                    />
                  ) : null}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="CompUnits"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Количество</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="Въведете количество"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="Price"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Цена</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Въведете цена"
                    {...field}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="Mea"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Мерна единица</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="min-w-0 w-full">
                      <SelectValue placeholder="Изберете мерна единица" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-w-2xl">
                    {DMA_MEA.map((mea) => (
                      <SelectItem key={mea} value={mea} className="h-9">
                        {mea}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="SerialNum"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Сериен номер</FormLabel>
                <FormControl>
                  <Input placeholder="Въведете сериен номер" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="DetDateBuy"
            render={({ field }) => (
              <FormItem className="min-w-0 flex flex-col">
                <FormLabel>Дата на покупка</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          typeof field.value === "string" ? (
                            field.value
                          ) : (
                            format(new Date(field.value), "yyyy-MM-dd")
                          )
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
                      selected={
                        field.value
                          ? new Date(
                            typeof field.value === "string"
                              ? field.value
                              : field.value,
                          )
                          : undefined
                      }
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="DetStartExploatation"
            render={({ field }) => (
              <FormItem className="min-w-0 flex flex-col">
                <FormLabel>Дата на начало на експлоатация</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          typeof field.value === "string" ? (
                            field.value
                          ) : (
                            format(new Date(field.value), "yyyy-MM-dd")
                          )
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
                      selected={
                        field.value
                          ? new Date(
                            typeof field.value === "string"
                              ? field.value
                              : field.value,
                          )
                          : undefined
                      }
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="DetApprovedDMA"
            render={({ field }) => (
              <FormItem className="min-w-0 flex flex-col">
                <FormLabel>Дата на одобрение ДМА</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          typeof field.value === "string" ? (
                            field.value
                          ) : (
                            format(new Date(field.value), "yyyy-MM-dd")
                          )
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
                      selected={
                        field.value
                          ? new Date(
                            typeof field.value === "string"
                              ? field.value
                              : field.value,
                          )
                          : undefined
                      }
                      onSelect={(date) =>
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                      }
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="DetExploatation"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Срок на експлоатация</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Въведете срок на експлоатация"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? undefined : (Number(v) || v));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="DetExploatationMeasure"
            render={({ field }) => (
              <FormItem className="min-w-0">
                <FormLabel>Мерна единица за експлоатация</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="min-w-0 w-full">
                      <SelectValue placeholder="Изберете мерна единица" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-w-2xl">
                    {DMA_EXPLOTATION_MEASURES.map((measure) => (
                      <SelectItem
                        key={measure}
                        value={measure}
                        className="h-9"
                      >
                        {measure}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          {assetToEdit && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Изтрий
            </Button>
          )}
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Отказ
            </Button>
          )}
          <Button type="submit" variant="ell">
            {assetToEdit ? "Запази промените" : "Добави детайл"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
