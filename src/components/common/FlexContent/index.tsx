'use client';

import { Flex } from '@chakra-ui/react';

export default function FlexContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      {children}
    </Flex>
  );
}
