import { CloseIcon } from '@chakra-ui/icons';
import { Slide, Alert, AlertIcon, IconButton } from '@chakra-ui/react';

export default function TopErrorSlider({
  showError = true,
  errorMessage,
  onClickCallBack,
}: {
  showError: boolean;
  errorMessage: string;
  onClickCallBack: (prop: any) => any;
}) {
  return (
    <Slide direction="top" in={showError} style={{ zIndex: 10 }}>
      <Alert
        status="error"
        marginLeft="auto"
        marginRight="auto"
        marginTop="10"
        maxWidth={350}
        paddingLeft={10}
        boxShadow="xl"
      >
        <AlertIcon />
        {errorMessage}
        <IconButton
          padding={0}
          aria-label="Fechar alerta"
          h="90%"
          ml={2}
          size="md"
          colorScheme="error"
          icon={<CloseIcon color="red.300" />}
          onClick={() => onClickCallBack(false)}
        />
      </Alert>
    </Slide>
  );
}
