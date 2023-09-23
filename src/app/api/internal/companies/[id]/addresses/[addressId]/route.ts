import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { companyAddressValidate } from '@/types/Company/tCompanyAddress';

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

  const companyAddress = await prisma.companyAddress.findFirst({
    where: {
      id: params.addressId,
      companyId: params.id,
      company: {
        users: {
          every: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  if (!companyAddress) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.addressId} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  return new Response(JSON.stringify(companyAddress));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; addressId: string } },
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
  const validatedSchema = companyAddressValidate.safeParse(body);
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

  const companyAddress = await prisma.companyAddress.findFirst({
    where: {
      id: params.addressId,
      companyId: params.id,
      company: {
        users: {
          every: {
            userId: session.user.id,
          },
        },
      },
    },
  });

  if (!companyAddress) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.addressId} does not exist or insufficient permission`,
      }),
      {
        status: 403,
      },
    );
  }

  const updatedCompanyAddress = await prisma.companyAddress.update({
    where: { id: params.addressId },
    data: {
      ...(validatedSchema.data.isActive == false &&
        companyAddress.isActive == true && {
          disabledAt: currentDate,
        }),
      ...(validatedSchema.data.isActive == true &&
        companyAddress.isActive == false && {
          disabledAt: null,
        }),
      ...validatedSchema.data,
    },
  });

  if (!updatedCompanyAddress) {
    return new Response(
      JSON.stringify({
        message: 'Error updating company address',
      }),
      {
        status: 409,
      },
    );
  }

  return new Response(JSON.stringify(updatedCompanyAddress));
}
