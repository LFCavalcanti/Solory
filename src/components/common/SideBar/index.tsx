'use client';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  VStack,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useColorModeValue,
  Text,
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
import { useEffect, useState } from 'react';
import fetchApp from '@/lib/fetchApp';
import { tCompany } from '@/types/Company/tCompany';
import {
  tUserSettings,
  tUserSettingsContext,
} from '@/types/User/Settings/tUserSettings';
import { useUserSettingsStore } from '@/lib/hooks/state/useUserSettingsStore';
import { iCompanyMenu } from './menuData';

export default function SideBar() {
  const { data: session, status } = useSession();
  const { push } = useRouter();
  const [userCompanies, setUserCompanies] = useState<iCompanyMenu[]>([]);
  const [userSettings, setUserSettings] = useUserSettingsStore((state) => [
    state.userSettings,
    state.setUserSettings,
  ]);

  const getCompanies = async (): Promise<iCompanyMenu[]> => {
    try {
      const resultData = await fetchApp({
        baseUrl: window.location.origin,
        endpoint: `/api/internal/companies?orderBy=name&tableList=true`,
        cache: 'no-store',
      });
      const companyMenuList = resultData.body.map((item: tCompany) => {
        return {
          key: item.id,
          label: item.aliasName,
          companyId: item.id,
        };
      });
      return companyMenuList;
    } catch (error) {
      console.error(`${error}`);
      throw error;
    }
  };

  const getUserSettingsData = async (): Promise<tUserSettings> => {
    try {
      const userSettings = await fetchApp({
        baseUrl: window.location.origin,
        endpoint: `/api/internal/users/${session?.user.id}/settings`,
        cache: 'no-store',
      });
      return userSettings.body;
    } catch (error) {
      console.error(`${error}`);
      throw error;
    }
  };

  const updateUserSettingsOnDb = async (newSettings: tUserSettingsContext) => {
    try {
      const updatedSettings = await fetchApp({
        method: 'POST',
        baseUrl: window.location.origin,
        endpoint: `/api/internal/users/${session?.user.id}/settings`,
        body: JSON.stringify({
          activeCompanyId: newSettings.activeCompanyId,
          userId: session?.user.id,
        }),
      });
      return updatedSettings.body;
    } catch (error) {
      console.error(`${error}`);
      throw error;
    }
  };

  const changeCompany = async (companyId: string) => {
    const selectedCompany = userCompanies.find((company) => {
      return company.companyId === companyId;
    });
    const updatedSetting = {
      activeCompanyId: selectedCompany?.companyId,
      activeCompanyName: selectedCompany?.label,
      userRoles: [],
    };
    await updateUserSettingsOnDb(updatedSetting);
    setUserSettings(updatedSetting);
  };

  const loadInitialUserData = async () => {
    const companyMenuList = await getCompanies();
    const userSettingsData = await getUserSettingsData();
    let selectedCompany: iCompanyMenu | undefined;
    if (!userSettings.activeCompanyId && userSettingsData.activeCompanyId) {
      selectedCompany = companyMenuList.find(
        (item) => item.companyId === userSettingsData.activeCompanyId,
      );
    } else if (
      !userSettings.activeCompanyId &&
      !userSettingsData.activeCompanyId &&
      companyMenuList.length === 1
    ) {
      selectedCompany = companyMenuList[0];
    }
    const newUserSettings = {
      activeCompanyId: selectedCompany ? selectedCompany.companyId : undefined,
      activeCompanyName: selectedCompany ? selectedCompany.label : undefined,
      userRoles: [],
    };
    setUserSettings(newUserSettings);
    setUserCompanies(companyMenuList);
    updateUserSettingsOnDb(newUserSettings);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      loadInitialUserData();
    }
  }, [status]);

  return (
    <Flex
      height="100%"
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
      <VStack>
        <Box>
          <Text
            padding={2}
            fontSize="14px"
            fontWeight="500"
            color="text.darkMode"
          >
            Empresa ativa:
          </Text>
          <Menu placement="right">
            <MenuButton
              leftIcon={<Icon as={IoEllipsisVerticalSharp} boxSize={5} />}
              iconSpacing={2}
              as={Button}
              width="200px"
              height="50px"
              variant={'sidebar'}
              cursor={'pointer'}
              textAlign="left"
              padding={2}
            >
              <Text
                isTruncated
                textOverflow={'ellipsis'}
                padding={2}
                fontSize="12px"
              >
                {userSettings.activeCompanyName
                  ? userSettings.activeCompanyName
                  : 'SELECIONAR EMPRESA'}
              </Text>
            </MenuButton>
            <MenuList borderRadius="0">
              {userCompanies.map((item) => {
                return (
                  <MenuItem
                    fontFamily="heading"
                    _hover={{ background: 'gray.200' }}
                    key={item.key}
                    onClick={() => changeCompany(item.companyId)}
                  >
                    {item.label}
                  </MenuItem>
                );
              })}
            </MenuList>
          </Menu>
        </Box>
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
          width="60px"
          height="50px"
          rounded={0}
          variant={'sidebar'}
          cursor={'pointer'}
          textAlign="left"
          onClick={() => push('/client/dashboard')}
        >
          <Icon as={IoExitOutline} boxSize={8} />
        </Button>
      </VStack>
    </Flex>
  );
}
