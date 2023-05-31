'use client';
import { Flex, Button, Text } from '@chakra-ui/react';

export default function IndexPage() {
  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Flex direction="column" background="gray.100" p={12} rounded={6}>
        <Text>PAGINA INICIAL</Text>
      </Flex>
    </Flex>
  );
}
