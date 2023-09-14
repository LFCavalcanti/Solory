import { iSendGridMessage } from '@/interfaces/iSendGridMessage';
import getSendgridApiKey from './getSendgridApiKey';

export async function sendgridClientSender(msg: iSendGridMessage) {
  const client = require('@sendgrid/mail');
  client.setApiKey(getSendgridApiKey());
  client
    .send(msg)
    .then((response: any) => {
      if (response[0].statusCode !== 202 && response[0].statusCode !== 200)
        throw new Error('Error sending e-mail');
      return true;
    })
    .catch((err: any) => {
      throw new Error(err);
    });
}
