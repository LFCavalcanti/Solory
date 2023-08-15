import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { companyGroupValidate } from '@/types/CompanyGroup/tCompanyGroup';

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

  const companyGroup = await prisma.companyGroup.findFirst({
    where: {
      id: params.id,
      users: {
        every: {
          userId: session.user.id,
        },
      },
    },
  });
  if (!companyGroup) {
    return new Response(
      JSON.stringify({
        message: 'Error retrieving Company Group or you do not have permission',
      }),
      {
        status: 404,
      },
    );
  }
  return new Response(JSON.stringify(companyGroup));
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

  //--> CHECAR PAYLOAD SE ESTA COM OS DADOS CORRETOS
  const validatedSchema = companyGroupValidate.safeParse(body);
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

  const companyGroup = await prisma.companyGroup.findFirst({
    where: {
      id: params.id,
      users: {
        every: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!companyGroup) {
    return new Response(
      JSON.stringify({
        message: 'Error retrieving Company Group or you do not have permission',
      }),
      {
        status: 403,
      },
    );
  }

  /*==> SE FOR ALTERAR O ISACTIVE SÓ ACEITAR ESSE ATRIBUTO E PRECISA ATUALIZAR A DATA DE DESATIVAÇÃO
        E DESATIVAR AS EMPRESAS ASSOCIADAS PRIMEIRO
  */
  if (
    companyGroup.isActive !== validatedSchema.data.isActive &&
    validatedSchema.data.isActive == false
  ) {
    const activeCompany = await prisma.company.findFirst({
      where: {
        AND: [
          {
            companyGroupId: companyGroup.id,
          },
          {
            isActive: true,
          },
        ],
      },
    });

    if (activeCompany) {
      return new Response(
        JSON.stringify({
          message:
            'To disable a company group, first disable all related companies',
        }),
        {
          status: 409,
        },
      );
    }
  }
  /*==> SÓ PODE ALTERAR NOME E DESCRIÇÃO, OS PARAMETROS DE COMPARTILHAMENTO DE CADASTROS SÓ
        PODEM SER MUDADOS PARA "TRUE" NUNCA PARA "FALSE"
  */
  if (
    (companyGroup.shareClients && validatedSchema.data.shareClients == false) ||
    (companyGroup.shareKpi && validatedSchema.data.shareKpi == false) ||
    (companyGroup.shareProducts &&
      validatedSchema.data.shareProducts == false) ||
    (companyGroup.shareSuppliers &&
      validatedSchema.data.shareSuppliers == false)
  ) {
    return new Response(
      JSON.stringify({
        message:
          'You can not disable sharing parameters between companies if they are already enabled',
      }),
      {
        status: 409,
      },
    );
  }

  const updatedCompanyGroup = await prisma.companyGroup.update({
    where: { id: params.id },
    data: {
      ...(validatedSchema.data.isActive == false && {
        isActive: validatedSchema.data.isActive,
        disabledAt: currentDate,
      }),
      ...validatedSchema.data,
    },
  });

  if (!updatedCompanyGroup) {
    return new Response(
      JSON.stringify({
        message: 'Error updating company group',
      }),
      {
        status: 409,
      },
    );
  }

  return new Response(JSON.stringify(updatedCompanyGroup));
}
