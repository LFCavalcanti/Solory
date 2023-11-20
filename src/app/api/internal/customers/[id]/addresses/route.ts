import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newCustomerAddressValidate } from '@/types/Customer/tCustomerAddress';

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

  const customerAddresses = await prisma.customerAddress.findMany({
    where: {
      customerId: params.id,
      ...(onlyActive === 'true' && { isActive: true }),
    },
  });
  if (!customerAddresses) {
    return new Response(
      JSON.stringify({
        message: `### Customer Addresses for ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }

  return new Response(JSON.stringify(customerAddresses));
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
  const validatedSchema = newCustomerAddressValidate.safeParse(body);

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
  let customerAdress: any = null;
  try {
    if (validatedSchema.data.isMainAddress) {
      const existingMain = await prisma.customerAddress.findFirst({
        where: { customerId: params.id, isMainAddress: true },
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
    customerAdress = await prisma.customerAddress.create({
      data: {
        customerId: params.id,
        ...validatedSchema.data,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Error creating Customer Address',
      }),
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(customerAdress);
}
