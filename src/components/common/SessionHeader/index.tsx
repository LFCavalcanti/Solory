'use client';
import { Button, Flex, HStack, Text } from '@chakra-ui/react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function SessionHeader() {
  const { data: session } = useSession();
  if (session && session.user) {
    return (
      <Flex alignItems="right" justifyContent="right" grow={3}>
        <HStack>
          <Text margin={1}>Olá! {session?.user?.name}</Text>
          <Button colorScheme="teal" margin={1} onClick={() => signOut()}>
            Sair
          </Button>
        </HStack>
      </Flex>
    );
  }

  return (
    <Flex alignItems="right" justifyContent="right" grow={3}>
      <Button colorScheme="teal" margin={1} onClick={() => signIn()}>
        Acessar
      </Button>
      <Button colorScheme="teal" margin={1}>
        Cadastrar
      </Button>
    </Flex>
  );
}
