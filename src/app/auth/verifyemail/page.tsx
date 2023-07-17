'use client';
import fetchApp from '@/lib/fetchApp';
import { Button, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import { Image, Link } from '@chakra-ui/next-js';
import { useEffect, useState } from 'react';
import { CloseIcon } from '@chakra-ui/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import FlexGradient from '@/components/common/FlexGradient';

interface iValidationReturn {
  status: number;
  body: any;
}

export default function verifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [activationCall, setActivationCall] =
    useState<iValidationReturn | null>(null);

  const errorMesssage = (status: number) => {
    if (status == 401) {
      return 'TOKEN DE VERIFICAÇÃO INVÁLIDO OU VENCIDO';
    }

    if (status == 503) {
      return 'SERVIÇO DE VALIDAÇÃO INDISPONÍVEL';
    }

    return 'ERRO NO SERVIDOR - TENTE MAIS TARDE';
  };

  const activateUser = async () => {
    return fetchApp({
      method: 'POST',
      baseUrl: window.location.origin,
      endpoint: `/api/email/verifyEmail/${token}`,
      cache: 'no-store',
    });
  };

  useEffect(() => {
    if (token) {
      activateUser().then((data) => {
        setActivationCall(data);
      });
    }
  }, [token]);

  if (activationCall && activationCall.status == 200) {
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
          <Image
            src="/logo_h.svg"
            alt="Solory"
            width={200}
            height={42}
            margin={4}
          />
          <Heading color="text.standard" fontFamily="heading" fontSize={18}>
            {activationCall.body.alreadyVerified
              ? 'SEU ENDEREÇO DE E-MAIL JÁ FOI VALIDADO ANTERIORMENTE'
              : 'SEU ENDEREÇO DE E-MAIL FOI VALIDADO'}
          </Heading>
          <Link
            padding="2"
            bg="primary.500"
            color="text.light"
            fontWeight="500"
            fontFamily="button"
            href="/client/dashboard"
          >
            Ir para Dashboard
          </Link>
        </Flex>
      </FlexGradient>
    );
  }

  if (activationCall && activationCall.status != 200) {
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
            {errorMesssage(activationCall.status)}
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
        Processando verificação...
      </Text>
    </Flex>
  );
}
