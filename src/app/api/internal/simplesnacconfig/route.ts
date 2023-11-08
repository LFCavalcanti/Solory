import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newSimplesNacConfigValidate } from '@/types/SimplesNacConfig/tSimplesNacConfig';

export async function POST(request: Request) {
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
  const validatedSchema = newSimplesNacConfigValidate.safeParse(body);

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

  const companyGroup = await prisma.companyGroup.findFirst({
    where: {
      id: activeCompany?.companyGroupId,
    },
  });

  if (!activeCompany || !companyGroup) {
    return new Response(
      JSON.stringify({
        message:
          'Error retrieving Company or Company Group, probably need permissions.',
      }),
      {
        status: 401,
      },
    );
  }
  //## convert date to ISO string
  if (validatedSchema.data.activeSince) {
    validatedSchema.data.activeSince = `${validatedSchema.data.activeSince}T03:00:00Z`;
  }

  //## convert date to ISO string
  if (validatedSchema.data.expiresAt) {
    validatedSchema.data.expiresAt = `${validatedSchema.data.expiresAt}T03:00:00Z`;
  }

  //--> CRIAR SUPPLIER
  const createdAt = new Date().toISOString();
  let createdRegistry: any = null;
  try {
    createdRegistry = await prisma.simplesNacConfig.create({
      data: {
        ...validatedSchema.data,
        companyId: activeCompany.id,
        companyGroupId: companyGroup.id,
        createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Error creating Simples Nac Config',
      }),
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(createdRegistry);
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

  const registryList = await prisma.simplesNacConfig.findMany({
    where: {
      companyId: activeCompany?.id,
      ...(onlyActive === 'true' && { isActive: true }),
    },
    ...(tableList === 'true' && {
      select: {
        id: true,
        isActive: true,
        cnaeCode: true,
        anexoSimples: true,
        activeSince: true,
        expiresAt: true,
        createdAt: true,
        disabledAt: true,
        floorRevenue: true,
        ceilRevenue: true,
      },
    }),
    ...(orderBy === 'id' && {
      orderBy: {
        id: 'asc',
      },
    }),
    ...(orderBy === 'anexoSimples' && {
      orderBy: {
        anexoSimples: 'asc',
      },
    }),
    ...(orderBy === 'cnaeCode' && {
      orderBy: {
        cnaeCode: 'asc',
      },
    }),
  });

  if (!registryList) {
    return new Response(
      JSON.stringify({
        message:
          'Error retrieving a list of Simples Nac Config or you do not have permission to any',
      }),
      {
        status: 403,
      },
    );
  }

  return NextResponse.json(registryList);
}
