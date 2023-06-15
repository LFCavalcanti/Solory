export interface iSendGridMessage {
  to: string;
  from: {
    email: string;
    name: string;
  };
  subject: string;
  text?: string;
  html: string;
}
