'use client';
import {
  Flex,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  Slide,
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/next-js';
import {
  LockIcon,
  UnlockIcon,
  NotAllowedIcon,
  ArrowForwardIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const callbackUrl = '/internal/dashboard';
  const { push } = useRouter();
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);

  const tryLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
    console.log(result);
    if (result?.error) {
      setInvalidCredentials(true);
      return;
    }
    push(callbackUrl);
  };

  return (
    <>
      <Slide direction="top" in={invalidCredentials} style={{ zIndex: 10 }}>
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
          Usuário ou Senha Inválidos
          <IconButton
            padding={0}
            aria-label="Fechar alerta"
            h="90%"
            ml={2}
            size="md"
            colorScheme="error"
            icon={<CloseIcon color="red.300" />}
            onClick={() => setInvalidCredentials(false)}
          />
        </Alert>
      </Slide>
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
          boxShadow="lg"
        >
          <Image
            src="/logo_h.svg"
            alt="Solory"
            width={200}
            height={42}
            margin={4}
          />
          <Flex direction="column" background="primary.500" p={12} rounded={0}>
            <form onSubmit={tryLogin}>
              <FormControl isInvalid={isEmailValid}>
                <FormLabel color="text.light">Email</FormLabel>
                <Input
                  value={username}
                  onChange={(event) => setUserName(event.currentTarget.value)}
                  type="email"
                  variant="outline"
                  placeholder="seu@email.com.br"
                  bg="backgroundLight"
                  focusBorderColor="contrast.500"
                  errorBorderColor="error"
                  color="text.standard"
                  rounded={0}
                />
                <FormErrorMessage padding={1} color="text.light" bg="error">
                  <NotAllowedIcon color="backgroundLight" m={1} />
                  Email Inválido
                </FormErrorMessage>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel color="text.light">Senha</FormLabel>
                <InputGroup size="md">
                  <Input
                    value={password}
                    onChange={(event) => setPassword(event.currentTarget.value)}
                    type={showPassword ? 'text' : 'password'}
                    variant="outline"
                    bg="backgroundLight"
                    color="text.standard"
                    focusBorderColor="contrast.500"
                    rounded={0}
                  />
                  <InputRightElement>
                    <IconButton
                      padding={1}
                      aria-label="Mostra ou Oculta senha"
                      h="90%"
                      size="md"
                      colorScheme="backgroundLight"
                      icon={
                        showPassword ? (
                          <UnlockIcon color="primary.500" />
                        ) : (
                          <LockIcon color="primary.500" />
                        )
                      }
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Button mt={8} type="submit" variant="contrast">
                ENTRAR
                <ArrowForwardIcon ml={2} />
              </Button>
            </form>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
