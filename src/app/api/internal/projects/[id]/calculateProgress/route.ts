import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

type tItemToUpdate = [string, number];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const tasksToUpdate: tItemToUpdate[] = [];
  const milestonesToUpdate: tItemToUpdate[] = [];

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

  const milestoneWeight = 100 / projectItems.length / 100;

  const overallProgress = projectItems.reduce((projectProgress, milestone) => {
    const taskWeight = 100 / milestone.tasks.length / 100;

    const updatedMilestoneProgress = milestone.tasks.reduce(
      (milestoneProgress, task) => {
        if (!task.activities.length || task.progress === 100) {
          return milestoneProgress + taskWeight * task.progress;
        }

        const activityWeight = 100 / task.activities.length / 100;
        const updatedTaskProgress = task.activities.reduce(
          (taskProgress, activity) => {
            return taskProgress + activityWeight * activity.progress;
          },
          0,
        );
        tasksToUpdate.push([task.id, updatedTaskProgress]);
        return milestoneProgress + updatedTaskProgress;
      },
      0,
    );

    milestonesToUpdate.push([milestone.id, updatedMilestoneProgress]);
    return projectProgress + updatedMilestoneProgress * milestoneWeight;
  }, 0);

  //UPDATE TASKS
  if (tasksToUpdate.length) {
    for (let taskIdx = 0; taskIdx < tasksToUpdate.length; taskIdx++) {
      const updatedTask = await prisma.projectTask.update({
        where: {
          id: tasksToUpdate[taskIdx][0],
        },
        data: {
          progress: tasksToUpdate[taskIdx][1],
        },
      });
      if (!updatedTask)
        throw new Error(`Error updating task ID: ${tasksToUpdate[taskIdx][0]}`);
    }
  }

  //UPDATE MILESTONES
  if (milestonesToUpdate.length) {
    for (
      let milestoneIdx = 0;
      milestoneIdx < milestonesToUpdate.length;
      milestoneIdx++
    ) {
      const updatedMilestone = await prisma.projectMilestone.update({
        where: {
          id: milestonesToUpdate[milestoneIdx][0],
        },
        data: {
          progress: milestonesToUpdate[milestoneIdx][1],
        },
      });
      if (!updatedMilestone)
        throw new Error(
          `Error updating task ID: ${milestonesToUpdate[milestoneIdx][0]}`,
        );
    }
  }
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
