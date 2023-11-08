import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import { simplesNacConfigValidate } from '@/types/SimplesNacConfig/tSimplesNacConfig';

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
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

  const currRegistry = await prisma.simplesNacConfig.findFirst({
    where: {
      id: params.id,
    },
  });
  if (!currRegistry) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 404,
      },
    );
  }

  return new Response(JSON.stringify(currRegistry));
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  const body = await request.json();
  const currentDate = new Date().toISOString();

  if (!session || !session.user || !session.user.id) {
    return new Response(
      JSON.stringify({
        message: 'Invalid Session',
      }),
      {
        status: 401,
      },
    );
  }

  if (!body) {
    return new Response(
      JSON.stringify({
        message: 'Incorrect payload',
      }),
      {
        status: 400,
      },
    );
  }

  if (body.id) {
    return new Response(
      JSON.stringify({
        message: 'Entity Id must not be present in payload body',
      }),
      {
        status: 400,
      },
    );
  }
  //--> CHECAR PAYLOAD SE ESTA COM OS DADOS CORRETOS
  const validatedSchema = simplesNacConfigValidate.safeParse(body);
  if (!validatedSchema.success) {
    console.error(validatedSchema.error);
    return new Response(
      JSON.stringify({
        message: 'Incorrect payload',
      }),
      {
        status: 400,
      },
    );
  }

  const currRegistry = await prisma.simplesNacConfig.findFirst({
    where: {
      id: params.id,
    },
  });

  if (!currRegistry) {
    return new Response(
      JSON.stringify({
        message: `### ID ${params.id} does not exist or insufficient permission`,
      }),
      {
        status: 403,
      },
    );
  }

  //## convert date to ISO string
  if (validatedSchema.data.activeSince) {
    validatedSchema.data.activeSince = `${validatedSchema.data.activeSince}T03:00:00Z`;
  }

  //## convert date to ISO string
  if (validatedSchema.data.expiresAt) {
    validatedSchema.data.expiresAt = `${validatedSchema.data.expiresAt}T03:00:00Z`;
  }

  const updatedRegistry = await prisma.simplesNacConfig.update({
    where: { id: params.id },
    data: {
      ...(validatedSchema.data.isActive == false &&
        currRegistry.isActive == true && {
          disabledAt: currentDate,
        }),
      ...(validatedSchema.data.isActive == true &&
        currRegistry.isActive == false && {
          disabledAt: null,
        }),
      ...validatedSchema.data,
    },
  });

  if (!updatedRegistry) {
    return new Response(
      JSON.stringify({
        message: 'Error updating Simples Nac Config',
      }),
      {
        status: 409,
      },
    );
  }

  return new Response(JSON.stringify(updatedRegistry));
}
