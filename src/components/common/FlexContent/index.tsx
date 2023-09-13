'use client';

import { Flex } from '@chakra-ui/react';

export default function FlexContent({
  children,
  backgroundColor,
}: {
  children: React.ReactNode;
  backgroundColor?: string;
}) {
  return (
    <Flex
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      bg={backgroundColor}
    >
      {children}
    </Flex>
  );
}
