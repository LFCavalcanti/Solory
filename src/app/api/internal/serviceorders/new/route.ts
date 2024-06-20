import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newServiceOrderValidate } from '@/types/ServiceOrder/tServiceOrder';

export async function POST(request: NextRequest) {
  const body = await request.json();
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

  //--> CHECAR PAYLOAD SE ESTA COM OS DADOS CORRETOS
  const validatedSchema = newServiceOrderValidate.safeParse(body);
  if (!validatedSchema.success) {
    console.error(validatedSchema.error);
    return new NextResponse(
      JSON.stringify({
        message: 'Incorrect payload',
      }),
      {
        status: 400,
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
  //--> CRIAR PRODUTO
  let serviceOrder: any = null;
  try {
    serviceOrder = await prisma.serviceOrder.create({
      data: {
        createdAt: new Date().toISOString(),
        companyId: activeCompany?.id,
        ...validatedSchema.data,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({
        message: 'Error creating the Company Group',
      }),
      {
        status: 500,
      },
    );
  }

  //--> RETORNAR PRODUTO
  return new NextResponse(JSON.stringify(serviceOrder));
}
