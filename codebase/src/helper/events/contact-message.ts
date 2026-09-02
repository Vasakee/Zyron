export type ContactMessageEvent = {
  name: string;
  subject: string;
  email: string;
  phone: string;
  message: string;
  hasAttachment: boolean;
  attachments?: {
    filename: string;
    data: Buffer;
    contentType: string;
  }[];
};
