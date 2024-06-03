import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { reviewProjectValidate } from '@/types/Project/tProject';
import {
  newProjectMilestoneValidate,
  tNewProjectMilestone,
} from '@/types/Project/tProjectMilestone';
import { tContractItem } from '@/types/Contract/tContractItem';
import { newProjectTaskValidate } from '@/types/Project/tProjectTask';
import { newProjectActivityValidate } from '@/types/Project/tProjectActivity';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const session = await getServerSession(authOptions);
  const creationDate = new Date().toISOString();

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
    !body.status ||
    (body.status && !(body.status === 'PROPOSAL' || body.status === 'REFUSED'))
  ) {
    return new NextResponse(
      JSON.stringify({
        message: 'Only project in PROPOSAL or REFUSED status can be reviewed.',
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

  // 1 - Valida os dados enviados, projeto não é novo, milestones, tasks e itens sim
  if (!body.milestones) {
    return new NextResponse(
      JSON.stringify({
        message: 'Missing at least one Milestone',
      }),
      {
        status: 400,
      },
    );
  }

  const validatedSchema = reviewProjectValidate.safeParse(body);
  if (!validatedSchema.success) {
    console.error(validatedSchema.error);
    return new NextResponse(
      JSON.stringify({
        message: 'Incorrect payload',
      }),
      {
        status: 400,
      },
    );
  }

  let contractItems: any[] = [];
  let milestones: any = [];
  try {
    if (validatedSchema.data.contractId) {
      contractItems = await prisma.contractItem.findMany({
        where: {
          contractId: validatedSchema.data.contractId,
        },
      });
    }

    milestones = body.milestones.map((milestone: any) => {
      const validatedMilestone =
        newProjectMilestoneValidate.safeParse(milestone);
      if (!validatedMilestone.success) {
        console.error(validatedMilestone.error);
        throw new Error(
          `Invalid data for Milestone: ${validatedMilestone.error}`,
        );
      }

      if (!milestone.tasks || !milestone.tasks.length) {
        throw new Error('Missing at least one Task for a Milestone');
      }

      // BUSINESS RULE
      // If the project is linked to a contract, then milestones need to be linked to a VALID contract ID
      if (
        validatedSchema.data.status === 'APPROVED' &&
        (!validatedMilestone.data.contractItemId ||
          (validatedMilestone.data.contractItemId &&
            !contractItems.findIndex(
              (item: tContractItem) =>
                item.id === validatedMilestone.data.contractItemId,
            )))
      ) {
        throw new Error(
          'For contracts with APPROVED status, milestones need to be linked to a VALID contract item.',
        );
      }

      let tasks = milestone.tasks.map((task: any) => {
        const validatedTask = newProjectTaskValidate.safeParse(task);
        if (!validatedTask.success) {
          console.error(validatedTask.error);
          throw new Error(`Invalid data for Task: ${validatedTask.error}`);
        }

        if (!task.activities || !task.activities.length) {
          return {
            ...validatedTask.data,
            createdAt: creationDate,
          };
        }

        const activities = task.activities.map((activity: any) => {
          const validatedActivity =
            newProjectActivityValidate.safeParse(activity);

          if (!validatedActivity.success) {
            console.error(validatedActivity.error);
            throw new Error(
              `Invalid data for Activity: ${validatedActivity.error}`,
            );
          }

          return { ...validatedActivity.data, createdAt: creationDate };
        });

        return {
          ...validatedTask.data,
          createdAt: creationDate,
          activities: {
            create: activities.filter((item: any) => item !== undefined),
          },
        };
      });

      tasks = tasks.filter((item: any) => item !== undefined);

      if (!tasks.length) {
        console.error('Milestones need at least one task');
        throw new Error(`Milestones need at least one task`);
      }

      return {
        ...validatedMilestone.data,
        createdAt: creationDate,
        tasks: {
          create: tasks,
        },
      };
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

  if (!milestones.length) {
    return new NextResponse(
      JSON.stringify({
        message: 'Missing at least one Milestone',
      }),
      {
        status: 400,
      },
    );
  }

  milestones = milestones.filter((item: any) => item !== undefined);

  if (validatedSchema.data.measureType === 'MILESTONE') {
    const sumOfMilestones = milestones.reduce(
      (sum: number, curr: tNewProjectMilestone) => {
        return sum + curr.paymentValue;
      },
      0,
    );
    if (sumOfMilestones !== validatedSchema.data.totalCost) {
      return new NextResponse(
        JSON.stringify({
          message: 'Sum of milestones is different from project cost',
        }),
        {
          status: 400,
        },
      );
    }
  }

  // 2 - Pega os registros atuais e salva em um objeto em memória
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

  //## convert date to ISO string
  if (validatedSchema.data.startDate) {
    validatedSchema.data.startDate = `${validatedSchema.data.startDate}T03:00:00Z`;
  }

  //## convert date to ISO string
  if (validatedSchema.data.endDate) {
    validatedSchema.data.endDate = `${validatedSchema.data.endDate}T03:00:00Z`;
  }

  // 3 - Gravar novos itens
  let reviewedProject: any = null;
  try {
    reviewedProject = await prisma.project.create({
      data: {
        id: projectData.id,
        version: projectData.version + 1,
        createdAt: creationDate,
        companyId: activeCompany?.id,
        ...validatedSchema.data,
        milestones: {
          create: milestones,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({
        message: 'Error writing Project reviewed data',
      }),
      {
        status: 500,
      },
    );
  }

  // 4 - Marcar os itens atuais como isActive = False
  try {
    const currProjectItems = await prisma.projectMilestone.findMany({
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

    if (!currProjectItems) {
      throw new Error('No milestone found. Invalid Project or need permission');
    }

    currProjectItems.forEach(async (milestone) => {
      await prisma.projectMilestone.update({
        where: {
          id: milestone.id,
        },
        data: {
          isActive: false,
          disabledAt: creationDate,
        },
      });

      if (!milestone.tasks) {
        throw new Error('No tasks found. Invalid Project or need permission');
      }

      milestone.tasks.forEach(async (task) => {
        await prisma.projectTask.update({
          where: {
            id: task.id,
          },
          data: {
            isActive: false,
            disabledAt: creationDate,
          },
        });

        if (task.activities) {
          task.activities.forEach(async (activity) => {
            await prisma.projectActivity.update({
              where: {
                id: activity.id,
              },
              data: {
                isActive: false,
                disabledAt: creationDate,
              },
            });
          });
        }
      });
    });

    await prisma.project.update({
      where: {
        projectId: { id: projectData.id, version: projectData.version },
      },
      data: {
        status: 'REVIEWED',
        isActive: false,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({
        message: `Error disabling previous Project version. Error Message: ${error}`,
      }),
      {
        status: 500,
      },
    );
  }

  return new NextResponse(JSON.stringify(reviewedProject));
}
