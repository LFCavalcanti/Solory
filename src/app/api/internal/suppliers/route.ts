import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import updateCitiesTable from '@/lib/citiesTable/updateCitiesTable';
import { newSupplierValidate } from '@/types/Supplier/tSupplier';
import {
  newSupplierAddressValidate,
  tNewSupplierAddress,
} from '@/types/Supplier/tSupplierAddress';

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
  const validatedSchema = newSupplierValidate.safeParse(body);

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

  let validatedAddresses: tNewSupplierAddress[];
  try {
    validatedAddresses = body.addresses.map((address: tNewSupplierAddress) => {
      const validatedAdress = newSupplierAddressValidate.safeParse(address);
      if (!validatedAdress.success) {
        console.error(validatedAdress.error);
        throw new Error('Invalid payload for supplier address');
      }
      return validatedAdress.data;
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'Incorrect payload for supplier address',
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

  //--> CRIAR SUPPLIER
  const createdAt = new Date().toISOString();
  let supplier: any = null;
  try {
    supplier = await prisma.supplier.create({
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
        message: 'Error creating Supplier',
      }),
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(supplier);
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

  const suppliers = await prisma.supplier.findMany({
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
