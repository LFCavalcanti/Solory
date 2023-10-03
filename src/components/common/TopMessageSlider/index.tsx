import { useTopMessageSliderStore } from '@/lib/hooks/state/useTopMessageSliderStore';
import { CloseIcon } from '@chakra-ui/icons';
import {
  Slide,
  Alert,
  AlertIcon,
  IconButton,
  AlertTitle,
  Flex,
} from '@chakra-ui/react';

export default function TopMessageSlider() {
  const [isOpen, type, message, title, closeTopMessage] =
    useTopMessageSliderStore((state) => [
      state.isOpen,
      state.type,
      state.message,
      state.title,
      state.closeTopMessage,
    ]);

  return (
    <Slide direction="top" in={isOpen} style={{ zIndex: 90000 }}>
      <Alert
        status={type}
        paddingLeft={10}
        alignItems="center"
        justifyContent="center"
        boxShadow="md"
        marginLeft="auto"
        marginRight="auto"
        marginTop="10"
        maxWidth="xl"
      >
        <AlertIcon boxSize={6} />
        <Flex flexDirection="column">
          {title && (
            <AlertTitle
              color="text.standard"
              fontFamily="heading"
              fontWeight="700"
            >
              {title}
            </AlertTitle>
          )}
          {message}
        </Flex>
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
