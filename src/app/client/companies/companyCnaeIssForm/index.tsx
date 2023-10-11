'use client';
import getTitleByAction from '@/lib/getTitleByAction';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegistryFormStore } from '@/lib/hooks/state/useRegistryFormStore';
import { tRegistryAction } from '@/types/tRegistryAction';
import { useLoadingSpinnerStore } from '@/lib/hooks/state/useLoadingSpinnerStore';
import { useTopMessageSliderStore } from '@/lib/hooks/state/useTopMessageSliderStore';
import { Dispatch, SetStateAction, useEffect } from 'react';
import getButtonNameByAction from '@/lib/tokens/getButtonNameByAction';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Switch,
  Button,
  Text,
} from '@chakra-ui/react';
import fetchApp from '@/lib/fetchApp';
import { tFechAppReturn } from '@/types/tFechAppReturn';
import { tCompany } from '@/types/Company/tCompany';
import { useCompanyCnaeIssStore } from '@/lib/hooks/state/useCompanyCnaeIssStore';
import {
  companyCnaeIssValidate,
  tCompanyCnaeIss,
} from '@/types/Company/tCompanyCnaeIss';

interface Props {
  formAction: tRegistryAction;
  isFormOpen: boolean;
  setIsFormOpen: Dispatch<SetStateAction<boolean>>;
  cnaeIssData?: tCompanyCnaeIss | null;
  companyData?: tCompany | null;
}

export default function CompanyAddressForm({
  formAction,
  isFormOpen,
  setIsFormOpen,
  cnaeIssData,
  companyData,
}: Props) {
  const action = useRegistryFormStore((state) => state.action);

  const [startProcessingSpinner, stopProcessingSpinner] =
    useLoadingSpinnerStore((state) => [
      state.startProcessingSpinner,
      state.stopProcessingSpinner,
    ]);
  const sendTopMessage = useTopMessageSliderStore(
    (state) => state.sendTopMessage,
  );

  const [insertCnaeIss, updateCnaeIss, removeCnaeIss] = useCompanyCnaeIssStore(
    (state) => [state.insertCnaeIss, state.updateCnaeIss, state.removeCnaeIss],
  );

  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<tCompanyCnaeIss>({
    resolver: zodResolver(companyCnaeIssValidate),
  });

  const title = getTitleByAction('EMPRESA - CNAE x ISS', formAction);

  const submitCnaeIss: SubmitHandler<tCompanyCnaeIss> = async (data) => {
    let updatedData: tFechAppReturn;

    if (action === 'insert') {
      if (formAction === 'delete') {
        removeCnaeIss(data);
        sendTopMessage('success', 'Cnae x ISS removido com sucesso');
        setIsFormOpen(false);
        return;
      }
      if (formAction === 'edit') {
        updateCnaeIss(data);
        sendTopMessage('success', 'Cnae x ISS atualizado com sucesso');
        setIsFormOpen(false);
        return;
      }
      if (formAction === 'insert') {
        insertCnaeIss(data);
        sendTopMessage('success', 'CNAE x ISS inserido com sucesso');
        setIsFormOpen(false);
        return;
      }
    }

    if (formAction === 'delete') {
      try {
        updatedData = await fetchApp({
          method: 'PUT',
          baseUrl: window.location.origin,
          endpoint: `/api/internal/companies/${companyData?.id}/cnaeiss/${cnaeIssData?.id}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        sendTopMessage(
          'error',
          `Erro ao desativar o CNAE x ISS "${data.description}"`,
        );
        setIsFormOpen(false);
        return;
      }

      sendTopMessage('success', 'Dados alterados com sucesso');
      setIsFormOpen(false);
      return;
    }

    try {
      delete data.id;
      updatedData = await fetchApp({
        method: formAction === 'insert' ? 'POST' : 'PUT',
        baseUrl: window.location.origin,
        endpoint:
          formAction === 'insert'
            ? `/api/internal/companies/${companyData?.id}/cnaeiss`
            : `/api/internal/companies/${companyData?.id}/cnaeiss/${cnaeIssData?.id}`,
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!updatedData || updatedData.status !== 200)
        throw Error('Error calling FetchApp');
      formAction === 'insert'
        ? insertCnaeIss(updatedData.body)
        : updateCnaeIss(updatedData.body);
    } catch (error) {
      console.error(error);
      const message =
        formAction === 'insert'
          ? `Erro ao incluir CNAE x ISS "${data?.description}"`
          : `Erro ao editar CNAE x ISS "${data?.description}"`;
      sendTopMessage('error', message);
      setIsFormOpen(false);
      return;
    }

    sendTopMessage(
      'success',
      formAction === 'insert'
        ? `CNAE x ISS "${data?.description}" incluido com sucesso`
        : `CNAE x ISS "${data?.description}" editado com sucesso`,
    );

    setIsFormOpen(false);
    return;
  };

  useEffect(() => {
    startProcessingSpinner();
    if (!cnaeIssData && formAction === 'insert') {
      reset({
        isActive: true,
      });
      stopProcessingSpinner();
      return;
    }
    if (!cnaeIssData && formAction !== 'insert') {
      stopProcessingSpinner();
      setIsFormOpen(false);
      throw new Error('Must provide Company CNAE x ISS data');
    }

    if (cnaeIssData && action === 'insert') {
      reset({
        ...cnaeIssData,
      });
      stopProcessingSpinner();
      return;
    }

    fetchApp({
      endpoint: `/api/internal/companies/${companyData?.id}/cnaeiss/${cnaeIssData?.id}`,
      baseUrl: window.location.origin,
    })
      .then((result) => {
        reset({
          ...result.body,
        });
        stopProcessingSpinner();
      })
      .catch((error) => {
        console.error(`FETCH ERROR: ${error}`);
        sendTopMessage('error', 'Erro ao obter informações do CNAE x ISS');
        stopProcessingSpinner();
        setIsFormOpen(false);
        throw error;
      });
  }, []);

  return (
    <Modal
      closeOnOverlayClick={false}
      blockScrollOnMount={true}
      scrollBehavior={'inside'}
      isOpen={isFormOpen}
      onClose={() => setIsFormOpen(false)}
      motionPreset="slideInRight"
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        borderRadius="0"
        maxHeight="calc(100vh - 50px)"
        maxWidth="calc(100vw - 50px)"
        height="fit-content"
      >
        <ModalBody>
          <Flex
            direction="column"
            padding={4}
            gap={3}
            height="100%"
            width="100%"
          >
            <Heading
              mt={2}
              mb={4}
              color="brandPrimary.500"
              fontFamily="heading"
              fontSize={16}
              borderBottom="2px solid"
              borderColor="contrast.500"
            >
              {title}
            </Heading>
            <Flex padding={2} gap={3}>
              <Text fontSize="12px">
                <strong>ID: </strong>
                {formAction !== 'insert' && cnaeIssData ? cnaeIssData.id : '-'}
              </Text>
            </Flex>
            <form
              onSubmit={
                formAction === 'view'
                  ? () => setIsFormOpen(false)
                  : handleSubmit(submitCnaeIss)
              }
            >
              <Flex direction="column" gap={3}>
                <Flex>
                  <FormControl isInvalid={errors.isActive !== undefined}>
                    <FormLabel fontSize="11px" color="text.standard">
                      Ativo?
                    </FormLabel>
                    <Controller
                      control={control}
                      name={'isActive'}
                      key={'isActive'}
                      defaultValue={false}
                      render={({ field: { onChange, value, ref } }) => (
                        <Switch
                          size="md"
                          colorScheme="brandSecondary"
                          onChange={onChange}
                          ref={ref}
                          isChecked={value}
                          isReadOnly={formAction !== 'edit'}
                        />
                      )}
                    />
                    <FormErrorMessage>
                      {errors.isActive?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Flex>
                <FormControl isInvalid={errors.description !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Descrição:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="Descrição da atividade"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={
                      formAction === 'view' || formAction === 'delete'
                    }
                    {...register('description')}
                  />
                  <FormErrorMessage>
                    {errors.description?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.cnaeCode !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    CNAE:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="0000000"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={
                      formAction === 'view' || formAction === 'delete'
                    }
                    {...register('cnaeCode')}
                  />
                  <FormErrorMessage>
                    {errors.cnaeCode?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.issCode !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    ISS:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="0000"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={
                      formAction === 'view' || formAction === 'delete'
                    }
                    {...register('issCode')}
                  />
                  <FormErrorMessage>{errors.issCode?.message}</FormErrorMessage>
                </FormControl>
              </Flex>
              <Button width={28} variant="primary" type="submit" mt={6}>
                {getButtonNameByAction(formAction)}
              </Button>
            </form>
            <Button
              width={28}
              variant="secondaryOutline"
              onClick={() => setIsFormOpen(false)}
            >
              CANCELAR
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
