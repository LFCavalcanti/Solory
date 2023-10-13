'use client';
import { ReactNode } from 'react';
import soloryTheme from '@/styles/theme';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, ToastProviderProps } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

export default function ChakraUiProvider({ children }: Props) {
  const toastOptions: ToastProviderProps = {
    defaultOptions: {
      position: 'top',
      duration: 9000,
      isClosable: true,
      variant: 'subtle',
    },
  };
  return (
    <CacheProvider>
      <ChakraProvider theme={soloryTheme} toastOptions={toastOptions} resetCSS>
        {children}
      </ChakraProvider>
    </CacheProvider>
  );
}
