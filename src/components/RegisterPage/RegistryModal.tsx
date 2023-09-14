import { useRegistryFormStore } from '@/lib/hooks/state/useRegistryFormStore';
import { Modal, ModalOverlay, ModalContent, ModalBody } from '@chakra-ui/react';

export default function RegistryModal({
  FormComponent,
}: {
  FormComponent: React.FC;
}) {
  const [isOpen, closeForm] = useRegistryFormStore((state) => [
    state.isOpen,
    state.closeForm,
  ]);
  return (
    <Modal
      closeOnOverlayClick={false}
      blockScrollOnMount={true}
      scrollBehavior={'inside'}
      isOpen={isOpen}
      onClose={closeForm}
      motionPreset="slideInRight"
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        borderRadius="0"
        maxHeight="calc(100vh - 50px)"
        maxWidth="calc(100vw - 50px)"
        height="fit-content"
      >
        <ModalBody>
          <FormComponent />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
