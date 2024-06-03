import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const onlyActive = request.nextUrl.searchParams.get('onlyActive');
  const orderBy = request.nextUrl.searchParams.get('orderBy');
  const selectOptions = request.nextUrl.searchParams.get('selectOptions');
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

  const contracts = await prisma.contract.findMany({
    where: {
      ...(onlyActive === 'true' && { isActive: true }),
      companyId: activeCompany?.id,
      customerId: params.id,
    },
    ...(selectOptions === 'true' && {
      select: {
        id: true,
        description: true,
      },
    }),
    ...(orderBy === 'id' && {
      orderBy: {
        id: 'asc',
      },
    }),
    ...(orderBy === 'description' && {
      orderBy: {
        description: 'asc',
      },
    }),
  });

  if (!contracts) {
    return new Response(
      JSON.stringify({
        message:
          'Error retrieving a list of Contracts or you do not have permission to any',
      }),
      {
        status: 403,
      },
    );
  }

  if (selectOptions === 'true') {
    const contractsSelectList = contracts.map((contract) => ({
      value: contract.id!,
      label: contract.description!,
    }));
    return NextResponse.json(contractsSelectList);
  }

  return NextResponse.json(contracts);
}
