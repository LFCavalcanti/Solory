'use client';
import getTitleByAction from '@/lib/getTitleByAction';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegistryFormStore } from '@/lib/hooks/state/useRegistryFormStore';
import { tRegistryAction } from '@/types/tRegistryAction';
import { useLoadingSpinnerStore } from '@/lib/hooks/state/useLoadingSpinnerStore';
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
import { tSupplier } from '@/types/Supplier/tSupplier';
import {
  supplierContactValidate,
  tSupplierContact,
} from '@/types/Supplier/tSupplierContact';
import { useSupplierContactStore } from '@/lib/hooks/state/useSupplierContactStore';
import getTableLocaleDate from '@/lib/getTableLocaleDate';

interface Props {
  formAction: tRegistryAction;
  isFormOpen: boolean;
  setIsFormOpen: Dispatch<SetStateAction<boolean>>;
  contactData?: tSupplierContact | null;
  supplierData?: tSupplier | null;
}

export default function SupplierContactForm({
  formAction,
  isFormOpen,
  setIsFormOpen,
  contactData,
  supplierData,
}: Props) {
  const action = useRegistryFormStore((state) => state.action);

  const [startProcessingSpinner, stopProcessingSpinner] =
    useLoadingSpinnerStore((state) => [
      state.startProcessingSpinner,
      state.stopProcessingSpinner,
    ]);
  const toast = useToast();
  const [insertContact, updateContact, removeContact] = useSupplierContactStore(
    (state) => [state.insertContact, state.updateContact, state.removeContact],
  );

  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<tSupplierContact>({
    resolver: zodResolver(supplierContactValidate),
  });

  const title = getTitleByAction('EMPRESA - ENDEREÇO', formAction);

  const submitSupplierAddress: SubmitHandler<tSupplierContact> = async (
    data,
  ) => {
    let updatedData: tFechAppReturn;

    if (action === 'insert') {
      if (formAction === 'delete') {
        removeContact(data);
        toast({
          title: 'Contato removido com sucesso',
          status: 'success',
        });
        setIsFormOpen(false);
        return;
      }
      if (formAction === 'edit') {
        updateContact(data);
        toast({
          title: 'Contato atualizado com sucesso',
          status: 'success',
        });
        setIsFormOpen(false);
        return;
      }
      if (formAction === 'insert') {
        insertContact(data);
        toast({
          title: 'Contato inserido com sucesso',
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
          endpoint: `/api/internal/suppliers/${supplierData?.id}/contacts/${contactData?.id}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        toast({
          title: `Erro ao desativar o contato "${data.name}"`,
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
            ? `/api/internal/suppliers/${supplierData?.id}/contacts`
            : `/api/internal/suppliers/${supplierData?.id}/contacts/${contactData?.id}`,
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!updatedData || updatedData.status !== 200)
        throw Error('Error calling FetchApp');
      formAction === 'insert'
        ? insertContact(updatedData.body)
        : updateContact(updatedData.body);
    } catch (error) {
      console.error(error);
      const message =
        formAction === 'insert'
          ? `Erro ao incluir contato "${data?.name}"`
          : `Erro ao editar contato "${data?.name}"`;
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
          ? `Contato "${data?.name}" incluido com sucesso`
          : `Contato "${data?.name}" editado com sucesso`,
      status: 'success',
    });

    setIsFormOpen(false);
    return;
  };

  useEffect(() => {
    startProcessingSpinner();
    if (!contactData && formAction === 'insert') {
      reset({
        isActive: true,
      });
      stopProcessingSpinner();
      return;
    }
    if (!contactData && formAction !== 'insert') {
      stopProcessingSpinner();
      setIsFormOpen(false);
      throw new Error('Must provide Supplier Contact data');
    }

    if (contactData && action === 'insert') {
      reset({
        ...contactData,
      });
      stopProcessingSpinner();
      return;
    }

    fetchApp({
      endpoint: `/api/internal/suppliers/${supplierData?.id}/contacts/${contactData?.id}`,
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
          title: 'Erro ao obter informações do contato',
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
                {action === 'insert' ? '-' : contactData?.id}
              </Text>
              <Text fontSize="12px">
                <strong>CRIADO EM: </strong>
                {action === 'insert'
                  ? '-'
                  : getTableLocaleDate(contactData?.createdAt || '')}
              </Text>
              <Text fontSize="12px">
                <strong>DESATIVADO EM: </strong>
                {action === 'insert'
                  ? '-'
                  : getTableLocaleDate(contactData?.disabledAt || '')}
              </Text>
            </Flex>
            <form
              onSubmit={
                formAction === 'view'
                  ? () => setIsFormOpen(false)
                  : handleSubmit(submitSupplierAddress)
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
                <FormControl isInvalid={errors.name !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Nome:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="Nome"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={
                      formAction === 'view' || formAction === 'delete'
                    }
                    {...register('name')}
                  />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.role !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Cargo:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="Cargo"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={
                      formAction === 'view' || formAction === 'delete'
                    }
                    {...register('role')}
                  />
                  <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.email !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    E-mail:
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
                    {...register('email')}
                  />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.phone !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Telefone:
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
                    {...register('phone')}
                  />
                  <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
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
