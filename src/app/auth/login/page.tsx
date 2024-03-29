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
  Spacer,
  useToast,
} from '@chakra-ui/react';
//import { Image } from '@chakra-ui/next-js';
import Image from 'next/image';
import {
  LockIcon,
  UnlockIcon,
  NotAllowedIcon,
  ArrowForwardIcon,
  ArrowBackIcon,
} from '@chakra-ui/icons';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import FlexGradient from '@/components/common/FlexGradient';
import TopMessageSlider from '@/components/common/TopMessageSlider';

export default function LoginPage() {
  const callbackUrl = '/client/dashboard';
  const validadeEmail = z.string().email();
  const { push } = useRouter();
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();

  const tryLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const validatedUsername = validadeEmail.safeParse(username);
    const validatedPassword = z.string().min(8).safeParse(password);

    if (!validatedUsername.success) {
      setInvalidEmail(true);
      return;
    } else {
      setInvalidEmail(false);
    }

    if (!validatedPassword.success) {
      toast({
        title: 'Usuário não existe ou senha inválida',
        status: 'error',
      });
      return;
    }

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
    if (result?.status !== 200 || result?.error) {
      toast({
        title: 'Usuário não existe ou senha inválida',
        status: 'error',
      });
      return;
    }
    push(callbackUrl);
  };

  return (
    <>
      <TopMessageSlider />
      <FlexGradient>
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
            style={{ margin: '32px' }}
          />
          <Flex
            direction="column"
            background="brandPrimary.500"
            p={12}
            rounded={0}
          >
            <form onSubmit={tryLogin}>
              <FormControl isInvalid={invalidEmail}>
                <FormLabel color="text.light" id="email-label">
                  Email
                </FormLabel>
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
                <FormLabel color="text.light" id="password-label">
                  Senha
                </FormLabel>
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
                          <UnlockIcon color="brandPrimary.500" />
                        ) : (
                          <LockIcon color="brandPrimary.500" />
                        )
                      }
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              <Flex>
                <Button
                  mt={8}
                  mr={4}
                  variant="secondary"
                  onClick={() => push('/')}
                >
                  <ArrowBackIcon mr={1} />
                  Voltar
                </Button>
                <Spacer />
                <Button mt={8} type="submit" variant="contrast">
                  ENTRAR
                  <ArrowForwardIcon ml={2} />
                </Button>
              </Flex>
            </form>
          </Flex>
        </Flex>
      </FlexGradient>
    </>
  );
}
