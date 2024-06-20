import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newContractDocumentApproverValidate } from '@/types/Contract/tContractDocumentApprover';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const onlyActive = request.nextUrl.searchParams.get('onlyActive');
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

  const registryList = await prisma.contractDocumentApprover.findMany({
    where: {
      contractId: params.id,
      ...(onlyActive === 'true' && { isActive: true }),
    },
  });
  if (!registryList) {
    return new NextResponse(
      JSON.stringify({
        message: `### Contract Items for ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }

  return new NextResponse(JSON.stringify(registryList));
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
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

  //--> CHECAR PAYLOAD SE ESTA COM OS DADOS CORRETOS
  const validatedSchema = newContractDocumentApproverValidate.safeParse(body);

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

  //--> CRIA REGISTRO
  let newRegistry: any = null;
  try {
    newRegistry = await prisma.contractDocumentApprover.create({
      data: {
        ...validatedSchema.data,
        contractId: params.id,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({
        message: 'Error creating Customer Address',
      }),
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(newRegistry);
}
