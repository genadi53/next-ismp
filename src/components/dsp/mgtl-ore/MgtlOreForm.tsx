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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { CalendarIcon, Save, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import { api } from "@/trpc/react";
import { toast } from "@/components/ui/toast";
import {
  mgtlOreFormSchema,
  type MgtlOreFormData,
} from "@/schemas/dispatcher.schemas";

type MgtlOreFormProps = {
  onSuccess?: () => void;
  isReadOnly?: boolean;
};

export function MgtlOreForm({
  onSuccess,
  isReadOnly = false,
}: MgtlOreFormProps) {
  const utils = api.useUtils();

  const { mutateAsync: createMgtlOre, isPending } =
    api.dispatcher.mgtlOre.create.useMutation({
      onSuccess: () => {
        toast({
          title: "Успех",
          description: "Данните за извоза на руда са записани успешно.",
        });
        void utils.dispatcher.mgtlOre.getAll.invalidate();
        form.reset();
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: "Грешка",
          variant: "destructive",
          description:
            error.message ||
            "Възникна грешка при записването на данните. Опитайте отново.",
        });
      },
    });

  const form = useForm<MgtlOreFormData>({
    resolver: zodResolver(mgtlOreFormSchema),
    defaultValues: {
      OperDate: undefined,
      sclad1: "",
      MGTL1: "",
      sclad2: "",
      MGTL2: "",
      sclad3: "",
      MGTL3: "",
    },
  });

  const parseNumber = (value: string | undefined): number | null => {
    if (!value || value.trim() === "") return null;
    const parsed = parseFloat(value.replace(",", "."));
    return isNaN(parsed) ? null : parsed;
  };

  const handleSubmit = async (data: MgtlOreFormData) => {
    // Validate that date is not in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (data.OperDate > today) {
      toast({
        title: "Грешка",
        description: "Въведена е бъдеща дата!",
        variant: "destructive",
      });
      return;
    }

    // Validate that at least one value is entered
    if (
      !data.sclad1 &&
      !data.MGTL1 &&
      !data.sclad2 &&
      !data.MGTL2 &&
      !data.sclad3 &&
      !data.MGTL3
    ) {
      toast({
        title: "Грешка",
        description: "Моля, въведете поне една стойност.",
        variant: "destructive",
      });
      return;
    }

    await createMgtlOre({
      OperDate: format(data.OperDate, "yyyy-MM-dd"),
      Izvoz1: parseNumber(data.sclad1),
      Mgtl1: parseNumber(data.MGTL1),
      Izvoz3: parseNumber(data.sclad2),
      Mgtl3: parseNumber(data.MGTL2),
      Izvoz4: parseNumber(data.sclad3),
      Mgtl4: parseNumber(data.MGTL3),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Date Picker */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <FormField
            control={form.control}
            name="OperDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  Дата <span className="text-red-500">*</span>
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        disabled={isReadOnly}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "yyyy-MM-dd", { locale: bg })
                        ) : (
                          <span>Въведете дата</span>
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
                      locale={bg}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Shift Inputs */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* First Shift */}
          <div className="space-y-4">
            <h4 className="text-muted-foreground text-sm font-medium">
              Първа смяна
            </h4>
            <FormField
              control={form.control}
              name="sclad1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Склад първа смяна</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Въведете данните за първа смяна"
                      disabled={isReadOnly || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="MGTL1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>МГТЛ първа смяна</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Въведете данните за първа смяна"
                      disabled={isReadOnly || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Second Shift */}
          <div className="space-y-4">
            <h4 className="text-muted-foreground text-sm font-medium">
              Втора смяна
            </h4>
            <FormField
              control={form.control}
              name="sclad2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Склад втора смяна</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Въведете данните за втора смяна"
                      disabled={isReadOnly || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="MGTL2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>МГТЛ втора смяна</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Въведете данните за втора смяна"
                      disabled={isReadOnly || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Night Shift */}
          <div className="space-y-4">
            <h4 className="text-muted-foreground text-sm font-medium">
              Нощна смяна
            </h4>
            <FormField
              control={form.control}
              name="sclad3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Склад нощна смяна</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Въведете данните за нощна смяна"
                      disabled={isReadOnly || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="MGTL3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>МГТЛ нощна смяна</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Въведете данните за нощна смяна"
                      disabled={isReadOnly || isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isReadOnly || isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isPending ? "Записване..." : "Запиши"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isReadOnly || isPending}
            onClick={() => form.reset()}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Изчисти
          </Button>
        </div>
      </form>
    </Form>
  );
}
