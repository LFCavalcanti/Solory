import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

  const registryList = await prisma.projectMilestone.findMany({
    where: {
      projectId: params.id,
      ...((onlyActive === 'true' || tableList === 'true') && {
        isActive: true,
      }),
    },
    ...(tableList === 'true' && {
      include: {
        tasks: {
          where: {
            isActive: true,
          },
          include: {
            activities: {
              where: {
                isActive: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    }),
    ...(orderBy === 'id' && {
      orderBy: {
        id: 'asc',
      },
    }),
    ...(orderBy === 'order' && {
      orderBy: {
        order: 'asc',
      },
    }),
    ...(tableList === 'true' && {
      orderBy: {
        order: 'asc',
      },
    }),
  });

  if (!registryList) {
    return new Response(
      JSON.stringify({
        message:
          'Error retrieving a list of Milestones or you do not have permission to any',
      }),
      {
        status: 403,
      },
    );
  }

  return NextResponse.json(registryList);
}
