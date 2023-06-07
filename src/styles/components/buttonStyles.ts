export const ButtonStyles = {
  baseStyle: {
    fontFamily: 'var(--chakra-fonts-button)',
    fontWeight: '500',
    borderRadius: 0,
  },
  sizes: {},
  variants: {
    primary: {
      bg: 'primary.500',
      color: 'text.darkMode',
      _hover: {
        bg: 'primary.600',
      },
    },
    primaryOutline: {
      bg: 'transparent',
      border: '1px solid',
      borderColor: 'primary.500',
      color: 'primary.500',
      _hover: {
        bg: 'primary.500',
        color: 'text.darkMode',
      },
    },
    secondary: {
      bg: 'secondary.500',
      color: 'text.darkMode',
      _hover: {
        bg: 'secondary.400',
      },
    },
    secondaryOutline: {
      bg: 'transparent',
      border: '2px solid',
      borderColor: 'secondary.500',
      color: 'secondary.500',
      _hover: {
        bg: 'secondary.500',
        color: 'text.darkMode',
      },
    },
    contrast: {
      bg: 'contrast.500',
      color: 'text.standard',
      fontWeight: 700,
      _hover: {
        bg: 'contrast.300',
      },
    },
    contrastOutline: {
      bg: 'transparent',
      border: '2px solid',
      borderColor: 'contrast.500',
      color: 'contrast.500',
      _hover: {
        bg: 'contrast.500',
        color: 'text.darkMode',
      },
    },
  },
  defaultProps: {},
};
