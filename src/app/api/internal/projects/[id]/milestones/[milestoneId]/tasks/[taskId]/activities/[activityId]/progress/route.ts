import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      id: string;
      milestoneId: string;
      taskId: string;
      activityId: string;
    };
  },
) {
  const body = await request.json();
  const session = await getServerSession(authOptions);

  if (!body.progress) {
    return new NextResponse(
      JSON.stringify({
        message: 'Incorrect payload',
      }),
      {
        status: 400,
      },
    );
  }

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

  if (
    !(projectData.status === 'APPROVED' || projectData.status === 'IN_PROGRESS')
  ) {
    return new NextResponse(
      JSON.stringify({
        message: 'Invalid project status.',
      }),
      {
        status: 400,
      },
    );
  }

  const milestoneData = await prisma.projectMilestone.findFirst({
    where: {
      id: params.milestoneId,
      projectId: projectData.id,
      ProjectVersion: projectData.version,
    },
  });

  if (!milestoneData) {
    return new NextResponse(
      JSON.stringify({
        message:
          'Error retrieving Milestone, probably need permissions or invalid ID.',
      }),
      {
        status: 401,
      },
    );
  }

  const taskData = await prisma.projectTask.findFirst({
    where: {
      id: params.taskId,
      milestoneId: milestoneData.id,
    },
  });

  if (!taskData) {
    return new NextResponse(
      JSON.stringify({
        message:
          'Error retrieving Task, probably need permissions or invalid ID.',
      }),
      {
        status: 401,
      },
    );
  }

  const activityData = await prisma.projectActivity.findFirst({
    where: {
      id: params.activityId,
      taskId: taskData.id,
    },
  });

  if (!activityData) {
    return new NextResponse(
      JSON.stringify({
        message:
          'Error retrieving Activity, probably need permissions or invalid ID.',
      }),
      {
        status: 400,
      },
    );
  }

  if (activityData.status === 'COMPLETED') {
    return new NextResponse(
      JSON.stringify({
        message: 'Activity already completed.',
      }),
      {
        status: 400,
      },
    );
  }

  if (
    activityData.effortUnit !== 'NONE' &&
    (!body.effort || body.effort === 0)
  ) {
    return new NextResponse(
      JSON.stringify({
        message: 'Task has to progress effort units.',
      }),
      {
        status: 400,
      },
    );
  }

  if (activityData.effortUnit === 'NONE' && body.effort) {
    return new NextResponse(
      JSON.stringify({
        message:
          'Task only control percentage, effort is not accepted to update progress.',
      }),
      {
        status: 400,
      },
    );
  }

  const updatedProgress: number = taskData.progress + body.progress;
  let executedEffort = 0;
  let updatedEffortBalance = 0;

  if (activityData.effortUnit !== 'NONE') {
    executedEffort = activityData.effortExecuted + body.effort;
    updatedEffortBalance = activityData.effortBalance - executedEffort;
    if (updatedEffortBalance < 0) updatedEffortBalance = 0;
  }

  if (updatedProgress > 100) {
    return new NextResponse(
      JSON.stringify({
        message: 'Updated progress is greater than 100%',
      }),
      {
        status: 400,
      },
    );
  }

  const updatedActivity = await prisma.projectActivity.update({
    where: {
      id: params.activityId,
    },
    data: {
      progress: updatedProgress,
      ...(updatedProgress === 100 && { status: 'COMPLETED' }),
      ...(activityData.effortUnit !== 'NONE' && {
        effortExecuted: executedEffort,
        effortBalance: updatedEffortBalance,
      }),
    },
  });

  if (!updatedActivity) {
    return new NextResponse(
      JSON.stringify({
        message: 'Error updating activity',
      }),
      {
        status: 409,
      },
    );
  }

  return new Response(JSON.stringify(updatedActivity));
}
