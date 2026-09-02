import { Message } from 'postmark';

export type ObjectLiteral = { [key: string]: any };

export interface IntialSupportMailType extends MailGunMessageInterface {
  supportId: string;
}

export interface SupportMailType extends MailGunMessageInterface {
  supportId: string;
  supportMessageId: string;
  initialMessageId?: string;
  messageId?: string;
}

export interface MailGunMessageInterface {
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  attachment?: {
    filename: string;
    data: Buffer;
  }[];
}

export interface MailGunTemplateMessageInterface {
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  template: string;
  variables: object;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
}
