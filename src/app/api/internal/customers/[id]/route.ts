import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { customerValidate } from '@/types/Customer/tCustomer';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
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

  const customer = await prisma.customer.findFirst({
    where: {
      id: params.id,
    },
  });
  if (!customer) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  return new Response(JSON.stringify(customer));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const currentDate = new Date().toISOString();

  if (!session || !session.user || !session.user.id) {
    return new Response(
      JSON.stringify({
        message: 'Invalid Session',
      }),
      {
        status: 401,
      },
    );
  }

  if (!body) {
    return new Response(
      JSON.stringify({
        message: 'Incorrect payload',
      }),
      {
        status: 400,
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
  const validatedSchema = customerValidate.safeParse(body);
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

  const customer = await prisma.customer.findFirst({
    where: {
      id: params.id,
    },
  });

  if (!customer) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 403,
      },
    );
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id: params.id },
    data: {
      ...(validatedSchema.data.isActive == false &&
        customer.isActive == true && {
          disabledAt: currentDate,
        }),
      ...(validatedSchema.data.isActive == true &&
        customer.isActive == false && {
          disabledAt: null,
        }),
      ...validatedSchema.data,
    },
  });

  if (!updatedCustomer) {
    return new Response(
      JSON.stringify({
        message: 'Error updating customer',
      }),
      {
        status: 409,
      },
    );
  }

  return new Response(JSON.stringify(updatedCustomer));
}
