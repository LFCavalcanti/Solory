import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string | null | undefined;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/client' {
  interface Session {
    user: {
      id?: string | null | undefined;
    } & DefaultSession['user'];
  }
}
