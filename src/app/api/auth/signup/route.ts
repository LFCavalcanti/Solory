import prisma from '@/lib/prisma';
import { tUserMinimal } from '@/types/User/tUser';
import * as bcrypt from 'bcrypt';

interface RequestBody {
  name: string;
  email: string;
  password: string;
}
export async function POST(request: Request) {
  const body: RequestBody = await request.json();
  try {
    const existUser = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (existUser?.email) {
      return new Response(JSON.stringify('User already exists'), {
        status: 409,
      });
    }

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: await bcrypt.hash(body.password, 10),
      },
    });

    const userWithoutPass: Partial<tUserMinimal> = user;
    delete userWithoutPass.password;

    return new Response(JSON.stringify(userWithoutPass));
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify('Service unavailable'), {
      status: 503,
    });
  }
}
