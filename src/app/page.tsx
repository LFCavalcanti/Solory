'use client';
import { Flex, Button, Text } from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
//import { Image } from '@chakra-ui/next-js';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function IndexPage() {
  const { push } = useRouter();
  return (
    <Flex
      height="100vh"
      alignItems="center"
      justifyContent="center"
      direction="column"
    >
      <Flex
        background="gray.100"
        p={12}
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Image src="/logo_h.svg" alt="Solory" width={200} height={42} />
        <Text>PAGINA INICIAL</Text>
      </Flex>
      <Flex alignItems="right" justifyContent="right" mt={4}>
        <Button variant="primary" margin={1} onClick={() => signIn()}>
          Acessar
        </Button>
        <Button
          variant="secondaryOutline"
          margin={1}
          onClick={() => push('/auth/signup')}
        >
          Cadastrar
        </Button>
      </Flex>
    </Flex>
  );
}
