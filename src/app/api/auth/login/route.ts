import prisma from '@/lib/prisma';
import signAccessToken from '@/lib/tokens/signAccessToken';
import { tUserMinimal } from '@/types/User/tUser';
import * as bcrypt from 'bcrypt';

interface requestBody {
  username: string;
  password: string;
}

export async function POST(request: Request) {
  const body: requestBody = await request.json();

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.username,
      },
    });
    if (
      user &&
      user.password &&
      (await bcrypt.compare(body.password, user.password))
    ) {
      const userWithoutPass: Partial<tUserMinimal> = user;
      delete userWithoutPass.password;
      const accessToken = await signAccessToken(
        JSON.stringify(userWithoutPass),
      );
      const result = {
        ...userWithoutPass,
        accessToken,
      };
      return new Response(JSON.stringify(result));
    } else {
      return new Response(JSON.stringify('Credentials are invalid'), {
        status: 401,
      });
    }
  } catch (err) {
    return new Response(JSON.stringify('Service unavailable'), {
      status: 503,
    });
  }
}
