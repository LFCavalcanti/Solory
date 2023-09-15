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
      bgGradient="linear-gradient(to right bottom, #066d87, #087c99, #0b8bac, #0f9bbf, #12abd3);"
    >
      {children}
    </Flex>
  );
}
