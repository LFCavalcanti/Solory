import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const onlyActive = request.nextUrl.searchParams.get('onlyActive');
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

  const registryList = await prisma.serviceOrderEvent.findMany({
    where: {
      serviceOrderId: params.id,
      ...(onlyActive === 'true' && { isActive: true }),
    },
  });
  if (!registryList) {
    return new Response(
      JSON.stringify({
        message: `### Service Order Events for ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }

  return new NextResponse(JSON.stringify(registryList));
}
