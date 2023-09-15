'use client';
import { UnlockIcon, LockIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import {
  Box,
  Flex,
  Button,
  Heading,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Switch,
} from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tUserProfile, userProfileValidate } from '@/types/User/tUser';
import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import fetchApp from '@/lib/fetchApp';
import { useTopMessageSliderStore } from '@/lib/hooks/state/useTopMessageSliderStore';
import { useLoadingSpinnerStore } from '@/lib/hooks/state/useLoadingSpinnerStore';

export default function UserProfile() {
  const [alterPassword, setAlterPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [startProcessingSpinner, stopProcessingSpinner] =
    useLoadingSpinnerStore((state) => [
      state.startProcessingSpinner,
      state.stopProcessingSpinner,
    ]);
  const sendTopMessage = useTopMessageSliderStore(
    (state) => state.sendTopMessage,
  );
  const { data: session, status } = useSession();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<tUserProfile>({
    resolver: zodResolver(userProfileValidate),
    defaultValues: {
      name: 'Carregando...',
      email: 'Carregando...',
    },
  });

  const submitUser: SubmitHandler<tUserProfile> = async (data) => {
    startProcessingSpinner();
    const updatedData = await fetchApp({
      method: 'PUT',
      baseUrl: window.location.origin,
      endpoint: `/api/internal/users/${session?.user.id}`,
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!updatedData || updatedData.status !== 200) {
      sendTopMessage('error', 'Erro ao atualizar dados');
      return;
    }

    if (updatedData.body.changedEmail || updatedData.body.changedPassword) {
      sendTopMessage(
        'info',
        'Você alterou seu e-mail ou sua senha, por isso precisará e efetuar login novamente e/ou revalidar seu e-mail. Redirecionando em 5 segundos.',
        'Aviso de redirecionamento...',
      );
      setTimeout(() => signOut(), 60000);
      stopProcessingSpinner();
      return;
    }

    sendTopMessage('success', 'Dados alterados com sucesso');
    stopProcessingSpinner();
  };

  useEffect(() => {
    if (status === 'authenticated') {
      reset({
        name: session.user.name || undefined,
        email: session.user.email || undefined,
      });
      stopProcessingSpinner();
    }
    if (status === 'unauthenticated') {
      stopProcessingSpinner();
      sendTopMessage('error', 'Erro ao obter dados do seu perfil');
      return;
    }
  }, [status]);

  return (
    <Flex
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      padding={2}
      bg="whiteAlpha.500"
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
      >
        <Flex
          borderBottom="5px solid"
          borderColor="brandSecondary.500"
          alignItems="left"
          justifyContent="center"
          bg="backgroundLight"
          flexDirection="column"
          boxShadow="lg"
          padding={2}
          width="100%"
        >
          <Heading
            mt="auto"
            mb="auto"
            ml={4}
            color="brandPrimary.500"
            fontFamily="heading"
            fontSize={20}
          >
            SEU PERFIL
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
              <FormControl>
                <FormLabel color="text.light" htmlFor="alter-Password" mb="0">
                  Alterar senha?
                </FormLabel>
                <Switch
                  id="alter-Password"
                  colorScheme="brandSecondary"
                  isChecked={alterPassword}
                  onChange={() => setAlterPassword(!alterPassword)}
                />
              </FormControl>
              {alterPassword && (
                <Flex direction="column" gap={3}>
                  <FormControl isInvalid={errors.currentPassword !== undefined}>
                    <FormLabel color="text.light">Senha atual:</FormLabel>
                    <InputGroup size="md">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        variant="outline"
                        bg="backgroundLight"
                        color="text.standard"
                        focusBorderColor="contrast.500"
                        rounded={0}
                        {...register('currentPassword')}
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
                      {errors.currentPassword?.message}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={errors.newPassword !== undefined}>
                    <FormLabel color="text.light">Nova senha:</FormLabel>
                    <InputGroup size="md">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        variant="outline"
                        bg="backgroundLight"
                        color="text.standard"
                        focusBorderColor="contrast.500"
                        rounded={0}
                        {...register('newPassword')}
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
                      {errors.newPassword?.message}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl
                    isInvalid={errors.confirmNewPassword !== undefined}
                  >
                    <FormLabel color="text.light">
                      Confirmar nova senha:
                    </FormLabel>
                    <InputGroup size="md">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        variant="outline"
                        bg="backgroundLight"
                        color="text.standard"
                        focusBorderColor="contrast.500"
                        rounded={0}
                        {...register('confirmNewPassword')}
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
                      {errors.confirmNewPassword?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Flex>
              )}
              <Button mt={8} ml="auto" type="submit" variant="contrast">
                SALVAR
                <ArrowForwardIcon ml={2} />
              </Button>
            </Flex>
          </form>
        </Box>
      </Flex>
    </Flex>
  );
}
