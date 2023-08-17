// import { verifyJwt } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { tUserProfile } from '@/types/User/tUser';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  id: string;
}
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: params.id,
    },
  });

  if (user) {
    const { password, ...userWithoutPass } = user;
    return NextResponse.json(userWithoutPass);
  }

  return new Response(JSON.stringify(null));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  let newUserData = await request.json();
  let newHashedPassword = '';
  let changedEmail = false;
  let changedPassword = false;

  if (!newUserData)
    return new Response(
      JSON.stringify({
        message: 'User data not informed',
      }),
      {
        status: 400,
      },
    );

  const userData = await prisma.user.findFirstOrThrow({
    where: {
      id: params.id,
    },
  });

  if (!userData)
    return new Response(
      JSON.stringify({
        message: 'User not found',
      }),
      {
        status: 409,
      },
    );

  changedEmail =
    newUserData.email && newUserData.email !== userData.email ? true : false;

  if (newUserData.newPassword) {
    if (
      userData.password &&
      newUserData.currentPassword &&
      !(await bcrypt.compare(newUserData.currentPassword, userData.password))
    ) {
      return new Response(
        JSON.stringify(
          'To alter your password, you need to type the current one.',
        ),
        {
          status: 401,
        },
      );
    }
    newHashedPassword = await bcrypt.hash(newUserData.newPassword, 10);
    changedPassword = true;
  }
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userData.id,
      },
      data: {
        name: newUserData.name,
        ...(changedEmail && {
          emailVerified: null,
          email: newUserData.email,
        }),
        ...(newHashedPassword && { password: newHashedPassword }),
      },
    });

    if (updatedUser) {
      const { password, ...userWithoutPass } = updatedUser;

      return new Response(
        JSON.stringify({ ...userWithoutPass, changedEmail, changedPassword }),
      );
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      let errorMessage = '';
      if (error.code === 'P2002') {
        errorMessage =
          'There is a unique constraint violation, a new user cannot be created or updated with this email';
      } else {
        errorMessage = 'Database error updating registry';
      }
      return new Response(
        JSON.stringify({
          message: errorMessage,
        }),
        {
          status: 409,
        },
      );
    }

    return new Response(
      JSON.stringify({
        message: 'Server error',
      }),
      {
        status: 500,
      },
    );
  }

  return new Response(JSON.stringify(null));
}
