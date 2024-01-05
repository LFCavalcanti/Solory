import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { milestoneId: string } },
) {
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

  const registryData = await prisma.projectMilestone.findFirst({
    where: {
      id: params.milestoneId,
    },
  });
  if (!registryData) {
    return new NextResponse(
      JSON.stringify({
        message: `### ID ${params.milestoneId} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }
  return new NextResponse(JSON.stringify(registryData));
}
