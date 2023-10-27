import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newSupplierAddressValidate } from '@/types/Supplier/tSupplierAddress';

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

  const supplierAddresses = await prisma.supplierAddress.findMany({
    where: {
      supplierId: params.id,
      ...(onlyActive === 'true' && { isActive: true }),
    },
  });
  if (!supplierAddresses) {
    return new Response(
      JSON.stringify({
        message: `### Supplier Addresses for ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }

  return new Response(JSON.stringify(supplierAddresses));
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
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
  const validatedSchema = newSupplierAddressValidate.safeParse(body);

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
  let supplierAdress: any = null;
  try {
    if (validatedSchema.data.isMainAddress) {
      const existingMain = await prisma.supplierAddress.findFirst({
        where: { supplierId: params.id, isMainAddress: true },
      });
      if (existingMain) {
        return new Response(
          JSON.stringify({
            message: 'Only one adddress can be main',
          }),
          {
            status: 400,
          },
        );
      }
    }
    supplierAdress = await prisma.supplierAddress.create({
      data: {
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

  return NextResponse.json(supplierAdress);
}
