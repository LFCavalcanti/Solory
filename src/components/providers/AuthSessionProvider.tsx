'use client';
import { ReactNode } from 'react';
import { SessionProvider as NextAuthProvider } from 'next-auth/react';

interface Props {
  children: ReactNode;
}

export default function AuthSessionProvider({ children }: Props) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
