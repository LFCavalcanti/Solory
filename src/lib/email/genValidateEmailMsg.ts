import { iSendGridMessage } from '@/interfaces/iSendGridMessage';
import getNextBaseUrl from '../getNextBaseUrl';

export default function genValidateEmailMsg(
  token: string,
  expiration: Date,
  email: string,
): iSendGridMessage {
  const validationUrl = `${getNextBaseUrl()}/auth/verifyemail?token=${token}`;
  const expDate = new Date(expiration).toLocaleString();
  const html = `
    <!doctype html>
    <html>
      <head>
        <style>
          .button {
            background-color: #066D87; /* Green */
            border: none;
            color: white;
            font-weight: 700;
            padding: 10px 15px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 14px;
            font-family: sans-serif;
            margin-left: 50px;
            text-decoration: none;
          }
          p {
            font-size: 14px;
            font-family: sans-serif;
            color: #333333;
          }

        </style>
      </head>
      <body>
        <p>Olá,</P>
        <p>Clique no botão abaixo para validar seu e-mail:</P>
        <a href="${validationUrl}" target="_blank" class="button" style="text-decoration: none; color: #f2f2f2;">VALIDAR</a>
        <br>
        <p>Se preferir clique utilize o link:</p>
        <p>${validationUrl}</p>
        <br>
        <p>Você tem até <strong>${expDate}</strong> para validar seu endereço de e-mail com esse link. Após esse horário será necessário gerar uma nova validação.</p>
      </body>
    </html>
  `;

  return {
    to: email,
    from: {
      email: 'solory@variant42.tech',
      name: 'Solory App',
    },
    subject: 'Verifique seu endereço de e-mail',
    html,
  };
}
