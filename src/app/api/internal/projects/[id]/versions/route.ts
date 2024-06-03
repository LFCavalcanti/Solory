import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { tSelectMenuOption } from '@/types/tSelectMenuOption';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

  const registryData = await prisma.project.findMany({
    select: {
      version: true,
    },
    where: {
      id: params.id,
    },
    orderBy: {
      version: 'desc',
    },
  });
  if (!registryData) {
    return new NextResponse(
      JSON.stringify({
        message: `### ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  if (selectOptions === 'true') {
    const selectOptions: tSelectMenuOption[] = registryData.map(
      (item, index) => {
        const value = item.version.toString();
        return {
          value,
          label: index === 0 ? value + ' (Atual)' : value,
        };
      },
    );
    return new NextResponse(JSON.stringify(selectOptions));
  } else {
    const versionArray: number[] = registryData.map((item) => item.version);
    return new NextResponse(JSON.stringify(versionArray));
  }
}
