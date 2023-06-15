// import { verifyJwt } from '@/lib/jwt';
import prisma from '@/lib/prisma';

interface Params {
  id: string;
}
export async function GET(request: Request, params: Params) {
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
