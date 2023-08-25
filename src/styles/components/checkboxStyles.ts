import { checkboxAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(checkboxAnatomy.keys);

const registryHead = definePartsStyle({
  control: defineStyle({
    borderRadius: 0,
    borderColor: 'gray.300',
    _checked: {
      border: 'none',
      bg: 'gray.300',
      _hover: {
        bg: 'contrast.200',
      },
    },
    _indeterminate: {
      border: 'none',
      bg: 'gray.300',
      _hover: {
        bg: 'contrast.200',
      },
    },
  }),
  icon: defineStyle({
    color: 'gray.500',
    bg: 'none',
  }),
});

const registryRow = definePartsStyle({
  control: defineStyle({
    borderRadius: 0,
    borderColor: 'gray.300',
    _checked: {
      border: 'none',
      bg: 'brandSecondary.500',
      _hover: {
        bg: 'brandSecondary.300',
      },
    },
    _hover: {
      bg: 'contrast.100',
    },
  }),
  icon: defineStyle({
    color: 'gray.100',
    bg: 'none',
  }),
});

export const CheckboxStyles = defineMultiStyleConfig({
  variants: { registryHead, registryRow },
});
