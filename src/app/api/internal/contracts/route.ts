import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newContractValidate } from '@/types/Contract/tContract';
import {
  newContractItemValidate,
  tNewContractItem,
} from '@/types/Contract/tContractItem';

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
  const validatedSchema = newContractValidate.safeParse(body);

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

  let validatedItems: tNewContractItem[];
  try {
    validatedItems = body.items.map((item: tNewContractItem) => {
      const validatedItem = newContractItemValidate.safeParse(item);
      if (!validatedItem.success) {
        console.error(validatedItem.error);
        throw new Error('Invalid payload for contract item');
      }
      return validatedItem.data;
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'Incorrect payload for contract items',
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

  //## convert date to ISO string
  if (validatedSchema.data.termStart) {
    validatedSchema.data.termStart = `${validatedSchema.data.termStart}T03:00:00Z`;
  }

  //## convert date to ISO string
  if (validatedSchema.data.termEnd) {
    validatedSchema.data.termEnd = `${validatedSchema.data.termEnd}T03:00:00Z`;
  }

  //--> CRIAR Contract
  const createdAt = new Date().toISOString();
  let contract: any = null;
  try {
    contract = await prisma.contract.create({
      data: {
        ...validatedSchema.data,
        companyId: activeCompany.id,
        createdAt,
        items: {
          create: validatedItems,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Error creating Customer',
      }),
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(contract);
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

  const customers = await prisma.contract.findMany({
    where: {
      ...(onlyActive === 'true' && { isActive: true }),
      companyId: activeCompany?.id,
    },
    ...(tableList === 'true' && {
      select: {
        id: true,
        isActive: true,
        description: true,
        createdAt: true,
        disabledAt: true,
        termStart: true,
        termEnd: true,
        customer: {
          select: {
            aliasName: true,
          },
        },
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
  });

  if (!customers) {
    return new Response(
      JSON.stringify({
        message:
          'Error retrieving a list of Contracts or you do not have permission to any',
      }),
      {
        status: 403,
      },
    );
  }

  return NextResponse.json(customers);
}
