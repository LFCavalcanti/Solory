import prisma from '@/lib/prisma';
import {
  newUserSettingsValidate,
  userSettingsValidate,
} from '@/types/User/Settings/tUserSettings';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await prisma.user.findFirst({
    where: {
      id: params.id,
    },
  });

  if (!user)
    return new NextResponse(
      JSON.stringify({
        message: 'Invalid User data',
      }),
      {
        status: 400,
      },
    );

  const userSettings = await prisma.userSettings.findFirst({
    where: {
      userId: user.id,
    },
  });

  if (!userSettings)
    return new NextResponse(
      JSON.stringify({
        message: 'User settings not found',
      }),
      {
        status: 404,
      },
    );

  return new NextResponse(JSON.stringify(userSettings));
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const settingsData = await request.json();
  if (!settingsData)
    return new NextResponse(
      JSON.stringify({
        message: 'Settings data not informed',
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

  const currUserSettings = await prisma.userSettings.findFirst({
    where: {
      userId: userData.id,
    },
  });

  if (!currUserSettings) {
    const validatedNewSettingsData =
      newUserSettingsValidate.safeParse(settingsData);
    if (!validatedNewSettingsData.success)
      return new NextResponse(
        JSON.stringify({
          message: 'Invalid Settings Data',
        }),
        {
          status: 400,
        },
      );
    const createdSettings = await prisma.userSettings.create({
      data: validatedNewSettingsData.data,
    });

    if (!createdSettings)
      return new NextResponse(
        JSON.stringify({
          message: 'Error creating User Settings',
        }),
        {
          status: 500,
        },
      );
    return new NextResponse(JSON.stringify(createdSettings));
  }

  const validatedSettingsData = userSettingsValidate.safeParse(settingsData);

  if (!validatedSettingsData.success)
    return new NextResponse(
      JSON.stringify({
        message: 'Invalid Settings Data',
      }),
      {
        status: 400,
      },
    );

  delete validatedSettingsData.data.id;

  const updatedSettings = await prisma.userSettings.update({
    where: { id: currUserSettings.id },
    data: validatedSettingsData.data,
  });

  if (!updatedSettings)
    return new NextResponse(
      JSON.stringify({
        message: 'Error updating User Settings',
      }),
      {
        status: 500,
      },
    );
  return new NextResponse(JSON.stringify(updatedSettings));
}
