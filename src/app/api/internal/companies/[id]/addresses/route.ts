import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newCompanyAddressValidate } from '@/types/Company/tCompanyAddress';

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

  const companyAddresses = await prisma.companyAddress.findMany({
    where: {
      companyId: params.id,
      ...(onlyActive === 'true' && { isActive: true }),
      company: {
        users: {
          every: {
            userId: session.user.id,
          },
        },
      },
    },
  });
  if (!companyAddresses) {
    return new Response(
      JSON.stringify({
        message: `### Company Addresses for ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }

  return new Response(JSON.stringify(companyAddresses));
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
  const validatedSchema = newCompanyAddressValidate.safeParse(body);

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

  //--> CRIAR EMPRESA
  let companyAdress: any = null;
  try {
    companyAdress = await prisma.companyAddress.create({
      data: {
        companyId: params.id,
        ...validatedSchema.data,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Error creating Company',
      }),
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(companyAdress);
}
