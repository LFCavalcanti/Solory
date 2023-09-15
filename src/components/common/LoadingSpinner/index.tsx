'use client';
import { useLoadingSpinnerStore } from '@/lib/hooks/state/useLoadingSpinnerStore';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Flex,
  Spinner,
} from '@chakra-ui/react';

export default function LoadingSpinner() {
  const isSpinnerOpen = useLoadingSpinnerStore((state) => state.isSpinnerOpen);
  return (
    <Modal
      isCentered
      size="full"
      isOpen={isSpinnerOpen}
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
