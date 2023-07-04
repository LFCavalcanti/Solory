import {
  Modal,
  ModalOverlay,
  ModalContent,
  Flex,
  Spinner,
} from '@chakra-ui/react';

export default function LoadingSpinner({
  showSpinner = true,
}: {
  showSpinner: boolean;
}) {
  return (
    <Modal
      isCentered
      size="full"
      isOpen={showSpinner}
      onClose={() => null}
      motionPreset="slideInBottom"
    >
      <ModalOverlay />
      <ModalContent margin={0} rounded="none" bg="whiteAlpha.50">
        <Flex
          height="100vh"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Spinner
            thickness="4px"
            speed="1s"
            emptyColor="gray.200"
            color="contrast.500"
            size="xl"
          />
        </Flex>
      </ModalContent>
    </Modal>
  );
}
