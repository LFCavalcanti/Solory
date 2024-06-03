import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const onlyActive = request.nextUrl.searchParams.get('onlyActive');
  const orderBy = request.nextUrl.searchParams.get('orderBy');
  const tableList = request.nextUrl.searchParams.get('tableList');
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return new Response(
      JSON.stringify({
        message: 'Invalid Session',
      }),
      {
        status: 401,
      },
    );
  }

  const userSettings = await prisma.userSettings.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  const activeCompany = await prisma.company.findFirst({
    where: {
      id: userSettings?.activeCompanyId,
      users: {
        every: {
          userId: session.user.id,
        },
      },
    },
  });

  const registryList = await prisma.project.findMany({
    where: {
      companyId: activeCompany?.id,
      NOT: {
        status: 'REVIEWED',
      },
      ...(onlyActive === 'true' && { isActive: true }),
    },
    ...(tableList === 'true' && {
      select: {
        id: true,
        version: true,
        name: true,
        type: true,
        status: true,
        progress: true,
        startDate: true,
        endDate: true,
        isActive: true,
        createdAt: true,
        disabledAt: true,
        customer: {
          select: {
            aliasName: true,
          },
        },
      },
    }),
    ...(orderBy === 'id' && {
      orderBy: {
        id: 'asc',
      },
    }),
    ...(orderBy === 'name' && {
      orderBy: {
        name: 'asc',
      },
    }),
  });

  if (!registryList) {
    return new Response(
      JSON.stringify({
        message:
          'Error retrieving a list of Products or you do not have permission to any',
      }),
      {
        status: 403,
      },
    );
  }

  return NextResponse.json(registryList);
}
