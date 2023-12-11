import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { contractItemValidate } from '@/types/Contract/tContractItem';

export async function GET(
  request: Request,
  { params }: { params: { id: string; itemId: string } },
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

  const registryData = await prisma.contractItem.findFirst({
    where: {
      id: params.itemId,
      contractId: params.id,
    },
  });

  if (!registryData) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.itemId} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  return new Response(JSON.stringify(registryData));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; itemId: string } },
) {
  const session = await getServerSession(authOptions);
  const body = await request.json();

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

  if (body.id) {
    return new Response(
      JSON.stringify({
        message: 'Entity Id must not be present in payload body',
      }),
      {
        status: 400,
      },
    );
  }

  //--> CHECAR PAYLOAD SE ESTA COM OS DADOS CORRETOS
  const validatedSchema = contractItemValidate.safeParse(body);
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

  const currRegistry = await prisma.contractItem.findFirst({
    where: {
      id: params.itemId,
      contractId: params.id,
    },
  });

  if (!currRegistry) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.itemId} does not exist or insufficient permission`,
      }),
      {
        status: 403,
      },
    );
  }

  const updatedRegistry = await prisma.contractItem.update({
    where: { id: params.itemId },
    data: {
      ...validatedSchema.data,
    },
  });

  if (!updatedRegistry) {
    return new Response(
      JSON.stringify({
        message: 'Error updating contract item',
      }),
      {
        status: 409,
      },
    );
  }

  return new Response(JSON.stringify(updatedRegistry));
}
