'use client';
import { Button, Flex, HStack, Text, Spinner } from '@chakra-ui/react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function SessionHeader() {
  const { data: session, status } = useSession();

  if (session && session.user) {
    return (
      <Flex alignItems="right" justifyContent="right" grow={3}>
        <HStack>
          <Text margin={1}>Olá! {session?.user?.name}</Text>
          <Button variant="primary" margin={1} onClick={() => signOut()}>
            Sair
          </Button>
        </HStack>
      </Flex>
    );
  }

  if (status !== 'loading') {
    return (
      <Flex alignItems="right" justifyContent="right" grow={3}>
        <Button variant="primary" margin={1} onClick={() => signIn()}>
          Acessar
        </Button>
        <Button variant="secondaryOutline" margin={1}>
          Cadastrar
        </Button>
      </Flex>
    );
  }

  return (
    <Flex alignItems="right" justifyContent="right" grow={3}>
      <Spinner color="contrast.500" size="md" margin={1} />
    </Flex>
  );
}
