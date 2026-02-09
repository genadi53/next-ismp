"use client";

import { useForm, useWatch } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  geowlanAPFormSchema,
  type GeowlanAPFormData,
} from "@/schemas/geowlan.schemas";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  convertGlobalCoordToLocal,
  convertLocalCoordToGlobal,
} from "@/lib/geowlanCoordinatesConverter";
import type { GeowlanAP } from "@/server/repositories/geowlan";
import { ColorConverter } from "@/lib/ColorConverter";

type GeowlanFormProps = {
  open: boolean;
  geowlanToEdit?: GeowlanAP | undefined;
  setOpen: (open: boolean) => void;
  onFormSubmit: () => void;
};

const defaultColor = "#06b6d4";

export const GeowlanForm = ({
  open,
  setOpen,
  geowlanToEdit,
  onFormSubmit,
}: GeowlanFormProps) => {
  const utils = api.useUtils();
  const { mutateAsync: createGeowlan } = api.geowlan.aps.create.useMutation({
    onSuccess: () => {
      void utils.geowlan.aps.getAll.invalidate();
    },
  });
  const { mutateAsync: updateGeowlan } = api.geowlan.aps.update.useMutation({
    onSuccess: () => {
      void utils.geowlan.aps.getAll.invalidate();
    },
  });
  const [enableGlobal, setEnableGlobal] = useState(true);

  const form = useForm<GeowlanAPFormData>({
    resolver: zodResolver(geowlanAPFormSchema),
    defaultValues: {
      name: "",
      x: 0,
      y: 0,
      enabled: true,
      lat: 0,
      lng: 0,
      mac: "",
      rgb: defaultColor,
      ip: "",
      hardware: "",
      LAN: "",
    },
  });

  const watchedLat = useWatch({ control: form.control, name: "lat" });
  const watchedLng = useWatch({ control: form.control, name: "lng" });
  const watchedX = useWatch({ control: form.control, name: "x" });
  const watchedY = useWatch({ control: form.control, name: "y" });

  // Convert lat/lng to x/y coordinates (Web Mercator projection)
  useEffect(() => {
    if (!enableGlobal) return;
    if (watchedLat !== undefined && watchedLng !== undefined) {
      const lat = Number(watchedLat);
      const lng = Number(watchedLng);

      if (!isNaN(lat) && !isNaN(lng)) {
        const { x, y } = convertGlobalCoordToLocal(lat, lng);
        form.setValue("x", Number(x.toPrecision(7)));
        form.setValue("y", Number(y.toPrecision(7)));
      }
    }
  }, [watchedLat, watchedLng, form, enableGlobal]);

  useEffect(() => {
    if (enableGlobal) return;
    if (watchedX !== undefined && watchedY !== undefined) {
      const x = Number(watchedX);
      const y = Number(watchedY);

      if (!isNaN(x) && !isNaN(y)) {
        const { lat, lng } = convertLocalCoordToGlobal(x, y);
        form.setValue("lat", Number(lat.toFixed(7)));
        form.setValue("lng", Number(lng.toFixed(7)));
      }
    }
  }, [watchedX, watchedY, form, enableGlobal]);

  useEffect(() => {
    if (geowlanToEdit) {
      const x = geowlanToEdit.x ?? 0;
      const y = geowlanToEdit.y ?? 0;
      const { lat, lng } = convertLocalCoordToGlobal(x, y);
      form.reset({
        name: geowlanToEdit.name,
        x: x,
        y: y,
        enabled: geowlanToEdit.enabled ? true : false,
        lat: lat,
        lng: lng,
        hardware: geowlanToEdit.hardware ?? "",
        ip: geowlanToEdit.ip ?? "",
        mac: geowlanToEdit.mac ?? "",
        rgb: geowlanToEdit.rgb
          ? ColorConverter(geowlanToEdit.rgb, false)
          : defaultColor,
        LAN: geowlanToEdit.LAN ?? "",
      });
    }
  }, [geowlanToEdit, form]);

  async function onSubmit(values: GeowlanAPFormData) {
    try {
      if (geowlanToEdit) {
        const dataToUpdate = {
          name: values.name,
          x: values.x ?? 0,
          y: values.y ?? 0,
          enabled: values.enabled,
          apId: geowlanToEdit.apId,
          mac: values.mac ?? null,
          ip: values.ip ?? null,
          hardware: values.hardware ?? null,
          LAN: values.LAN ?? null,
          rgb: values.rgb ? ColorConverter(values.rgb, true) : null,
        };

        await updateGeowlan({
          id: geowlanToEdit.id,
          data: dataToUpdate,
        });
        toast({
          title: "Успешно",
          description: `Точка "${values.name}" е обновена успешно.`,
        });
      } else {
        await createGeowlan({
          name: values.name,
          x: values.x ?? null,
          y: values.y ?? null,
          enabled: values.enabled ?? null,
          mac: values.mac ?? null,
          ip: values.ip ?? null,
          hardware: values.hardware ?? null,
          LAN: values.LAN ?? null,
          rgb: values.rgb ? ColorConverter(values.rgb, true) : null,
        });
        toast({
          title: "Успешно",
          description: `Точка "${values.name}" е добавена успешно.`,
        });
      }
      setOpen(false);
      form.reset();
      onFormSubmit();
    } catch (error) {
      console.error("Error submitting geowlan:", error);
      toast({
        title: "Грешка",
        description: "Възникна грешка при записване. Опитайте отново.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="default"
          type="button"
          className="flex max-w-48 cursor-pointer items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Добави точка
        </Button>
      </DialogTrigger>
      <DialogContent
        className="z-60 max-h-[90vh] overflow-y-auto p-6 sm:max-w-[450px]"
        aria-describedby="geowlan form dialog"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {geowlanToEdit ? "Редактирай" : "Добави нова"} Geowlan точка
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Име</FormLabel>
                  <FormControl>
                    <Input placeholder="Въведете име" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="enable-global"
                checked={enableGlobal}
                onCheckedChange={(checked) => setEnableGlobal(checked)}
              />
              <Label htmlFor="enable-global">
                Използвай глобална координатна система
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="x"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>X координата</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0"
                        disabled={enableGlobal}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="y"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Y координата</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        placeholder="0"
                        disabled={enableGlobal}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ширина (latitude)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0000001"
                        placeholder="0"
                        disabled={!enableGlobal}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дължина (longitude)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0000001"
                        placeholder="0"
                        disabled={!enableGlobal}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mac"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MAC адрес</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="XX:XX:XX:XX:XX:XX"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP адрес</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="192.168.1.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rgb"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RGB цвят</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input placeholder={defaultColor} {...field} />
                        <Input
                          type="color"
                          value={field.value ?? defaultColor}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-9 w-12 rounded border p-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="LAN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LAN информация</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Въведете LAN информация"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="hardware"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Хардуерен компонент</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Въведете хардуерен компонент"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="-mx-2.5 space-y-1 leading-none">
                    <FormLabel>Активна</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Отказ
              </Button>
              <Button type="submit">
                {geowlanToEdit ? "Обнови" : "Добави"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
