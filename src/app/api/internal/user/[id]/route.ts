// import { verifyJwt } from '@/lib/jwt';
import prisma from '@/lib/prisma';

interface Params {
  id: string;
}
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await prisma.user.findFirstOrThrow({
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
