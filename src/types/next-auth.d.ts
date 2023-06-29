import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string | null | undefined;
      emailVerified?: date | null | undefined;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    emailVerified?: date | null | undefined;
  }
}

declare module 'next-auth/client' {
  interface Session {
    user: {
      id?: string | null | undefined;
      emailVerified?: date | null | undefined;
    } & DefaultSession['user'];
  }
}
