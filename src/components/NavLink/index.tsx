'use client';
import { ReactNode } from 'react';
import { Link, useColorModeValue } from '@chakra-ui/react';
interface Props {
  dest?: string;
  children: ReactNode;
}
export default function NavLink({ dest = '#', children }: Props) {
  return (
    <Link
      px={2}
      py={1}
      rounded="none"
      _hover={{
        textDecoration: 'none',
        color: 'text.light',
        bg: useColorModeValue('primary.500', 'gray.700'),
      }}
      href={dest}
    >
      {children}
    </Link>
  );
}
