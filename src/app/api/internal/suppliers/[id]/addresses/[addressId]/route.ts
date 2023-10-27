import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { supplierAddressValidate } from '@/types/Supplier/tSupplierAddress';

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

  const supplierAddress = await prisma.supplierAddress.findFirst({
    where: {
      id: params.addressId,
      supplierId: params.id,
    },
  });

  if (!supplierAddress) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.addressId} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  return new Response(JSON.stringify(supplierAddress));
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
  const validatedSchema = supplierAddressValidate.safeParse(body);
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

  const supplierAddress = await prisma.supplierAddress.findFirst({
    where: {
      id: params.addressId,
      supplierId: params.id,
    },
  });

  if (!supplierAddress) {
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
  if (validatedSchema.data.isMainAddress !== supplierAddress.isMainAddress) {
    const existingMain = await prisma.supplierAddress.findFirst({
      where: {
        isMainAddress: true,
        isActive: true,
        supplierId: params.id,
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
    const activeAddresses = await prisma.supplierAddress.findMany({
      where: {
        isActive: true,
        supplierId: params.id,
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

  const updatedSupplierAddress = await prisma.supplierAddress.update({
    where: { id: params.addressId },
    data: {
      ...validatedSchema.data,
    },
  });

  if (!updatedSupplierAddress) {
    return new Response(
      JSON.stringify({
        message: 'Error updating supplier address',
      }),
      {
        status: 409,
      },
    );
  }

  return new Response(JSON.stringify(updatedSupplierAddress));
}
