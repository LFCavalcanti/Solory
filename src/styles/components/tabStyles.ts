import { tabsAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

const registryTabs = definePartsStyle({
  tablist: {
    borderBottom: '2px solid',
    borderColor: 'dark.100',
  },
  tab: {
    _hover: {
      bg: 'brandSecondary.100',
    },
    _selected: {
      color: 'text.light',
      bg: 'brandSecondary.500',
      _hover: {
        bg: 'brandSecondary.300',
      },
    },
  },
});

export const TabsStyles = defineMultiStyleConfig({
  variants: { registryTabs },
});
