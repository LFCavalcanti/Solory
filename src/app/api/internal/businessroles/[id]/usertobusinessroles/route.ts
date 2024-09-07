import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newUserToBusinessRoleValidate } from '@/types/BusinessRole/tUserToBusinessRole';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const onlyActive = request.nextUrl.searchParams.get('onlyActive');
  const tableList = request.nextUrl.searchParams.get('tableList');

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

  const supplierAddresses = await prisma.userToBusinessRole.findMany({
    where: {
      businessRoleId: params.id,
      ...(onlyActive === 'true' && { isActive: true }),
    },
    ...(tableList === 'true' && {
      select: {
        id: true,
        isActive: true,
        createdAt: true,
        disabledAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    }),
  });
  if (!supplierAddresses) {
    return new NextResponse(
      JSON.stringify({
        message: `### Supplier Addresses for ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }

  return new NextResponse(JSON.stringify(supplierAddresses));
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const session = await getServerSession(authOptions);
  const currentDate = new Date().toISOString();

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
  const validatedSchema = newUserToBusinessRoleValidate.safeParse(body);

  if (!validatedSchema.success) {
    console.error(validatedSchema.error);
    return new Response(
      JSON.stringify({
        message: 'Incorrect payload',
      }),
      {
        status: 400,
      },
    );
  }

  //--> CRIA ENDEREÇO
  let userToBusinessRole: any = null;
  try {
    userToBusinessRole = await prisma.userToBusinessRole.create({
      data: {
        ...validatedSchema.data,
        businessRoleId: params.id,
        createdAt: currentDate,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Error creating Supplier Address',
      }),
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(userToBusinessRole);
}
