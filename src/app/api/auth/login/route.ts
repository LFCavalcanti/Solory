import prisma from '@/lib/prisma';
import signAccessToken from '@/lib/tokens/signAccessToken';
import * as bcrypt from 'bcrypt';

interface requestBody {
  username: string;
  password: string;
}

export async function POST(request: Request) {
  const body: requestBody = await request.json();

  const user = await prisma.user.findFirst({
    where: {
      email: body.username,
    },
  });

  if (user && (await bcrypt.compare(body.password, user.password))) {
    const { password, ...userWithoutPass } = user;
    const accessToken = await signAccessToken(JSON.stringify(userWithoutPass));
    console.log(accessToken);
    const result = {
      ...userWithoutPass,
      accessToken,
    };
    return new Response(JSON.stringify(result));
  }

  return new Response(
    JSON.stringify({
      error: 'Credentials are invalid',
    }),
    {
      status: 401,
    },
  );
}
