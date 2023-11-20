import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import updateCitiesTable from '@/lib/citiesTable/updateCitiesTable';
import { newCustomerValidate } from '@/types/Customer/tCustomer';
import {
  newCustomerAddressValidate,
  tNewCustomerAddress,
} from '@/types/Customer/tCustomerAddress';

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
  const validatedSchema = newCustomerValidate.safeParse(body);

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

  let validatedAddresses: tNewCustomerAddress[];
  try {
    validatedAddresses = body.addresses.map((address: tNewCustomerAddress) => {
      const validatedAdress = newCustomerAddressValidate.safeParse(address);
      if (!validatedAdress.success) {
        console.error(validatedAdress.error);
        throw new Error('Invalid payload for customer address');
      }
      return validatedAdress.data;
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'Incorrect payload for customer address',
      }),
      {
        status: 400,
      },
    );
  }

  //--> CHECAR SE PELO MENOS UM ENDEREÇO FOI ENVIADO E SE O MAIN ESTA CORRETO
  if (!validatedAddresses || validatedAddresses.length < 1) {
    return new Response(
      JSON.stringify({
        message: 'Must have at least one Address',
      }),
      {
        status: 400,
      },
    );
  }

  const mainAddresses = validatedAddresses.filter((address) => {
    return address.isMainAddress;
  });

  if (!mainAddresses || mainAddresses.length < 1) {
    return new Response(
      JSON.stringify({
        message: 'Must have at least one MAIN Address',
      }),
      {
        status: 400,
      },
    );
  }

  if (mainAddresses && mainAddresses.length > 1) {
    return new Response(
      JSON.stringify({
        message: 'Only one address can be MAIN',
      }),
      {
        status: 400,
      },
    );
  }

  //--> CHECAR SE AS CIDADES ESTÃO CORRETAS
  try {
    await Promise.all(
      validatedAddresses.map(async (address) => {
        const existingCity = await prisma.cities.findFirst({
          where: {
            AND: [
              {
                code: address.cityCode,
              },
              {
                state: address.state,
              },
            ],
          },
        });

        if (!existingCity) {
          const isCityInserted = await updateCitiesTable(
            address.cityCode,
            address.state,
          );
          if (!isCityInserted) throw Error('Error inserting new city in table');
        }

        return true;
      }),
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Invalid State or City code',
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

  //--> CRIAR CUSTOMER
  const createdAt = new Date().toISOString();
  let customer: any = null;
  try {
    customer = await prisma.customer.create({
      data: {
        ...validatedSchema.data,
        companyId: activeCompany.id,
        companyGroupId: companyGroup.id,
        createdAt,
        adresses: {
          create: validatedAddresses,
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

  return NextResponse.json(customer);
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

  const customers = await prisma.customer.findMany({
    where: {
      ...(onlyActive === 'true' && { isActive: true }),
      ...(companyGroup?.shareProducts && { companyGroupId: companyGroup.id }),
      ...(!companyGroup?.shareProducts && { companyId: activeCompany?.id }),
    },
    ...(tableList === 'true' && {
      select: {
        id: true,
        isActive: true,
        code: true,
        aliasName: true,
        createdAt: true,
        disabledAt: true,
      },
    }),
    ...(orderBy === 'id' && {
      orderBy: {
        id: 'asc',
      },
    }),
    ...(orderBy === 'alias' && {
      orderBy: {
        aliasName: 'asc',
      },
    }),
    ...(orderBy === 'code' && {
      orderBy: {
        code: 'asc',
      },
    }),
  });

  if (!customers) {
    return new Response(
      JSON.stringify({
        message:
          'Error retrieving a list of Customer or you do not have permission to any',
      }),
      {
        status: 403,
      },
    );
  }

  return NextResponse.json(customers);
}
