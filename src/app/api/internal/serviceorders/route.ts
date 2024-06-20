import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const onlyActive = request.nextUrl.searchParams.get('onlyActive');
  const orderBy = request.nextUrl.searchParams.get('orderBy');
  const tableList = request.nextUrl.searchParams.get('tableList');
  const customerId = request.nextUrl.searchParams.get('customerId');
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

  const registryList = await prisma.serviceOrder.findMany({
    where: {
      companyId: activeCompany?.id,
      ...(onlyActive === 'true' && { isActive: true }),
      ...(customerId && { customerId: customerId }),
    },
    ...(tableList === 'true' && {
      select: {
        id: true,
        orderCode: true,
        isActive: true,
        status: true,
        orderDate: true,
        totalWork: true,
        type: true,
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
    ...(orderBy === 'orderDate' && {
      orderBy: {
        orderDate: 'asc',
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
