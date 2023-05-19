import { Image } from '@chakra-ui/next-js';
import { Flex } from '@chakra-ui/react';

export default function Header() {
  return (
    <Flex
      height={16}
      background="gray.100"
      alignItems="left"
      justifyContent="left"
      padding={3}
    >
      <Image src="/logo_h.svg" alt="Solory" width={200} height={42} />
    </Flex>
  );
}
