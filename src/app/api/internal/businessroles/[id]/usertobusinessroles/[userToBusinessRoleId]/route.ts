import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { userToBusinessRoleValidate } from '@/types/BusinessRole/tUserToBusinessRole';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; userToBusinessRoleId: string } },
) {
  const session = await getServerSession(authOptions);
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

  const userToBusinessRole = await prisma.userToBusinessRole.findFirst({
    where: {
      id: params.userToBusinessRoleId,
      businessRoleId: params.id,
    },
  });

  if (!userToBusinessRole) {
    return new NextResponse(
      JSON.stringify({
        message: `### ID ${params.userToBusinessRoleId} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  return new NextResponse(JSON.stringify(userToBusinessRole));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userToBusinessRoleId: string } },
) {
  const session = await getServerSession(authOptions);
  const body = await request.json();

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
  const validatedSchema = userToBusinessRoleValidate.safeParse(body);
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

  const userToBusinessRole = await prisma.userToBusinessRole.findFirst({
    where: {
      id: params.userToBusinessRoleId,
      businessRoleId: params.id,
    },
  });

  if (!userToBusinessRole) {
    return new NextResponse(
      JSON.stringify({
        message: `### ID ${params.userToBusinessRoleId} does not exist or insufficient permission`,
      }),
      {
        status: 403,
      },
    );
  }

  const updatedSupplierAddress = await prisma.userToBusinessRole.update({
    where: { id: params.userToBusinessRoleId },
    data: {
      ...validatedSchema.data,
    },
  });

  if (!updatedSupplierAddress) {
    return new NextResponse(
      JSON.stringify({
        message: 'Error updating supplier address',
      }),
      {
        status: 409,
      },
    );
  }

  return new NextResponse(JSON.stringify(updatedSupplierAddress));
}
