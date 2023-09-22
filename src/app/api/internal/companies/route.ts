import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newCompanyValidate } from '@/types/Company/tCompany';
import {
  newCompanyAddressValidate,
  tNewCompanyAddress,
} from '@/types/Company/tCompanyAddress';
import {
  newCompanyCnaeIssValidate,
  tNewCompanyCnaeIss,
} from '@/types/Company/tCompanyCnaeIss';
import updateCitiesTable from '@/lib/citiesTable/updateCitiesTable';

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
  const validatedCompanySchema = newCompanyValidate.safeParse(body.company);

  if (!validatedCompanySchema.success) {
    console.error(validatedCompanySchema.error);
    return new Response(
      JSON.stringify({
        message: 'Incorrect payload',
      }),
      {
        status: 400,
      },
    );
  }

  let validatedCompanyAddresses: tNewCompanyAddress[];
  try {
    validatedCompanyAddresses = body.addresses.map(
      (address: tNewCompanyAddress) => {
        const validatedAdress = newCompanyAddressValidate.safeParse(address);
        if (!validatedAdress.success) {
          console.error(validatedAdress.error);
          throw new Error('Invalid payload for company address');
        }
        return validatedAdress.data;
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: 'Incorrect payload for company address',
      }),
      {
        status: 400,
      },
    );
  }

  try {
    await Promise.all(
      validatedCompanyAddresses.map(async (address) => {
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

  let validatedCompanyCnaeIsses: tNewCompanyCnaeIss[];
  try {
    validatedCompanyCnaeIsses = body.cnaeIss.map(
      (address: tNewCompanyCnaeIss) => {
        const validatedCnaeIss = newCompanyCnaeIssValidate.safeParse(address);
        if (!validatedCnaeIss.success) {
          console.error(validatedCnaeIss.error);
          throw new Error('Invalid payload for company CNAE vs ISS');
        }
        return validatedCnaeIss.data;
      },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Incorrect payload for company CNAE vs ISS',
      }),
      {
        status: 400,
      },
    );
  }
  //-------------------------------------------------------->

  //--> CRIAR EMPRESA
  const createdAt = new Date().toISOString();
  let company: any = null;
  try {
    company = await prisma.company.create({
      data: {
        ...validatedCompanySchema.data,
        createdAt,
        users: {
          create: [
            {
              createdAt,
              userId: session.user.id,
            },
          ],
        },
        adresses: {
          create: validatedCompanyAddresses,
        },
        companyCnaeIss: {
          create: validatedCompanyCnaeIsses,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: 'Error creating Company',
      }),
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(company);
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

  const companies = await prisma.company.findMany({
    where: {
      ...(onlyActive === 'true' && { isActive: true }),
      users: {
        every: {
          userId: session.user.id,
        },
      },
    },
    ...(tableList === 'true' && {
      select: {
        id: true,
        isActive: true,
        aliasName: true,
        fullName: true,
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
  });

  if (!companies) {
    return new Response(
      JSON.stringify({
        message:
          'Error retrieving a list of Company or you do not have permission to any',
      }),
      {
        status: 403,
      },
    );
  }

  return NextResponse.json(companies);
}
