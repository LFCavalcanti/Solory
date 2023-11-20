import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { customerContactValidate } from '@/types/Customer/tCustomerContact';

export async function GET(
  request: Request,
  { params }: { params: { id: string; contactId: string } },
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

  const foundRegistry = await prisma.customerContact.findFirst({
    where: {
      id: params.contactId,
      customerId: params.id,
    },
  });

  if (!foundRegistry) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.contactId} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  return new Response(JSON.stringify(foundRegistry));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; contactId: string } },
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
  const validatedSchema = customerContactValidate.safeParse(body);
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

  const currentRegistry = await prisma.customerContact.findFirst({
    where: {
      id: params.contactId,
      customerId: params.id,
    },
  });

  if (!currentRegistry) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.contactId} does not exist or insufficient permission`,
      }),
      {
        status: 403,
      },
    );
  }

  const updatedRegistry = await prisma.customerContact.update({
    where: { id: params.contactId },
    data: {
      ...validatedSchema.data,
    },
  });

  if (!updatedRegistry) {
    return new Response(
      JSON.stringify({
        message: 'Error updating customer address',
      }),
      {
        status: 409,
      },
    );
  }

  return new Response(JSON.stringify(updatedRegistry));
}
