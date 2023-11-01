import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newSupplierContactValidate } from '@/types/Supplier/tSupplierContact';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const onlyActive = request.nextUrl.searchParams.get('onlyActive');
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

  const registryList = await prisma.supplierContact.findMany({
    where: {
      supplierId: params.id,
      ...(onlyActive === 'true' && { isActive: true }),
    },
  });
  if (!registryList) {
    return new Response(
      JSON.stringify({
        message: `### Supplier Addresses for ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }

  return new Response(JSON.stringify(registryList));
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const session = await getServerSession(authOptions);
  const createdAt = new Date().toISOString();

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
  const validatedSchema = newSupplierContactValidate.safeParse(body);

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
  let createdRegistry: any = null;
  try {
    createdRegistry = await prisma.supplierContact.create({
      data: {
        createdAt,
        supplierId: params.id,
        ...validatedSchema.data,
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

  return NextResponse.json(createdRegistry);
}
