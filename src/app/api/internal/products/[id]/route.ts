import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { productValidate } from '@/types/Product/tProduct';

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

  const product = await prisma.product.findFirst({
    where: {
      id: params.id,
    },
  });
  if (!product) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  return new Response(JSON.stringify(product));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const body = await request.json();
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
  const validatedSchema = productValidate.safeParse(body);
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

  const currProduct = await prisma.product.findFirst({
    where: {
      id: params.id,
    },
  });

  if (!currProduct) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 403,
      },
    );
  }

  const updatedProduct = await prisma.product.update({
    where: { id: params.id },
    data: {
      ...(validatedSchema.data.isActive == false &&
        currProduct.isActive == true && {
          disabledAt: currentDate,
        }),
      ...(validatedSchema.data.isActive == true &&
        currProduct.isActive == false && {
          disabledAt: null,
        }),
      ...validatedSchema.data,
    },
  });

  if (!updatedProduct) {
    return new Response(
      JSON.stringify({
        message: 'Error updating company group',
      }),
      {
        status: 409,
      },
    );
  }

  return new Response(JSON.stringify(updatedProduct));
}
