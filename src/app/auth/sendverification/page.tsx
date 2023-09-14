'use client';
import fetchApp from '@/lib/fetchApp';
import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import FlexGradient from '@/components/common/FlexGradient';

interface iValidationReturn {
  status: number;
  body: any;
}

export default function SendVerification() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resentEmail, setResentEmail] = useState(false);
  const [validationCall, setValidationCall] =
    useState<iValidationReturn | null>(null);

  const userId = !session ? '' : session.user.id;

  const checkValidation = async (forceResend: boolean = false) => {
    const validationReturn = await fetchApp({
      method: 'POST',
      baseUrl: window.location.origin,
      endpoint: '/api/email/sendEmailVerification',
      body: JSON.stringify({ id: userId, forceResend }),
      cache: 'no-store',
    });
    return validationReturn;
  };

  const forceSendEmail = async () => {
    const validationResendCall = await checkValidation(true);

    if (validationResendCall && validationResendCall.status === 200) {
      setResentEmail(true);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      checkValidation().then((data) => {
        setValidationCall(data);
        if (data.status === 409 && data.body.alreadyVerified) {
          setTimeout(() => {
            signOut({ callbackUrl: '/auth/login' });
          }, 5000);
        }
      });
    }
    if (status !== 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status]);

  if (
    status !== 'loading' &&
    validationCall &&
    (validationCall.status === 200 || validationCall.body.alreadySent)
  ) {
    return (
      <FlexGradient>
        <Flex
          borderBottom="10px solid"
          borderColor="contrast.500"
          alignItems="center"
          justifyContent="center"
          bg="backgroundLight"
          flexDirection="column"
          boxShadow="lg"
          width={[
            '90%', // 0-30em
            '80%', // 30em-48em
            '70%', // 48em-62em
            '50%', // 62em+
          ]}
          gap="4"
          paddingBottom={5}
        >
          <Box padding={4}>
            <Image src="/logo_h.svg" alt="Solory" width={200} height={42} />
          </Box>
          <Heading color="text.standard" fontFamily="heading" fontSize={18}>
            {validationCall.body.alreadySent
              ? 'A VERIFICAÇÃO JÁ FOI ENVIADA ANTERIORMENTE'
              : 'O LINK DE VERIFICAÇÃO FOI ENVIADO PARA SEU E-MAIL'}
          </Heading>
          <Text color="text.standard">
            O link de verificação expira em{' '}
            <strong>
              {new Date(validationCall.body.expiration).toLocaleString()}
            </strong>
          </Text>
          <Stack direction="row" spacing={6}>
            {resentEmail ? (
              <Text color="text.standard">E-mail reenviado</Text>
            ) : (
              <Button variant="secondary" onClick={() => forceSendEmail()}>
                REENVIAR
              </Button>
            )}
            <Button
              rightIcon={<CloseIcon />}
              variant="contrast"
              onClick={() => router.push('/')}
            >
              SAIR
            </Button>
          </Stack>
        </Flex>
      </FlexGradient>
    );
  }

  if (
    status !== 'loading' &&
    validationCall &&
    validationCall.status === 409 &&
    validationCall.body.alreadyVerified
  ) {
    return (
      <FlexGradient>
        <Flex
          borderBottom="10px solid"
          borderColor="contrast.500"
          alignItems="center"
          justifyContent="center"
          bg="backgroundLight"
          flexDirection="column"
          boxShadow="lg"
          width={[
            '90%', // 0-30em
            '80%', // 30em-48em
            '70%', // 48em-62em
            '50%', // 62em+
          ]}
          gap="4"
          paddingBottom={5}
        >
          <Box padding={4}>
            <Image src="/logo_h.svg" alt="Solory" width={200} height={42} />
          </Box>
          <Heading color="text.standard" fontFamily="heading" fontSize={18}>
            SEU ENDEREÇO DE E-MAIL JÁ FOI VALIDADO
          </Heading>
          <Text>
            VOCÊ SERÁ REDIRECIONADO(A) PARA EFETUAR LOGIN EM 5 SEGUNDOS...
          </Text>
        </Flex>
      </FlexGradient>
    );
  }

  if (status !== 'loading' && validationCall && validationCall.status) {
    return (
      <FlexGradient>
        <Flex
          borderBottom="10px solid"
          borderColor="contrast.500"
          alignItems="center"
          justifyContent="center"
          bg="backgroundLight"
          flexDirection="column"
          boxShadow="lg"
          width={[
            '90%', // 0-30em
            '80%', // 30em-48em
            '70%', // 48em-62em
            '50%', // 62em+
          ]}
          gap="4"
          paddingBottom={5}
        >
          <Image src="/logo_h.svg" alt="Solory" width={200} height={42} />
          <Heading
            color="text.light"
            bg="error"
            fontFamily="heading"
            fontSize={18}
            padding="2"
          >
            NÃO FOI POSSÍVEL PROCESSAR - TENTE MAIS TARDE
          </Heading>
          <Button
            rightIcon={<CloseIcon />}
            variant="contrast"
            onClick={() => router.push('/')}
          >
            SAIR
          </Button>
        </Flex>
      </FlexGradient>
    );
  }

  return (
    <Flex
      height="100vh"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      bg="whiteAlpha.50"
      gap="4"
    >
      <Spinner
        thickness="4px"
        speed="1s"
        emptyColor="gray.200"
        color="contrast.500"
        size="xl"
      />
      <Text color="text.standard" fontWeight="500">
        Verificando sua conta...
      </Text>
    </Flex>
  );
}
