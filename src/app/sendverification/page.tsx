'use client';
import fetchApp from '@/lib/fetchApp';
import { Button, Flex, Heading, Spinner, Stack, Text } from '@chakra-ui/react';
import { Image, Link } from '@chakra-ui/next-js';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CloseIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';

interface iValidationReturn {
  status: number;
  body: any;
}

export default function sendVerification() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resentEmail, setResentEmail] = useState(false);
  const [validationCall, setValidationCall] =
    useState<iValidationReturn | null>(null);

  const checkValidation = async (forceResend: boolean = false) => {
    const validationReturn = await fetchApp({
      method: 'POST',
      baseUrl: window.location.origin,
      endpoint: '/api/email/sendEmailVerification',
      //@ts-ignore
      body: JSON.stringify({ id: session.user.id, forceResend }),
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
    if (status !== 'loading') {
      checkValidation().then((data) => {
        setValidationCall(data);
      });
    }
  }, [status]);

  if (
    status !== 'loading' &&
    validationCall &&
    (validationCall.status === 200 || validationCall.body.alreadySent)
  ) {
    return (
      <Flex
        height="100vh"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        bgGradient="linear-gradient(to right bottom, #066d87, #087895, #0a84a3, #0d8fb1, #0f9bbf, #00a6c2, #00b1c3, #00bcc2, #13c6a7, #5bcb80, #97cc52, #d4c528);"
      >
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
          <Image
            src="/logo_h.svg"
            alt="Solory"
            width={200}
            height={42}
            margin={4}
          />
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
      </Flex>
    );
  }

  if (
    status !== 'loading' &&
    validationCall &&
    validationCall.status === 409 &&
    validationCall.body.alreadyVerified
  ) {
    return (
      <Flex
        height="100vh"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        bgGradient="linear-gradient(to right bottom, #066d87, #087895, #0a84a3, #0d8fb1, #0f9bbf, #00a6c2, #00b1c3, #00bcc2, #13c6a7, #5bcb80, #97cc52, #d4c528);"
      >
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
          <Image
            src="/logo_h.svg"
            alt="Solory"
            width={200}
            height={42}
            margin={4}
          />
          <Heading color="text.standard" fontFamily="heading" fontSize={18}>
            SEU ENDEREÇO DE E-MAIL JÁ FOI VALIDADO
          </Heading>
          <Link
            padding="2"
            bg="primary.500"
            color="text.light"
            fontWeight="500"
            fontFamily="button"
            href="/internal/dashboard"
          >
            Ir para Dashboard
          </Link>
        </Flex>
      </Flex>
    );
  }

  if (status !== 'loading' && validationCall && validationCall.status) {
    return (
      <Flex
        height="100vh"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        bgGradient="linear-gradient(to right bottom, #066d87, #087895, #0a84a3, #0d8fb1, #0f9bbf, #00a6c2, #00b1c3, #00bcc2, #13c6a7, #5bcb80, #97cc52, #d4c528);"
      >
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
          <Image
            src="/logo_h.svg"
            alt="Solory"
            width={200}
            height={42}
            margin={4}
          />
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
      </Flex>
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
