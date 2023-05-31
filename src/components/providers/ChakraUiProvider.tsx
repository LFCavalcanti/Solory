'use client';
import { ReactNode } from 'react';
import soloryTheme from '@/styles/theme';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

export default function ChakraUiProvider({ children }: Props) {
  return (
    <CacheProvider>
      <ChakraProvider theme={soloryTheme}>{children}</ChakraProvider>
    </CacheProvider>
  );
}
