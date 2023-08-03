import { Menu, MenuButton, Button, MenuList, MenuItem } from '@chakra-ui/react';
import { iMenuItem } from './menuData';
import { useRouter } from 'next/navigation';

interface Props {
  menuData: iMenuItem[];
  title: string;
  ButtonIcon: React.ReactElement | undefined;
}

export default function SideMenu({
  menuData,
  title,
  ButtonIcon = undefined,
}: Props) {
  const { push } = useRouter();
  return (
    <Menu placement="right">
      <MenuButton
        leftIcon={ButtonIcon}
        iconSpacing={2}
        as={Button}
        width="200px"
        height="50px"
        variant={'primary'}
        cursor={'pointer'}
        textAlign="left"
      >
        {title}
      </MenuButton>
      <MenuList borderRadius="0">
        {menuData.map((item) => {
          return (
            <MenuItem
              fontFamily="heading"
              _hover={{ background: 'gray.200' }}
              key={item.key}
              onClick={() => push(item.destination)}
            >
              {item.label}
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}
