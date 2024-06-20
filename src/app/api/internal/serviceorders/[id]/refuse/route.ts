import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const currDate = new Date();

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

  const companyGroup = await prisma.companyGroup.findFirst({
    where: {
      id: activeCompany?.companyGroupId,
    },
  });

  if (!activeCompany || !companyGroup) {
    return new NextResponse(
      JSON.stringify({
        message:
          'Error retrieving Company or Company Group, probably need permissions.',
      }),
      {
        status: 401,
      },
    );
  }

  const currentData = await prisma.serviceOrder.findFirst({
    where: {
      id: params.id,
      companyId: activeCompany.id,
    },
  });

  if (!currentData) {
    return new NextResponse(
      JSON.stringify({
        message: 'Error retrieving Service Order, probably need permissions.',
      }),
      {
        status: 404,
      },
    );
  }

  if (!(currentData.status === 'DRAFT' || currentData.status === 'ISSUED')) {
    return new NextResponse(
      JSON.stringify({
        message: 'Only Service Order in Draft or Issued can be Cancelled',
      }),
      {
        status: 400,
      },
    );
  }

  //--> CRIAR PRODUTO
  let serviceOrder: any = null;
  try {
    serviceOrder = await prisma.serviceOrder.update({
      where: {
        id: currentData.id,
      },
      data: {
        status: 'REFUSED',
      },
    });
    await prisma.serviceOrderEvent.create({
      data: {
        serviceOrderId: currentData.id,
        timeStamp: currDate.toISOString(),
        eventType: 'REFUSAL',
        isActionAutomatic: false,
        description: `ORDEM DE SERVIÇO RECUSADA POR ${session.user.name} EM ${currDate.toLocaleDateString()}`,
        userId: session.user.id,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({
        message: 'Error approving the Service Order',
      }),
      {
        status: 500,
      },
    );
  }

  //--> RETORNAR PRODUTO
  return new NextResponse(JSON.stringify(serviceOrder));
}
