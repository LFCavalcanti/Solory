import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { businessRoleValidate } from '@/types/BusinessRole/tBusinessRole';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

  const businessRole = await prisma.businessRole.findFirst({
    where: {
      id: params.id,
      companyId: activeCompany?.id,
    },
  });
  if (!businessRole) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  return new NextResponse(JSON.stringify(businessRole));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const currentDate = new Date().toISOString();

  if (!session || !session.user.id) {
    return new NextResponse(
      JSON.stringify({
        message: 'Invalid Session',
      }),
      {
        status: 401,
      },
    );
  }

  if (!body) {
    return new NextResponse(
      JSON.stringify({
        message: 'Incorrect payload',
      }),
      {
        status: 400,
      },
    );
  }

  delete body.id;

  if (body.id) {
    return new NextResponse(
      JSON.stringify({
        message: 'Entity Id must not be present in payload body',
      }),
      {
        status: 400,
      },
    );
  }

  //--> CHECAR PAYLOAD SE ESTA COM OS DADOS CORRETOS
  const validatedSchema = businessRoleValidate.safeParse(body);
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

  const businessRole = await prisma.businessRole.findFirst({
    where: {
      id: params.id,
    },
  });

  if (!businessRole) {
    return new NextResponse(
      JSON.stringify({
        message: `### ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 403,
      },
    );
  }

  const updatedBusinessRole = await prisma.businessRole.update({
    where: { id: params.id },
    data: {
      ...(validatedSchema.data.isActive == false &&
        businessRole.isActive == true && {
          disabledAt: currentDate,
        }),
      ...(validatedSchema.data.isActive == true &&
        businessRole.isActive == false && {
          disabledAt: null,
        }),
      ...validatedSchema.data,
    },
  });

  if (!updatedBusinessRole) {
    return new NextResponse(
      JSON.stringify({
        message: 'Error updating supplier',
      }),
      {
        status: 409,
      },
    );
  }

  return new NextResponse(JSON.stringify(updatedBusinessRole));
}
