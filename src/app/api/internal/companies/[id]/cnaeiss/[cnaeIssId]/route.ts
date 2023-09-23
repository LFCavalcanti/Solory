import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { companyCnaeIssValidate } from '@/types/Company/tCompanyCnaeIss';

export async function GET(
  request: Request,
  { params }: { params: { id: string; cnaeIssId: string } },
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

  const companyCnaeIss = await prisma.companyCnaeIss.findFirst({
    where: {
      id: params.cnaeIssId,
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

  if (!companyCnaeIss) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.cnaeIssId} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  return new Response(JSON.stringify(companyCnaeIss));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string; cnaeIssId: string } },
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
  const validatedSchema = companyCnaeIssValidate.safeParse(body);
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

  const companyCnaeIss = await prisma.companyCnaeIss.findFirst({
    where: {
      id: params.cnaeIssId,
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

  if (!companyCnaeIss) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.cnaeIssId} does not exist or insufficient permission`,
      }),
      {
        status: 403,
      },
    );
  }

  const updatedCompanyCnaeIss = await prisma.companyCnaeIss.update({
    where: { id: params.cnaeIssId },
    data: {
      ...(validatedSchema.data.isActive == false &&
        companyCnaeIss.isActive == true && {
          disabledAt: currentDate,
        }),
      ...(validatedSchema.data.isActive == true &&
        companyCnaeIss.isActive == false && {
          disabledAt: null,
        }),
      ...validatedSchema.data,
    },
  });

  if (!updatedCompanyCnaeIss) {
    return new Response(
      JSON.stringify({
        message: 'Error updating company address',
      }),
      {
        status: 409,
      },
    );
  }

  return new Response(JSON.stringify(updatedCompanyCnaeIss));
}
