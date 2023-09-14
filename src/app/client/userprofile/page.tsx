'use client';
import {
  ArrowBackIcon,
  UnlockIcon,
  LockIcon,
  ArrowForwardIcon,
} from '@chakra-ui/icons';
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
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tUserProfile, userProfileValidate } from '@/types/User/tUser';
import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import fetchApp from '@/lib/fetchApp';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TopErrorSlider from '@/components/common/TopErrorSlider';
import TimedRedirectAlert from '@/components/common/TimedRedirectAlert';
import TopSuccessSlider from '@/components/common/TopSuccessSlider';
import FlexContent from '@/components/common/FlexContent';

export default function UserProfile() {
  const { push } = useRouter();
  const [alterPassword, setAlterPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [successAlert, setSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
    const updatedData = await fetchApp({
      method: 'PUT',
      baseUrl: window.location.origin,
      endpoint: `/api/internal/users/${session?.user.id}`,
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!updatedData || updatedData.status !== 200) {
      setErrorMessage('Erro ao atualizar dados');
      setIsError(true);
      return;
    }

    if (updatedData.body.changedEmail || updatedData.body.changedPassword) {
      setAlertTitle('Aviso de redirecionamento...');
      setAlertMessage(
        'Você alterou seu e-mail ou sua senha, por isso precisará e efetuar login novamente e/ou revalidar seu e-mail. Redirecionando em 5 segundos...',
      );
      setIsAlertOpen(true);
      setTimeout(() => signOut(), 5000);
      return;
    }

    setSuccessMessage('Dados alterados com sucesso');
    setSuccessAlert(true);
  };

  useEffect(() => {
    if (status === 'authenticated') {
      reset({
        name: session.user.name || undefined,
        email: session.user.email || undefined,
      });
      setIsProcessing(false);
    }
    if (status === 'unauthenticated') {
      setIsProcessing(false);
      setIsError(true);
      setErrorMessage('Erro ao obter dados do seu perfil');
      return;
    }
  }, [status]);

  return (
    <Box width="100%" height="100%">
      <LoadingSpinner showSpinner={isProcessing} />
      <TimedRedirectAlert
        isAlertOpen={isAlertOpen}
        message={alertMessage}
        title={alertTitle}
        onCloseCallback={() => {}}
      />
      <TopSuccessSlider
        showAlert={successAlert}
        onClickCallBack={() => setSuccessAlert(false)}
        alertMessage={successMessage}
      />
      <TopErrorSlider
        showError={isError}
        errorMessage={errorMessage}
        onClickCallBack={() => setIsError(false)}
      />
      <FlexContent>
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
              onClick={() => push('/client/dashboard')}
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
                    <FormControl
                      isInvalid={errors.currentPassword !== undefined}
                    >
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
      </FlexContent>
    </Box>
  );
}
