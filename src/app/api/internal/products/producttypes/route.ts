import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const orderBy = request.nextUrl.searchParams.get('orderBy');
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

  const productTypes = await prisma.productType.findMany({
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

  if (!productTypes) {
    return new Response(
      JSON.stringify({
        message:
          'Error retrieving a list of Products Types or you do not have permission to any',
      }),
      {
        status: 403,
      },
    );
  }

  return NextResponse.json(productTypes);
}
