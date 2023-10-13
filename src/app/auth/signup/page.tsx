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
  Heading,
  useToast,
} from '@chakra-ui/react';
import {
  UnlockIcon,
  LockIcon,
  ArrowForwardIcon,
  ArrowBackIcon,
} from '@chakra-ui/icons';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newUserValidate, tNewUser } from '@/types/User/tNewUser';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FlexGradient from '@/components/common/FlexGradient';
import fetchApp from '@/lib/fetchApp';
import TopMessageSlider from '@/components/common/TopMessageSlider';
import { useLoadingSpinnerStore } from '@/lib/hooks/state/useLoadingSpinnerStore';

export default function SignUp() {
  const { push } = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const [startProcessingSpinner, stopProcessingSpinner] =
    useLoadingSpinnerStore((state) => [
      state.startProcessingSpinner,
      state.stopProcessingSpinner,
    ]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<tNewUser>({
    resolver: zodResolver(newUserValidate),
  });

  const submitUser: SubmitHandler<tNewUser> = async (data) => {
    startProcessingSpinner();

    const createdCredential = await fetchApp({
      method: 'POST',
      baseUrl: window.location.origin,
      endpoint: '/api/auth/signup',
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (createdCredential.status === 409) {
      toast({
        title: 'Usuário já está cadastrado',
        description:
          'De já acessou usando Google, Microsoft ou Github, defina uma senha pelo perfil',
        status: 'error',
      });
      console.error(createdCredential);
      stopProcessingSpinner();
      return;
    }

    if (createdCredential.status !== 200) {
      toast({
        title: 'Serviço indisponível',
        status: 'error',
      });
      console.error(createdCredential);
      stopProcessingSpinner();
      return;
    }

    const newSession = await signIn('credentials', {
      username: data.email,
      password: data.password,
      redirect: false,
    });

    if (!newSession) {
      toast({
        title: 'Erro ao autenticar novo usuário',
        status: 'error',
      });
      console.error(newSession);
      stopProcessingSpinner();
      return;
    }

    push('/client/dashboard');
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
          flexDirection="column"
          boxShadow="lg"
          width={[
            '90%', // 0-30em
            '80%', // 30em-48em
            '70%', // 48em-62em
            '50%', // 62em+
          ]}
        >
          <Flex alignItems="left" justifyContent="left" width="100%">
            <Button
              margin={4}
              variant="primaryOutline"
              onClick={() => push('/')}
            >
              <ArrowBackIcon mr={1} />
              Voltar
            </Button>
            <Heading
              mt="auto"
              mb="auto"
              ml={4}
              color="brandPrimary.500"
              fontFamily="heading"
              fontSize={24}
            >
              CADASTRAR NOVO USUÁRIO
            </Heading>
          </Flex>
          <Box background="brandPrimary.500" p={12} rounded={0} width="100%">
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
                            <UnlockIcon color="brandPrimary.500" />
                          ) : (
                            <LockIcon color="brandPrimary.500" />
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
                            <UnlockIcon color="brandPrimary.500" />
                          ) : (
                            <LockIcon color="brandPrimary.500" />
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
