'use client';
import {
  Flex,
  Input,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  InputGroup,
  InputRightElement,
  Box,
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/next-js';
import { UnlockIcon, LockIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newUserValidate, tNewUser } from '@/types/newUser';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FlexGradient from '@/components/common/FlexGradient';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TopErrorSlider from '@/components/common/TopErrorSlider';

export default function IndexPage() {
  const { push } = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignError, setIsSignError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<tNewUser>({
    resolver: zodResolver(newUserValidate),
  });

  const submitUser: SubmitHandler<tNewUser> = async (data) => {
    setIsProcessing(true);

    const createdCredential = await fetch(
      'http://localhost:3000/api/auth/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    if (createdCredential.status === 409) {
      setErrorMessage(
        'Usuário já está cadastrado, se já acessou usando Google, Microsoft ou Github, defina uma senha pelo perfil',
      );
      setIsSignError(true);
      console.error(createdCredential);
      setIsProcessing(false);
      return;
    }

    if (createdCredential.status !== 200) {
      setErrorMessage('Serviço indisponível');
      setIsSignError(true);
      console.error(createdCredential);
      setIsProcessing(false);
      return;
    }

    const newSession = await signIn('credentials', {
      username: data.email,
      password: data.password,
      redirect: false,
    });
    push('/internal/dashboard');
  };

  return (
    <>
      <LoadingSpinner showSpinner={isProcessing} />
      <TopErrorSlider
        showError={isSignError}
        errorMessage={errorMessage}
        onClickCallBack={() => setIsSignError(false)}
      />
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
        >
          <Image
            src="/logo_h.svg"
            alt="Solory"
            width={200}
            height={42}
            margin={4}
          />
          <Box background="primary.500" p={12} rounded={0} width="100%">
            <form onSubmit={handleSubmit(submitUser)}>
              <Flex direction="column" gap={3}>
                <FormControl isInvalid={errors.name !== undefined}>
                  <FormLabel color="text.light">Nome:</FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    placeholder="Nome e Sobrenome"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    {...register('name')}
                  />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.email !== undefined}>
                  <FormLabel color="text.light">Email:</FormLabel>
                  <Input
                    type="email"
                    variant="outline"
                    placeholder="seu@email.com.br"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    {...register('email')}
                  />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.password !== undefined}>
                  <FormLabel color="text.light">Senha:</FormLabel>
                  <InputGroup size="md">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      variant="outline"
                      bg="backgroundLight"
                      color="text.standard"
                      focusBorderColor="contrast.500"
                      rounded={0}
                      {...register('password')}
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
                  <FormErrorMessage>
                    {errors.password?.message}
                  </FormErrorMessage>
                </FormControl>
                <FormControl isInvalid={errors.confirmPassword !== undefined}>
                  <FormLabel color="text.light">Confirmar senha:</FormLabel>
                  <InputGroup size="md">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      variant="outline"
                      bg="backgroundLight"
                      color="text.standard"
                      focusBorderColor="contrast.500"
                      rounded={0}
                      {...register('confirmPassword')}
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
                  <FormErrorMessage>
                    {errors.confirmPassword?.message}
                  </FormErrorMessage>
                </FormControl>
                <Button mt={8} ml="auto" type="submit" variant="contrast">
                  CADASTRAR
                  <ArrowForwardIcon ml={2} />
                </Button>
              </Flex>
            </form>
          </Box>
        </Flex>
      </FlexGradient>
    </>
  );
}
