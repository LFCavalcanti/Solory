import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { contractDocumentApproverValidate } from '@/types/Contract/tContractDocumentApprover';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string; contractDocumentApproverId: string } },
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

  const registryData = await prisma.contractDocumentApprover.findFirst({
    where: {
      id: params.contractDocumentApproverId,
      contractId: params.id,
    },
  });

  if (!registryData) {
    console.error(registryData);
    return new NextResponse(
      JSON.stringify({
        message: `### ID ${params.contractDocumentApproverId} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  return new Response(JSON.stringify(registryData));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; contractDocumentApproverId: string } },
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
  const validatedSchema = contractDocumentApproverValidate.safeParse(body);
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

  const currRegistry = await prisma.contractDocumentApprover.findFirst({
    where: {
      id: params.contractDocumentApproverId,
      contractId: params.id,
    },
  });

  if (!currRegistry) {
    console.error(currRegistry);
    return new NextResponse(
      JSON.stringify({
        message: `### ID ${params.contractDocumentApproverId} does not exist or insufficient permission`,
      }),
      {
        status: 403,
      },
    );
  }

  const updatedRegistry = await prisma.contractDocumentApprover.update({
    where: { id: params.contractDocumentApproverId },
    data: {
      ...validatedSchema.data,
    },
  });

  if (!updatedRegistry) {
    return new NextResponse(
      JSON.stringify({
        message: 'Error updating contract item',
      }),
      {
        status: 409,
      },
    );
  }

  return new NextResponse(JSON.stringify(updatedRegistry));
}
