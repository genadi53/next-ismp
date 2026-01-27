"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    dmaAssetFormSchema,
    type DmaAssetFormData,
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { DmaAsset } from "@/server/repositories/dma/types.assets";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";

type AssetFormProps = {
    assetToEdit: DmaAsset | null;
    onFormSubmit: () => void;
};

export const AssetsForm = ({ assetToEdit, onFormSubmit }: AssetFormProps) => {
    const utils = api.useUtils();
    const createMutation = api.dma.assets.create.useMutation({
        onSuccess: () => {
            utils.dma.assets.getAll.invalidate();
        },
    });
    const updateMutation = api.dma.assets.update.useMutation({
        onSuccess: () => {
            utils.dma.assets.getAll.invalidate();
        },
    });

    const form = useForm<DmaAssetFormData>({
        resolver: zodResolver(dmaAssetFormSchema),
        defaultValues: {
            Name: "",
            Marka: "",
            Model: "",
            EdPrice: 0,
            Description: "",
        },
    });

    useEffect(() => {
        if (assetToEdit) {
            form.reset({
                Name: assetToEdit.Name,
                Marka: assetToEdit.Marka || "",
                Model: assetToEdit.Model || "",
                EdPrice: Number(assetToEdit.EdPrice) || 0,
                Description: assetToEdit.Description || "",
            });
        } else {
            form.reset({
                Name: "",
                Marka: "",
                Model: "",
                EdPrice: 0,
                Description: "",
            });
        }
    }, [assetToEdit, form]);

    async function onSubmit(values: DmaAssetFormData) {
        try {
            if (assetToEdit) {
                await updateMutation.mutateAsync({
                    id: assetToEdit.Id,
                    data: {
                        Name: values.Name,
                        Marka: values.Marka ?? null,
                        Model: values.Model ?? null,
                        EdPrice: values.EdPrice ?? null,
                        Description: values.Description ?? null,
                        Currency: "EUR",
                        LastUpdatedFrom: "test@testov",
                    },
                });
                onFormSubmit();
                form.reset();
                return toast({
                    title: "Успешно",
                    description: "Активът е редактиран успешно.",
                });
            }
            await createMutation.mutateAsync({
                Name: values.Name,
                Marka: values.Marka ?? null,
                Model: values.Model ?? null,
                EdPrice: values.EdPrice ?? null,
                Description: values.Description ?? null,
                Currency: "EUR",
                CreatedFrom: "test@testov.com",
            });
            onFormSubmit();
            form.reset();
            return toast({
                title: "Добавен нов актив",
                description: `Активът ${values.Name} е добавен успешно.`,
            });
        } catch {
            return toast({
                title: "Грешка",
                description:
                    "Възникна грешка при обработката на актива. Опитайте отново, или се обадете на администратор.",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="max-w-lg">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 gap-2 w-full py-2.5">
                        <div className="w-full">
                            <FormField
                                control={form.control}
                                name="Name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Име на актива</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Въведете име на актива"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="w-full">
                            <FormField
                                control={form.control}
                                name="Marka"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Марка</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Въведете марка"
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="w-full">
                            <FormField
                                control={form.control}
                                name="Model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Модел</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Въведете модел"
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="w-full">
                            <FormField
                                control={form.control}
                                name="EdPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Единична цена</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Въведете цена"
                                                    value={
                                                        field.value === null || field.value === undefined
                                                            ? ""
                                                            : field.value
                                                    }
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        field.onChange(val === "" ? 0 : Number(val));
                                                    }}
                                                    className="pr-14"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                                    {assetToEdit?.Currency ?? "EUR"} {/* BGN */}
                                                </span>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="w-full">
                            <FormField
                                control={form.control}
                                name="Description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Описание</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Въведете описание на актива"
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                name={field.name}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex flex-row gap-4 pt-2">
                            <Button
                                type="reset"
                                variant={"outline"}
                                className="w-36"
                                onClick={() => form.reset()}
                            >
                                Изчисти
                            </Button>
                            <Button
                                type="submit"
                                variant={"success"}
                                disabled={!form.formState.isValid}
                                className="w-36"
                            >
                                {assetToEdit ? "Редактирай" : "Създай актив"}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
};
