import { z } from "zod";

export const loadsSchema = z
  .object({
    Adddate: z.date({ required_error: "Въведете дата" }),
    Shift: z.number({ required_error: "Въведете смена" }).min(1).max(4),
    Shovel: z.string({ required_error: "Въведете багер" }).min(1),
    Truck: z.string({ required_error: "Въведете камион" }).min(1),
    Br: z
      .number({ required_error: "Въведете брой" })
      .min(1, { message: "Броят трябва да е по-голям от 0" }),
    AddMaterial: z
      .string({ required_error: "Въведете добавен материал" })
      .nullish(),
    RemoveMaterial: z
      .string({ required_error: "Въведете премахнат материал" })
      .nullish(),
  })
  .refine(
    (data) => {
      // Check if exactly one of AddMaterial or RemoveMaterial has a value
      const hasAddMaterial = data.AddMaterial?.trim() !== "";
      const hasRemoveMaterial =
        data.RemoveMaterial?.trim() !== "";

      // Return true if exactly one has a value (XOR logic)
      return hasAddMaterial !== hasRemoveMaterial;
    },
    {
      message:
        "Трябва да въведете или добавен материал, или премахнат материал, но не и двете. Изчистете формата и опитайте отново.",
      path: ["AddMaterial", "RemoveMaterial"], // This will show the error on the AddMaterial field
    },
  );

export type LoadsFormData = z.infer<typeof loadsSchema>;
