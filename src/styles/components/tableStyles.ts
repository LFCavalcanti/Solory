export const TableStyles = {
  variants: {
    registry: {
      boxShadow: 'inner',
      thead: {
        tr: {
          bg: 'brandPrimary.500',
          color: 'text.light',
        },
        th: {
          fontFamily: 'heading',
          fontWeight: '700',
          fontSize: '12px',
        },
      },
      tbody: {
        tr: {
          /*
          _odd: {
            bg: 'gray.100',
          },*/
          _hover: {
            bg: 'contrast.50',
          },
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'gray.300',
          color: 'text.standard',
        },
        td: {
          fontFamily: 'text',
          fontWeight: '500',
          fontSize: '12px',
        },
      },
    },
  },
};
