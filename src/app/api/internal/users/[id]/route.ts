// import { verifyJwt } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { tUserMinimal } from '@/types/User/tUser';
//import { tUserProfile } from '@/types/User/tUser';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

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
    const userWithoutPass: Partial<tUserMinimal> = user;
    delete userWithoutPass.password;
    return NextResponse.json(userWithoutPass);
  }

  return new NextResponse(JSON.stringify(null));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const newUserData = await request.json();
  let newHashedPassword = '';
  let changedEmail = false;
  let changedPassword = false;

  if (!newUserData)
    return new NextResponse(
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
    return new NextResponse(
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
      return new NextResponse(
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
      const userWithoutPass: Partial<tUserMinimal> = updatedUser;
      delete userWithoutPass.password;

      return new NextResponse(
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
      return new NextResponse(
        JSON.stringify({
          message: errorMessage,
        }),
        {
          status: 409,
        },
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: 'Server error',
      }),
      {
        status: 500,
      },
    );
  }

  return new NextResponse(JSON.stringify(null));
}
