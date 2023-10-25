import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newProductValidate } from '@/types/Product/tProduct';

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
  const validatedSchema = newProductValidate.safeParse(body);
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
  //--> CRIAR PRODUTO
  let product: any = null;
  try {
    product = await prisma.product.create({
      data: {
        createdAt: new Date().toISOString(),
        companyId: activeCompany?.id,
        companyGroupId: companyGroup?.id,
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

  //--> RETORNAR PRODUTO
  return new Response(JSON.stringify(product));
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

  const companyGroup = await prisma.companyGroup.findFirst({
    where: {
      id: activeCompany?.companyGroupId,
    },
  });

  const products = await prisma.product.findMany({
    where: {
      ...(onlyActive === 'true' && { isActive: true }),
      ...(companyGroup?.shareProducts && { companyGroupId: companyGroup.id }),
      ...(!companyGroup?.shareProducts && { companyId: activeCompany?.id }),
    },
    ...(tableList === 'true' && {
      select: {
        id: true,
        code: true,
        description: true,
        isActive: true,
        createdAt: true,
        disabledAt: true,
        typeId: true,
      },
    }),
    ...(orderBy === 'id' && {
      orderBy: {
        id: 'asc',
      },
    }),
    ...(orderBy === 'description' && {
      orderBy: {
        description: 'asc',
      },
    }),
    // include: {
    //   productType: {
    //     select: {
    //       type: true,
    //     },
    //   },
    // },
  });

  if (!products) {
    return new Response(
      JSON.stringify({
        message:
          'Error retrieving a list of Products or you do not have permission to any',
      }),
      {
        status: 403,
      },
    );
  }

  return NextResponse.json(products);
}
