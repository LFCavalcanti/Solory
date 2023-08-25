export const ButtonStyles = {
  baseStyle: {
    fontFamily: 'var(--chakra-fonts-button)',
    fontWeight: '500',
    borderRadius: 0,
  },
  sizes: {},
  variants: {
    primary: {
      bg: 'brandPrimary.500',
      color: 'text.darkMode',
      boxShadow: 'base',
      _hover: {
        bg: 'brandPrimary.600',
      },
      _active: {
        bg: 'brandPrimary.400',
      },
    },
    primaryOutline: {
      bg: 'transparent',
      border: '1px solid',
      borderColor: 'brandPrimary.500',
      color: 'brandPrimary.500',
      boxShadow: 'inner',
      _hover: {
        bg: 'brandPrimary.500',
        color: 'text.darkMode',
      },
      _active: {
        bg: 'brandPrimary.300',
        color: 'text.darkMode',
        borderColor: 'brandPrimary.300',
      },
    },
    secondary: {
      bg: 'brandSecondary.500',
      color: 'text.darkMode',
      boxShadow: 'base',
      _hover: {
        bg: 'brandSecondary.400',
      },
      _active: {
        bg: 'brandSecondary.200',
      },
    },
    secondaryOutline: {
      bg: 'transparent',
      border: '2px solid',
      borderColor: 'brandSecondary.500',
      color: 'brandSecondary.500',
      boxShadow: 'inner',
      _hover: {
        bg: 'brandSecondary.500',
        color: 'text.darkMode',
      },
      _active: {
        bg: 'brandSecondary.300',
        color: 'text.darkMode',
        borderColor: 'brandSecondary.300',
      },
    },
    contrast: {
      bg: 'contrast.500',
      color: 'text.standard',
      fontWeight: 700,
      boxShadow: 'base',
      _hover: {
        bg: 'contrast.300',
      },
      _active: {
        bg: 'contrast.600',
        color: 'text.darkMode',
      },
    },
    contrastOutline: {
      bg: 'transparent',
      border: '2px solid',
      borderColor: 'contrast.500',
      color: 'contrast.500',
      boxShadow: 'inner',
      _hover: {
        bg: 'contrast.500',
        color: 'text.darkMode',
      },
      _active: {
        bg: 'contrast.600',
        color: 'text.darkMode',
        borderColor: 'contrast.600',
      },
    },
    delete: {
      bg: 'transparent',
      border: '2px solid',
      borderColor: 'red.300',
      color: 'red.300',
      boxShadow: 'inner',
      _hover: {
        bg: 'red.300',
        color: 'text.darkMode',
      },
      _active: {
        bg: 'red.200',
        color: 'text.darkMode',
        borderColor: 'red.200',
      },
    },
    tableMenu: {
      bg: 'transparent',
      color: 'text.standard',
      _hover: {
        bg: 'gray.200',
        boxShadow: 'sm',
      },
      _active: {
        bg: 'brandSecondary.500',
        color: 'text.darkMode',
        boxShadow: 'sm',
      },
    },
    tableNavigation: {
      bg: 'gray.300',
      color: 'text.standard',
      fontSize: '11px',
      _hover: {
        bg: 'brandSecondary.500',
        color: 'text.darkMode',
        boxShadow: 'sm',
      },
      _active: {
        bg: 'brandSecondary.300',
        color: 'text.darkMode',
        boxShadow: 'sm',
      },
    },
  },
  defaultProps: {},
};
