export type MailGroup = {
  Id: number;
  module: string | null;
  action: string | null;
  mail_group_name: string;
  mail_group: string | null;
};

export type CreateMailGroupInput = {
  module: string | null;
  action: string | null;
  mail_group_name: string;
  mail_group: string | null;
};

export type UpdateMailGroupInput = CreateMailGroupInput;
