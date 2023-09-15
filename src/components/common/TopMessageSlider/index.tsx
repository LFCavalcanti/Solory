import { useTopMessageSliderStore } from '@/lib/hooks/state/useTopMessageSliderStore';
import { CloseIcon } from '@chakra-ui/icons';
import { Slide, Alert, AlertIcon, IconButton } from '@chakra-ui/react';

export default function TopMessageSlider() {
  const [isOpen, type, message, closeTopMessage] = useTopMessageSliderStore(
    (state) => [state.isOpen, state.type, state.message, state.closeTopMessage],
  );

  return (
    <Slide direction="top" in={isOpen} style={{ zIndex: 10 }}>
      <Alert
        status={type}
        paddingLeft={10}
        alignItems="center"
        justifyContent="center"
        boxShadow="md"
        marginLeft="auto"
        marginRight="auto"
        marginTop="10"
        maxWidth="lg"
      >
        <AlertIcon boxSize={6} />
        {message}
        <IconButton
          padding={0}
          aria-label="Fechar alerta"
          h="90%"
          ml={2}
          size="md"
          colorScheme="error"
          icon={<CloseIcon color="gray.700" />}
          onClick={() => closeTopMessage()}
        />
      </Alert>
    </Slide>
  );
}
