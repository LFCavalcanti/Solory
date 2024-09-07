import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newBusinessRoleValidate } from '@/types/BusinessRole/tBusinessRole';
import {
  newUserToBusinessRoleValidate,
  tNewUserToBusinessRole,
  tNewUserToBusinessRoleApi,
} from '@/types/BusinessRole/tUserToBusinessRole';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const session = await getServerSession(authOptions);
  const createdAt = new Date().toISOString();

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
  const validatedSchema = newBusinessRoleValidate.safeParse(body);

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

  let validatedUserToBusinessRoles: tNewUserToBusinessRoleApi[];
  try {
    validatedUserToBusinessRoles = body.users.map(
      (userToBusinessRole: tNewUserToBusinessRole) => {
        const validatedRelation =
          newUserToBusinessRoleValidate.safeParse(userToBusinessRole);
        if (!validatedRelation.success) {
          console.error(validatedRelation.error);
          throw new Error('Invalid payload for supplier address');
        }
        return { createdAt, ...validatedRelation.data };
      },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Incorrect payload for business role',
      }),
      {
        status: 400,
      },
    );
  }

  const userSettings = await prisma.userSettings.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  const activeCompany = await prisma.company.findFirst({
    where: {
      id: userSettings?.activeCompanyId,
      users: {
        every: {
          userId: session.user.id,
        },
      },
    },
  });

  if (!activeCompany) {
    return new Response(
      JSON.stringify({
        message: 'Error retrieving Company, probably need permissions.',
      }),
      {
        status: 401,
      },
    );
  }

  //--> CRIAR SUPPLIER

  let businessRole: any = null;
  try {
    businessRole = await prisma.businessRole.create({
      data: {
        ...validatedSchema.data,
        companyId: activeCompany.id,
        createdAt,
        ...(validatedUserToBusinessRoles.length && {
          users: {
            create: validatedUserToBusinessRoles,
          },
        }),
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Error creating Supplier',
      }),
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(businessRole);
}

export async function GET(request: NextRequest) {
  const onlyActive = request.nextUrl.searchParams.get('onlyActive');
  const orderBy = request.nextUrl.searchParams.get('orderBy');
  const tableList = request.nextUrl.searchParams.get('tableList');
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

  const userSettings = await prisma.userSettings.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  const activeCompany = await prisma.company.findFirst({
    where: {
      id: userSettings?.activeCompanyId,
      users: {
        every: {
          userId: session.user.id,
        },
      },
    },
  });

  const suppliers = await prisma.businessRole.findMany({
    where: {
      companyId: activeCompany?.id,
      ...(onlyActive === 'true' && { isActive: true }),
    },
    ...(tableList === 'true' && {
      select: {
        id: true,
        isActive: true,
        name: true,
        createdAt: true,
        disabledAt: true,
      },
    }),
    ...(orderBy === 'id' && {
      orderBy: {
        id: 'asc',
      },
    }),
    ...(orderBy === 'name' && {
      orderBy: {
        name: 'asc',
      },
    }),
  });

  if (!suppliers) {
    return new Response(
      JSON.stringify({
        message:
          'Error retrieving a list of Supplier or you do not have permission to any',
      }),
      {
        status: 403,
      },
    );
  }

  return NextResponse.json(suppliers);
}
