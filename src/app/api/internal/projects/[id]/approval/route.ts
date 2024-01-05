import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return new NextResponse(
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

  if (
    !body.action ||
    (body.action && !(body.action === 'APPROVE' || body.action === 'REFUSE'))
  ) {
    return new NextResponse(
      JSON.stringify({
        message: 'Invalid action in body.',
      }),
      {
        status: 400,
      },
    );
  }

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
    return new NextResponse(
      JSON.stringify({
        message: 'Error retrieving Company, probably need permissions.',
      }),
      {
        status: 401,
      },
    );
  }

  const [projectData] = await prisma.project.findMany({
    where: {
      id: params.id,
      companyId: activeCompany.id,
    },
    orderBy: [
      {
        version: 'desc',
      },
    ],
    take: 1,
  });

  if (!projectData) {
    return new NextResponse(
      JSON.stringify({
        message:
          'Error retrieving Poject, probably need permissions or invalid ID.',
      }),
      {
        status: 401,
      },
    );
  }

  if (body.action === 'APPROVE' && projectData.status !== 'PROPOSAL') {
    return new NextResponse(
      JSON.stringify({
        message: 'Incorrect payload',
      }),
      {
        status: 400,
      },
    );
  }

  if (body.action === 'APPROVE' && !projectData.contractId) {
    return new NextResponse(
      JSON.stringify({
        message: 'Incorrect payload',
      }),
      {
        status: 400,
      },
    );
  }

  if (body.action === 'APPROVE') {
    try {
      const milestones = await prisma.projectMilestone.findMany({
        where: {
          projectId: projectData.id,
        },
      });

      if (!milestones) {
        throw new Error('Invalid project ID or no permission');
      }

      milestones.forEach((milestone) => {
        if (!milestone.contractItemId)
          throw new Error('Approved projects need a VALID contract item');
      });
    } catch (error) {
      console.error(error);
      return new NextResponse(
        JSON.stringify({
          message: `${error}`,
        }),
        {
          status: 400,
        },
      );
    }

    const updatedProject = await prisma.project.update({
      //where: { id: params.id, version: projectData.version },
      where: { projectId: { id: params.id, version: projectData.version } },
      data: {
        status: body.action === 'APPROVE' ? 'APPROVED' : 'REFUSED',
      },
    });

    if (!updatedProject) {
      return new Response(
        JSON.stringify({
          message: 'Error updating project',
        }),
        {
          status: 409,
        },
      );
    }

    return new Response(JSON.stringify(updatedProject));
  }
}
