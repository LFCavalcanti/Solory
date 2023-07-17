//export { default } from 'next-auth/middleware';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import verifyAccessToken from './lib/tokens/verifyAccessToken';

export async function middleware(request: NextRequest) {
  //API PROTECTION
  if (request.nextUrl.pathname.startsWith('/server/internal')) {
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

  //INTERNAL PAGES PROTECTION
  if (request.nextUrl.pathname.startsWith('/client')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      const url = new URL('auth/login', process.env.NEXTAUTH_URL || '');
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    if (!token.emailVerified) {
      console.log(token.emailVerified);
      const url = new URL(
        'auth/sendverification',
        process.env.NEXTAUTH_URL || '',
      );
      return NextResponse.redirect(url);
    }
  }

  //IF USER HAS SESSION PREVENT LOADING LOGIN PAGE
  if (request.nextUrl.pathname.startsWith('/auth/login')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (token) {
      const url = new URL('client/dashboard', process.env.NEXTAUTH_URL || '');
      return NextResponse.redirect(url);
    }
  }
}

export const config = {
  matcher: ['/client/:path*', '/server/internal/:path*', '/auth/login'],
};
