import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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
    !(projectData.status === 'IN_PROGRESS' || projectData.status === 'APPROVED')
  ) {
    return new NextResponse(
      JSON.stringify({
        message:
          'The project should be ARROVED or IN_PROGRESS for updating progress.',
      }),
      {
        status: 401,
      },
    );
  }

  const projectItems = await prisma.projectMilestone.findMany({
    where: {
      projectId: projectData.id,
      ProjectVersion: projectData.version,
    },
    include: {
      tasks: {
        include: {
          activities: true,
        },
      },
    },
  });

  if (!projectItems) {
    return new NextResponse(
      JSON.stringify({
        message: 'Error retrieving Poject Milestones.',
      }),
      {
        status: 401,
      },
    );
  }

  const milestoneWeight = 100 / (projectItems.length * 100);

  const overallProgress = projectItems.reduce((projectProgress, milestone) => {
    const taskWeight = 100 / (milestone.tasks.length * 100);

    const updatedMilestoneProgress = milestone.tasks.reduce(
      (milestoneProgress, task) => {
        if (!task.activities.length || task.progress === 100) {
          return milestoneProgress + taskWeight * task.progress;
        }

        const activityWeight = 100 / (task.activities.length * 100);
        const updatedTaskProgress = task.activities.reduce(
          (taskProgress, activity) => {
            return taskProgress + activityWeight * activity.progress;
          },
          0,
        );
        const updatedTask = prisma.projectTask.update({
          where: {
            id: task.id,
          },
          data: {
            progress: updatedTaskProgress,
          },
        });
        if (!updatedTask) throw new Error(`Error updating task ID: ${task.id}`);
        return milestoneProgress + updatedTaskProgress;
      },
      0,
    );

    const updatedMilestone = prisma.projectMilestone.update({
      where: {
        id: milestone.id,
      },
      data: {
        progress: updatedMilestoneProgress,
      },
    });
    if (!updatedMilestone)
      throw new Error(`Error updating milestone ID: ${milestone.id}`);
    return projectProgress + (updatedMilestoneProgress * milestoneWeight) / 100;
  }, 0);

  const updatedProject = await prisma.project.update({
    where: {
      projectId: { id: projectData.id, version: projectData.version },
    },
    data: {
      progress: overallProgress,
    },
  });

  if (!updatedProject) {
    return new NextResponse(
      JSON.stringify({
        message: 'Error updating project progress',
      }),
      {
        status: 409,
      },
    );
  }

  return new NextResponse(JSON.stringify(updatedProject));
}
