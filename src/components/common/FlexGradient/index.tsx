'use client';

import { Flex } from '@chakra-ui/react';

export default function FlexGradient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex
      height="100vh"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      bgGradient="linear-gradient(to right bottom, #066d87, #087895, #0a84a3, #0d8fb1, #0f9bbf, #00a6c2, #00b1c3, #00bcc2, #13c6a7, #5bcb80, #97cc52, #d4c528);"
    >
      {children}
    </Flex>
  );
}
