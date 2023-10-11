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

  //--> CHECAR SE HA PELO MENOS UM ENDEREÇO ATIVO EM CASO DE DESATIVAÇÃO
  if (!validatedSchema.data.isActive) {
    const activeCnaeIss = await prisma.companyCnaeIss.findMany({
      where: {
        isActive: true,
        companyId: params.id,
      },
    });
    if (activeCnaeIss.length < 2) {
      return new Response(
        JSON.stringify({
          message: 'At least one CNAE vs ISS has to remain active',
        }),
        {
          status: 400,
        },
      );
    }
  }

  const updatedCompanyCnaeIss = await prisma.companyCnaeIss.update({
    where: { id: params.cnaeIssId },
    data: {
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
