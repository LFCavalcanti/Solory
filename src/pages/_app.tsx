import type { AppType } from 'next/app';
import { trpc } from '../utils/trpc';
import { ChakraProvider } from '@chakra-ui/react';
import soloryTheme from '@/styles/theme';
import Header from '@/components/common/Header';

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ChakraProvider theme={soloryTheme}>
      <Header />
      <Component {...pageProps} />
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);
