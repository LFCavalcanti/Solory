import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { customerAddressValidate } from '@/types/Customer/tCustomerAddress';

export async function GET(
  request: Request,
  { params }: { params: { id: string; addressId: string } },
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

  const customerAddress = await prisma.customerAddress.findFirst({
    where: {
      id: params.addressId,
      customerId: params.id,
    },
  });

  if (!customerAddress) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.addressId} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  return new Response(JSON.stringify(customerAddress));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; addressId: string } },
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
  const validatedSchema = customerAddressValidate.safeParse(body);
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

  const customerAddress = await prisma.customerAddress.findFirst({
    where: {
      id: params.addressId,
      customerId: params.id,
    },
  });

  if (!customerAddress) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.addressId} does not exist or insufficient permission`,
      }),
      {
        status: 403,
      },
    );
  }

  //--> CHECAR REGRA DE ENDEREÇO PRINCIPAL ANTES DE ALTERAR
  if (validatedSchema.data.isMainAddress !== customerAddress.isMainAddress) {
    const existingMain = await prisma.customerAddress.findFirst({
      where: {
        isMainAddress: true,
        isActive: true,
        customerId: params.id,
      },
    });

    if (validatedSchema.data.isMainAddress && existingMain) {
      return new Response(
        JSON.stringify({
          message: 'Only one adddress can be main',
        }),
        {
          status: 400,
        },
      );
    }

    if (!validatedSchema.data.isMainAddress && !existingMain) {
      return new Response(
        JSON.stringify({
          message: 'At least one adddress has to be main',
        }),
        {
          status: 400,
        },
      );
    }
  }

  //--> CHECAR SE HA PELO MENOS UM ENDEREÇO ATIVO EM CASO DE DESATIVAÇÃO
  if (!validatedSchema.data.isActive) {
    const activeAddresses = await prisma.customerAddress.findMany({
      where: {
        isActive: true,
        customerId: params.id,
      },
    });
    if (activeAddresses.length < 2) {
      return new Response(
        JSON.stringify({
          message: 'At least one adddress has to remain active',
        }),
        {
          status: 400,
        },
      );
    }
  }

  const updatedCustomerAddress = await prisma.customerAddress.update({
    where: { id: params.addressId },
    data: {
      ...validatedSchema.data,
    },
  });

  if (!updatedCustomerAddress) {
    return new Response(
      JSON.stringify({
        message: 'Error updating customer address',
      }),
      {
        status: 409,
      },
    );
  }

  return new Response(JSON.stringify(updatedCustomerAddress));
}
