import {
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from '@chakra-ui/react';
import { useRef } from 'react';

interface props {
  isAlertOpen: boolean;
  title: string;
  message: string;
  onCloseCallback: () => void;
}

export default function TimedRedirectAlert({
  isAlertOpen,
  title,
  message,
  onCloseCallback,
}: props) {
  const alertRef = useRef(null);

  return (
    <AlertDialog
      motionPreset="scale"
      leastDestructiveRef={alertRef}
      onClose={onCloseCallback}
      isOpen={isAlertOpen}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
    >
      <AlertDialogOverlay />

      <AlertDialogContent>
        <AlertDialogHeader
          color="text.standard"
          fontFamily="heading"
          fontWeight="700"
        >
          {title}
        </AlertDialogHeader>
        <AlertDialogBody>{message}</AlertDialogBody>
      </AlertDialogContent>
    </AlertDialog>
  );
}
