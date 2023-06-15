import { sendgridClientSender } from '@/lib/email/emailTransporter';
import genValidateEmailMsg from '@/lib/email/genValidateEmailMsg';
import prisma from '@/lib/prisma';
import signEmailVerificationToken from '@/lib/tokens/signEmailVerificationToken';

interface requestBody {
  id: string;
  forceResend?: boolean;
}

export async function POST(request: Request) {
  const body: requestBody = await request.json();
  const currentDate = new Date();

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: body.id,
      },
    });

    if (user && user.emailVerified) {
      return new Response(JSON.stringify('User e-mail already verified.'), {
        status: 409,
      });
    }

    const existingValidationEntry = await prisma.emailValidationToken.findFirst(
      {
        where: {
          AND: [
            { userId: user?.id },
            { ActivatedAt: null },
            {
              expiresAt: {
                gt: currentDate,
              },
            },
          ],
        },
      },
    );

    if (
      user &&
      user.email &&
      existingValidationEntry &&
      existingValidationEntry.token
    ) {
      if (body.forceResend) {
        const message = genValidateEmailMsg(
          existingValidationEntry.token,
          new Date(existingValidationEntry.expiresAt),
          user.email,
        );
        sendgridClientSender(message);
        return new Response(JSON.stringify('Verification sent - again'));
      }
      return new Response(
        JSON.stringify({
          alreadySent: true,
          expiration: existingValidationEntry.expiresAt,
        }),
        {
          status: 409,
        },
      );
    }

    if (user && user.email && user.id) {
      const issueDate = Date.now();
      const createdAt = new Date(issueDate).toISOString();
      const expiresAt = new Date(
        issueDate + 0.083 * 60 * 60 * 1000,
      ).toISOString();
      const verificationToken = await signEmailVerificationToken(
        JSON.stringify({ id: body.id }),
        issueDate,
      );

      const newValidationEntry = await prisma.emailValidationToken.create({
        data: {
          token: verificationToken,
          createdAt,
          expiresAt,
          userId: user.id,
        },
      });

      const message = genValidateEmailMsg(
        newValidationEntry.token,
        new Date(newValidationEntry.expiresAt),
        user.email,
      );

      sendgridClientSender(message);

      return new Response(JSON.stringify('Verification sent'));
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify('Service unavailable'), {
      status: 503,
    });
  }
}
