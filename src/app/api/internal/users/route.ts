import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { tSelectMenuOption } from '@/types/tSelectMenuOption';

export async function GET(request: NextRequest) {
  const onlyActive = request.nextUrl.searchParams.get('onlyActive');
  const orderBy = request.nextUrl.searchParams.get('orderBy');
  const emailAddress = request.nextUrl.searchParams.get('emailAddress');
  const selectOptions = request.nextUrl.searchParams.get('selectOptions');
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

  const userList = await prisma.user.findMany({
    where: {
      OR: [
        {
          companies: {
            some: {
              companyId: activeCompany?.id,
            },
          },
        },
        {
          companyGroups: {
            some: {
              companyGroupId: companyGroup?.id,
            },
          },
        },
      ],
      ...(onlyActive === 'true' && { isActive: true }),
      ...(emailAddress && { email: emailAddress }),
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
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

  if (!userList) {
    return new NextResponse(
      JSON.stringify({
        message:
          'Error retrieving a list of Users or you do not have permission to list any',
      }),
      {
        status: 403,
      },
    );
  }

  if (selectOptions === 'true') {
    const selectUserList: tSelectMenuOption[] = userList.map((user) => {
      return {
        value: user.id,
        label: user.name || 'SEM NOME CADASTRADO',
      };
    });
    return NextResponse.json(selectUserList);
  }
  return NextResponse.json(userList);
}
