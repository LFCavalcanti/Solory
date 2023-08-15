import prisma from '@/lib/prisma';
import { newCompanyGroupValidate } from '@/types/CompanyGroup/tCompanyGroup';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';

export async function POST(request: Request, response: Response) {
  const body = await request.json();
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

  //--> CHECAR PAYLOAD SE ESTA COM OS DADOS CORRETOS
  const validatedSchema = newCompanyGroupValidate.safeParse(body);
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

  //--> CRIAR GRUPO DE EMPRESA
  let companyGroup: any = null;
  try {
    companyGroup = await prisma.companyGroup.create({
      data: {
        ...validatedSchema.data,
        createdAt: new Date().toISOString(),
        users: {
          create: [
            {
              createdAt: new Date().toISOString(),
              userId: session.user.id,
            },
          ],
        },
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Error creating the Company Group',
      }),
      {
        status: 500,
      },
    );
  }

  //--> RETORNAR ID DO GRUPO DE EMPRESA
  return new Response(JSON.stringify(companyGroup));
}

export async function GET(request: NextRequest) {
  const onlyActive = request.nextUrl.searchParams.get('onlyActive');
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

  const companyGroups = await prisma.companyGroup.findMany({
    where: {
      ...(onlyActive === 'true' && { isActive: true }),
      users: {
        every: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!companyGroups) {
    return new Response(
      JSON.stringify({
        message:
          'Error retrieving a list of Company Groups or you do not have permission to any',
      }),
      {
        status: 403,
      },
    );
  }

  return new Response(JSON.stringify(companyGroups), {
    status: 201,
  });
}
