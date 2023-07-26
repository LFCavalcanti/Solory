'use client';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Text,
} from '@chakra-ui/react';
//import { Image } from '@chakra-ui/next-js';
import Image from 'next/image';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { signOut, useSession } from 'next-auth/react';
import NavLink from '@/components/NavLink';
import { useRouter } from 'next/navigation';

const Links = [
  { dest: '/client/dashboard', label: 'Dashboard' },
  { dest: '/client/cadastros', label: 'Cadastros' },
  { dest: '/client/apontamentos', label: 'Apontamentos' },
  { dest: '/client/financeiro', label: 'Financeiro' },
];

export default function NavBar() {
  const { data: session, status } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { push } = useRouter();

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Image src="/logo_h.svg" alt="Solory" width={200} height={42} />
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}
            >
              {Links.map((link) => (
                <NavLink dest={link.dest} key={link.label}>
                  {link.label}
                </NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            {session && session.user && (
              <Text margin={1}>Olá! {session?.user?.name}</Text>
            )}
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Avatar
                  size={'md'}
                  name={session?.user?.name || undefined}
                  src={session?.user?.image || undefined}
                  background="primary.500"
                />
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => push('/client/userprofile')}>
                  Meu Perfil
                </MenuItem>
                <MenuItem>Configurações</MenuItem>
                <MenuDivider />
                <MenuItem onClick={() => signOut()}>Sair</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} rounded={0} spacing={4}>
              {Links.map((link) => (
                <NavLink dest={link.dest} key={link.label}>
                  {link.label}
                </NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
