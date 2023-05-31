//export { default } from 'next-auth/middleware';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import verifyAccessToken from './lib/tokens/verifyAccessToken';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/internal')) {
    const accessToken = request.headers.get('authorization');
    const verifiedToken =
      accessToken &&
      (await verifyAccessToken(accessToken).catch((error) => {
        console.error(error);
      }));

    if (!verifiedToken) {
      return new Response(
        JSON.stringify({
          error: 'unauthorized',
        }),
        {
          status: 401,
        },
      );
    }
  }
  if (request.nextUrl.pathname.startsWith('/internal')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      const url = new URL('api/auth/signin', process.env.NEXTAUTH_URL || '');
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }
}

export const config = {
  matcher: ['/internal/:path*', '/api/internal/:path*'],
};
