import { CloseIcon } from '@chakra-ui/icons';
import { Slide, Alert, AlertIcon, IconButton } from '@chakra-ui/react';

export default function TopSuccessSlider({
  showAlert = true,
  alertMessage,
  onClickCallBack,
}: {
  showAlert: boolean;
  alertMessage: string;
  onClickCallBack: (prop: any) => any;
}) {
  return (
    <Slide direction="top" in={showAlert} style={{ zIndex: 10 }}>
      <Alert
        status="success"
        marginLeft="auto"
        marginRight="auto"
        marginTop="10"
        maxWidth={350}
        paddingLeft={10}
        boxShadow="none"
      >
        <AlertIcon />
        {alertMessage}
        <IconButton
          padding={0}
          aria-label="Fechar alerta"
          h="90%"
          ml={2}
          size="md"
          colorScheme="success"
          icon={<CloseIcon color="green.300" />}
          onClick={() => onClickCallBack(false)}
        />
      </Alert>
    </Slide>
  );
}
