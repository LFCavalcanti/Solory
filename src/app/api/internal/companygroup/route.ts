import prisma from '@/lib/prisma';
import {
  newCompanyGroupValidate,
  type tNewCompanyGroup,
} from '@/types/CompanyGroup/tCompanyGroup';
import { tUserProfileData } from '@/types/User/tUser';

export async function POST(request: Request) {
  const body = await request.json();

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

  if (!body.userId) {
    return new Response(
      JSON.stringify({
        message: 'Must provide user ID',
      }),
      {
        status: 400,
      },
    );
  }

  let userData: null | tUserProfileData = null;

  try {
    userData = await prisma.user.findFirstOrThrow({
      where: {
        id: body.userId,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Provided User ID not found',
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

  console.log(companyGroup);

  //--> CRIAR PERMISSÃO PARA O USUÁRIO NO GRUPO DA EMPRESA
  let userToCompanyGroup: any = null;
  try {
    userToCompanyGroup = await prisma.userToCompanyGroup.create({
      data: {
        createdAt: new Date().toISOString(),
        userId: userData.id,
        companyGroupId: companyGroup.id,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Error creating the Company Group Permission',
      }),
      {
        status: 500,
      },
    );
  }
  //validatedSchema.data;

  //--> RETORNAR ID DO GRUPO DE EMPRESA
  return new Response(JSON.stringify(companyGroup));
}
