'use client';
import { Flex, Heading, Input, Button } from '@chakra-ui/react';
//import { trpc } from 'src/utils/trpc';

export default function IndexPage() {
  return (
    <Flex height="100vh" alignItems="center" justifyContent="center">
      <Flex direction="column" background="gray.100" p={12} rounded={6}>
        <Heading mb={6}>Login</Heading>
        <Input
          placeholder="seu@email.com.br"
          variant={'filled'}
          mb={3}
          type="email"
        />
        <Input
          placeholder="********"
          variant={'filled'}
          mb={6}
          type="password"
        />
        <Button colorScheme="teal">Acessar</Button>
      </Flex>
    </Flex>
  );
}
