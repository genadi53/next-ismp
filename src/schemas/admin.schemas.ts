import { z } from "zod";

export const mailGroupSchema = z.object({
  module: z.string().min(1, "Модулът е задължителен"),
  action: z.string().min(1, "Действието е задължително"),
  mail_group_name: z.string().min(1, "Името на имейл групата е задължително"),
  mail_group: z.string().min(1, "Имейл групата е задължителна"),
});

export type MailGroupFormData = z.infer<typeof mailGroupSchema>;

export const permissionFormSchema = z.object({
  Username: z.string().min(1, {
    message: "Потребителското име е задължително",
  }),
  main_menu: z.string().min(1, {
    message: "Главното меню е задължително",
  }),
  main_menuName: z.string(),
  submenu: z.string().nullable(),
  submenuName: z.string().nullable(),
  action: z.string().min(1, {
    message: "Действието е задължително",
  }),
  ordermenu: z.number().min(1),
  specialPermisions: z.string().nullable(),
  DMAAdmins: z.number().nullable(),
  Active: z.number().min(0).max(1),
  IsDispatcher: z.number().min(0).max(1).nullable(),
  Departmant: z.string().nullable(),
  ro: z.number().nullable(),
});

export type PermissionFormData = z.infer<typeof permissionFormSchema>;
