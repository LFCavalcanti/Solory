'use client';
import getTitleByAction from '@/lib/getTitleByAction';
import {
  companyAddressValidate,
  tCompanyAddress,
} from '@/types/Company/tCompanyAddress';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegistryFormStore } from '@/lib/hooks/state/useRegistryFormStore';
import { tRegistryAction } from '@/types/tRegistryAction';
import { useLoadingSpinnerStore } from '@/lib/hooks/state/useLoadingSpinnerStore';
import { useCompanyAddressesStore } from '@/lib/hooks/state/useCompanyAddressesStore';
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
  useToast,
} from '@chakra-ui/react';
import fetchApp from '@/lib/fetchApp';
import { tFechAppReturn } from '@/types/tFechAppReturn';
import { tCompany } from '@/types/Company/tCompany';

interface Props {
  formAction: tRegistryAction;
  isFormOpen: boolean;
  setIsFormOpen: Dispatch<SetStateAction<boolean>>;
  addressData?: tCompanyAddress | null;
  companyData?: tCompany | null;
}

export default function CompanyAddressForm({
  formAction,
  isFormOpen,
  setIsFormOpen,
  addressData,
  companyData,
}: Props) {
  const action = useRegistryFormStore((state) => state.action);

  const [startProcessingSpinner, stopProcessingSpinner] =
    useLoadingSpinnerStore((state) => [
      state.startProcessingSpinner,
      state.stopProcessingSpinner,
    ]);
  const toast = useToast();
  const [insertAddress, updateAddress, removeAddress] =
    useCompanyAddressesStore((state) => [
      state.insertAddress,
      state.updateAddress,
      state.removeAddress,
    ]);

  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<tCompanyAddress>({
    resolver: zodResolver(companyAddressValidate),
  });

  const title = getTitleByAction('EMPRESA - ENDEREÇO', formAction);

  const submitCompanyAddress: SubmitHandler<tCompanyAddress> = async (data) => {
    let updatedData: tFechAppReturn;

    if (action === 'insert') {
      if (formAction === 'delete') {
        removeAddress(data);
        toast({
          title: 'Endereço removido com sucesso',
          status: 'success',
        });
        setIsFormOpen(false);
        return;
      }
      if (formAction === 'edit') {
        updateAddress(data);
        toast({
          title: 'Cnae x ISS atualizado com sucesso',
          status: 'success',
        });
        setIsFormOpen(false);
        return;
      }
      if (formAction === 'insert') {
        insertAddress(data);
        toast({
          title: 'Endereço inserido com sucesso',
          status: 'success',
        });
        setIsFormOpen(false);
        return;
      }
    }

    if (formAction === 'delete') {
      try {
        updatedData = await fetchApp({
          method: 'PUT',
          baseUrl: window.location.origin,
          endpoint: `/api/internal/companies/${companyData?.id}/addresses/${addressData?.id}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        toast({
          title: `Erro ao desativar o endereço "${data.street}"`,
          status: 'error',
        });
        setIsFormOpen(false);
        return;
      }

      toast({
        title: 'Dados alterados com sucesso',
        status: 'success',
      });
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
            ? `/api/internal/companies/${companyData?.id}/addresses`
            : `/api/internal/companies/${companyData?.id}/addresses/${addressData?.id}`,
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!updatedData || updatedData.status !== 200)
        throw Error('Error calling FetchApp');
      formAction === 'insert'
        ? insertAddress(updatedData.body)
        : updateAddress(updatedData.body);
    } catch (error) {
      console.error(error);
      const message =
        formAction === 'insert'
          ? `Erro ao incluir endereço "${data?.street}"`
          : `Erro ao editar endereço "${data?.street}"`;
      toast({
        title: message,
        status: 'error',
      });
      setIsFormOpen(false);
      return;
    }

    toast({
      title:
        formAction === 'insert'
          ? `Endereço "${data?.street}" incluido com sucesso`
          : `Endereço "${data?.street}" editado com sucesso`,
      status: 'success',
    });

    setIsFormOpen(false);
    return;
  };

  useEffect(() => {
    startProcessingSpinner();
    if (!addressData && formAction === 'insert') {
      reset({
        isActive: true,
      });
      stopProcessingSpinner();
      return;
    }
    if (!addressData && formAction !== 'insert') {
      stopProcessingSpinner();
      setIsFormOpen(false);
      throw new Error('Must provide Company Address data');
    }

    if (addressData && action === 'insert') {
      reset({
        ...addressData,
      });
      stopProcessingSpinner();
      return;
    }

    fetchApp({
      endpoint: `/api/internal/companies/${companyData?.id}/addresses/${addressData?.id}`,
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
        toast({
          title: 'Erro ao obter informações do endereço',
          status: 'error',
        });
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
                {formAction !== 'insert' && addressData ? addressData.id : '-'}
              </Text>
            </Flex>
            <form
              onSubmit={
                formAction === 'view'
                  ? () => setIsFormOpen(false)
                  : handleSubmit(submitCompanyAddress)
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

                  <FormControl isInvalid={errors.isMainAddress !== undefined}>
                    <FormLabel fontSize="11px" color="text.standard">
                      Endereço Principal?
                    </FormLabel>
                    <Controller
                      control={control}
                      name={'isMainAddress'}
                      key={'isMainAddress'}
                      defaultValue={false}
                      render={({ field: { onChange, value, ref } }) => (
                        <Switch
                          size="md"
                          colorScheme="brandSecondary"
                          onChange={onChange}
                          ref={ref}
                          isChecked={value}
                        />
                      )}
                    />
                    <FormErrorMessage>
                      {errors.isMainAddress?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Flex>
                <FormControl isInvalid={errors.street !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Rua:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="Rua / Avenida"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={
                      formAction === 'view' || formAction === 'delete'
                    }
                    {...register('street')}
                  />
                  <FormErrorMessage>{errors.street?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.lotNumber !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Numero:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="Numero"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={
                      formAction === 'view' || formAction === 'delete'
                    }
                    {...register('lotNumber')}
                  />
                  <FormErrorMessage>
                    {errors.lotNumber?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.complement !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Complemento:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="Bloco X, sala Y"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={
                      formAction === 'view' || formAction === 'delete'
                    }
                    {...register('complement')}
                  />
                  <FormErrorMessage>
                    {errors.lotNumber?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.locale !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Bairro:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="bairro"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={
                      formAction === 'view' || formAction === 'delete'
                    }
                    {...register('locale')}
                  />
                  <FormErrorMessage>
                    {errors.lotNumber?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.postalCode !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    CEP:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="00000000"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={
                      formAction === 'view' || formAction === 'delete'
                    }
                    {...register('postalCode')}
                  />
                  <FormErrorMessage>
                    {errors.lotNumber?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.state !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    ESTADO:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="XX"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={
                      formAction === 'view' || formAction === 'delete'
                    }
                    {...register('state')}
                  />
                  <FormErrorMessage>{errors.state?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.cityCode !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    CÓDIGO IBGE CIDADE:
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
                    {...register('cityCode')}
                  />
                  <FormErrorMessage>
                    {errors.cityCode?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.information !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    INFORMAÇÕES ADICIONAIS:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="Referências e outras informações"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={
                      formAction === 'view' || formAction === 'delete'
                    }
                    {...register('information')}
                  />
                  <FormErrorMessage>
                    {errors.information?.message}
                  </FormErrorMessage>
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
