import type { MailGroupFormData } from "@/schemas/admin.schemas";

export type MailGroup = {
  Id: number;
  module: string | null;
  action: string | null;
  mail_group_name: string;
  mail_group: string | null;
};

export type CreateMailGroupInput = MailGroupFormData;

export type UpdateMailGroupInput = MailGroupFormData;
