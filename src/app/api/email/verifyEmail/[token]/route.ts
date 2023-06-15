// import { verifyJwt } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import verifyEmailVerificationToken from '@/lib/tokens/verifyEmailVerificationToken';

export async function POST(
  request: Request,
  { params }: { params: { token: string } },
) {
  const currentDate = new Date();
  const verifiedToken =
    params.token &&
    (await verifyEmailVerificationToken(params.token).catch((error) => {
      console.error(error);
    }));
  if (!verifiedToken)
    return new Response(
      JSON.stringify({
        error: 'Unauthorized or token expired',
      }),
      {
        status: 401,
      },
    );

  const userData = JSON.parse(verifiedToken.jti);
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userData.id,
      },
    });

    if (user && user.emailVerified) {
      return new Response(JSON.stringify('User e-mail already verified.'), {
        status: 409,
      });
    }

    const validationEntry = await prisma.emailValidationToken.findFirst({
      where: {
        AND: [{ token: params.token }, { ActivatedAt: null }],
      },
    });

    if (
      validationEntry &&
      validationEntry.userId == userData.id &&
      new Date(validationEntry.expiresAt) > currentDate
    ) {
      const validatedEntry = await prisma.emailValidationToken.update({
        where: {
          identifier: validationEntry.identifier,
        },
        data: {
          ActivatedAt: currentDate.toISOString(),
        },
      });

      const updatedUser = await prisma.user.update({
        where: {
          id: userData.id,
        },
        data: {
          emailVerified: currentDate.toISOString(),
        },
      });

      if (updatedUser && validatedEntry) {
        return new Response(JSON.stringify('User E-mail address verified.'));
      }
    } else {
      return new Response(
        JSON.stringify({
          error: 'Invalid or Expired Token',
        }),
        {
          status: 401,
        },
      );
    }
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        error: 'Service unavailable',
      }),
      {
        status: 503,
      },
    );
  }
}
