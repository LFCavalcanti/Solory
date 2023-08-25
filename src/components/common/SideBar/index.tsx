'use client';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useColorModeValue,
} from '@chakra-ui/react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as menuData from './menuData';
import {
  IoGridOutline,
  IoPeopleOutline,
  IoBusinessOutline,
  IoCashOutline,
  IoHomeOutline,
  IoExitOutline,
  IoEllipsisVerticalSharp,
} from 'react-icons/io5';
import SideMenu from './SideMenu';
import { useState } from 'react';

export default function SideBar() {
  const { data: session, status } = useSession();
  const { push } = useRouter();
  const [userCompanies, setUserCompanies] = useState<menuData.iCompanyMenu[]>([
    {
      key: 'empresa1',
      label: 'Empresa 1',
      companyId: 'a65s4d6a54sd6a54sd65a4sd',
    },
  ]);
  return (
    <Flex
      height="100vh"
      width="200px"
      alignItems="center"
      justifyContent="top"
      flexDirection="column"
      background="brandPrimary.500"
      pt={2}
    >
      <Box bg={useColorModeValue('gray.100', 'gray.900')} padding={2} h={14}>
        <Image src="/logo_h.svg" alt="Solory" width={190} height={42} />
      </Box>
      <Menu>
        <Button
          leftIcon={<Icon as={IoHomeOutline} boxSize={5} />}
          width="200px"
          height="50px"
          variant={'primary'}
          cursor={'pointer'}
          textAlign="left"
          justifyContent="flex-start"
          onClick={() => push('/client/dashboard')}
        >
          Dashboard
        </Button>
      </Menu>
      <SideMenu
        title="Operações"
        menuData={menuData.operationMenu}
        ButtonIcon={<Icon as={IoGridOutline} boxSize={5} />}
      />
      <SideMenu
        title="Clientes"
        menuData={menuData.customerMenu}
        ButtonIcon={<Icon as={IoPeopleOutline} boxSize={5} />}
      />
      <SideMenu
        title="Financeiro"
        menuData={menuData.financeMenu}
        ButtonIcon={<Icon as={IoCashOutline} boxSize={5} />}
      />
      <SideMenu
        title="Empresa"
        menuData={menuData.companyMenu}
        ButtonIcon={<Icon as={IoBusinessOutline} boxSize={5} />}
      />
      <Divider colorScheme="grayAlpha.10" mt={4} mb={4} width={190} />
      <Menu placement="right">
        <MenuButton
          leftIcon={<Icon as={IoEllipsisVerticalSharp} boxSize={5} />}
          iconSpacing={2}
          as={Button}
          width="200px"
          height="50px"
          variant={'primary'}
          cursor={'pointer'}
          textAlign="left"
        >
          Selecionar Empresa
        </MenuButton>
        <MenuList borderRadius="0">
          {userCompanies.map((item) => {
            return (
              <MenuItem
                fontFamily="heading"
                _hover={{ background: 'gray.200' }}
                key={item.key}
              >
                {item.label}
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>
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
            background="brandSecondary.500"
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
      <Button
        // leftIcon={<Icon as={IoExitOutline} boxSize={5} />}
        width="50px"
        height="50px"
        rounded={0}
        variant={'primary'}
        cursor={'pointer'}
        textAlign="left"
        onClick={() => push('/client/dashboard')}
      >
        <Icon as={IoExitOutline} boxSize={8} />
      </Button>
    </Flex>
  );
}
