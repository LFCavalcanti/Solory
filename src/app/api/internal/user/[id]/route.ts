// import { verifyJwt } from '@/lib/jwt';
import prisma from '@/lib/prisma';

interface Params {
  id: number;
}
export async function GET(request: Request, params: Params) {
  /* const accessToken = request.headers.get('authorization');
  if (!accessToken || !verifyJwt(accessToken)) {
    return new Response(
      JSON.stringify({
        error: 'unauthorized',
      }),
      {
        status: 401,
      },
    );
  } */
  const user = await prisma.user.findFirst({
    where: {
      id: params.id,
    },
  });

  if (user) {
    const { password, ...userWithoutPass } = user;
    return new Response(JSON.stringify(userWithoutPass));
  }

  return new Response(JSON.stringify(null));
}
