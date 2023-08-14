import prisma from '@/lib/prisma';
import {
  newCompanyGroupValidate,
  type tNewCompanyGroup,
} from '@/types/CompanyGroup/tCompanyGroup';
import { tUserProfileData } from '@/types/User/tUser';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';

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
