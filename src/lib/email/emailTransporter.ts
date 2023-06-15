import { iSendGridMessage } from '@/interfaces/iSendGridMessage';
import getSendgridApiKey from './getSendgridApiKey';

export async function sendgridClientSender(msg: iSendGridMessage) {
  const client = require('@sendgrid/mail');
  client.setApiKey(getSendgridApiKey());
  client
    .send(msg)
    .then((response: any) => {
      //console.log(response[0].statusCode);
      //console.log(response[0].headers);
      return true;
    })
    .catch((err: any) => {
      //console.error(err);
      throw new Error(err);
    });
}
