import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { newProjectValidate } from '@/types/Project/tProject';
import {
  newProjectMilestoneValidate,
  tNewProjectMilestone,
} from '@/types/Project/tProjectMilestone';
import { newProjectTaskValidate } from '@/types/Project/tProjectTask';
import { newProjectActivityValidate } from '@/types/Project/tProjectActivity';
import { tContractItem } from '@/types/Contract/tContractItem';

export async function POST(request: NextRequest) {
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

  //--> CHECAR PAYLOAD SE ESTA COM OS DADOS CORRETOS
  const validatedSchema = newProjectValidate.safeParse(body);
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

  let contractItems: any[] = [];
  let milestones: any = [];
  try {
    if (validatedSchema.data.status === 'APPROVED') {
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
      // If the project is APPROVED, then milestones need to be linked to a VALID contract ID
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

      let tasks = milestones.tasks.map((task: any) => {
        const validatedTask = newProjectTaskValidate.safeParse(task);
        if (!validatedTask.success) {
          console.error(validatedTask.error);
          throw new Error(`Invalid data for Task: ${validatedTask.error}`);
        }

        if (!task.activities || task.activities.length) {
          return validatedTask.data;
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

          return validatedActivity.data;
        });

        return {
          ...validatedTask.data,
          activities: activities.filter((item: any) => item !== undefined),
        };
      });

      tasks = tasks.filter((item: any) => item !== undefined);

      if (!tasks.length) {
        console.error('Milestones need at least one task');
        throw new Error(`Milestones need at least one task`);
      }

      return {
        ...validatedMilestone.data,
        tasks,
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

  //--> CRIAR PRODUTO
  let registryData: any = null;
  try {
    registryData = await prisma.project.create({
      data: {
        createdAt: new Date().toISOString(),
        companyId: activeCompany?.id,
        ...validatedSchema.data,
        milestones,
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({
        message: 'Error creating the Project',
      }),
      {
        status: 500,
      },
    );
  }

  //--> RETORNAR PRODUTO
  return new NextResponse(JSON.stringify(registryData));
}
