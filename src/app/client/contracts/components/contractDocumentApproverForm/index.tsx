'use client';
import getTitleByAction from '@/lib/getTitleByAction';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegistryFormStore } from '@/lib/hooks/state/useRegistryFormStore';
import { tRegistryAction } from '@/types/tRegistryAction';
import { useLoadingSpinnerStore } from '@/lib/hooks/state/useLoadingSpinnerStore';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
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
  FormErrorMessage,
  Switch,
  Button,
  Text,
  useToast,
  Spacer,
} from '@chakra-ui/react';
import fetchApp from '@/lib/fetchApp';
import { tFechAppReturn } from '@/types/tFechAppReturn';
import { tContract } from '@/types/Contract/tContract';
import { tSelectMenuOption } from '@/types/tSelectMenuOption';
import { Select as AltSelect, ChakraStylesConfig } from 'chakra-react-select';
import {
  contractDocumentApproverValidate,
  tContractDocumentApprover,
} from '@/types/Contract/tContractDocumentApprover';
import { useContractDocumentApproverStore } from '@/lib/hooks/state/useContractDocumentApproverStore';
import { tCustomerContact } from '@/types/Customer/tCustomerContact';

type tApproverNestedData = {
  customerContact?: {
    name: string;
    email: string;
  };
};

type tContractDocumentApproverWithContact = tContractDocumentApprover &
  tApproverNestedData;

interface Props {
  formAction: tRegistryAction;
  isFormOpen: boolean;
  setIsFormOpen: Dispatch<SetStateAction<boolean>>;
  approverData?: tContractDocumentApproverWithContact | null;
  contractData?: tContract | null;
}

export default function ContractDocumentApproverForm({
  formAction,
  isFormOpen,
  setIsFormOpen,
  approverData,
  contractData,
}: Props) {
  const action = useRegistryFormStore((state) => state.action);

  const [startProcessingSpinner, stopProcessingSpinner] =
    useLoadingSpinnerStore((state) => [
      state.startProcessingSpinner,
      state.stopProcessingSpinner,
    ]);

  const toast = useToast();

  const altSelectStyle: ChakraStylesConfig = {
    dropdownIndicator: (provided, state) => ({
      ...provided,
      background: state.isFocused ? 'contrast.100' : provided.background,
    }),
    control: (provided) => ({
      ...provided,
      background: 'backgroundLight',
      color: 'text.standard',
      rounded: 0,
      fontSize: '12px',
    }),
    option: (provided) => ({
      ...provided,
      color: 'text.standard',
      rounded: 0,
      fontSize: '12px',
    }),
    menuList: (provided) => ({
      ...provided,
      color: 'text.standard',
      rounded: 0,
    }),
  };
  const [insertApprover, updateApprover, removeApprover] =
    useContractDocumentApproverStore((state) => [
      state.insertContractDocumentApproverStore,
      state.updateContractDocumentApproverStore,
      state.removeContractDocumentApproverStore,
    ]);

  const [customerContactSelectOptions, setCustomerContactSelectOptions] =
    useState<tSelectMenuOption[]>([]);

  const [approverName, setApproverName] = useState<string>('-');
  const [approverEmail, setApproverEmail] = useState<string>('-');
  const [customerContactList, setCustomerContactList] = useState<
    tCustomerContact[]
  >([]);

  const {
    // register,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<tContractDocumentApprover>({
    resolver: zodResolver(contractDocumentApproverValidate),
  });

  const title = getTitleByAction('APROVADOR DE DOCUMENTOS', formAction);

  const updateSelectedContact = (
    onChangeFn: (...event: any[]) => void,
    eventData: any,
    value: string | undefined,
  ) => {
    onChangeFn(value);
    if (eventData === undefined && eventData !== value) {
      setApproverName('-');
      setApproverEmail('-');
    }
    if (eventData !== undefined && eventData !== value) {
      const selectedContact = customerContactList.find(
        (item) => item.id === eventData,
      );
      if (selectedContact) {
        if (selectedContact.name) setApproverName(selectedContact.name);
        if (selectedContact.email) setApproverEmail(selectedContact.email);
      }
    }
  };

  const submitDocumentApprover: SubmitHandler<
    tContractDocumentApprover
  > = async (data) => {
    let updatedData: tFechAppReturn;

    if (action === 'insert') {
      if (formAction === 'delete') {
        removeApprover(data);
        toast({
          title: 'Aprovador removido com sucesso',
          status: 'success',
        });
        setIsFormOpen(false);
        return;
      }
      if (formAction === 'edit') {
        updateApprover(data);
        toast({
          title: 'Aprovador atualizado com sucesso',
          status: 'success',
        });
        setIsFormOpen(false);
        return;
      }
      if (formAction === 'insert') {
        insertApprover(data);
        toast({
          title: 'Aprovador inserido com sucesso',
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
          endpoint: `/api/internal/contracts/${contractData?.id}/contractdocumentapprover/${approverData?.id}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        toast({
          title: `Erro ao desativar o aprovador "${data.id}"`,
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
            ? `/api/internal/contracts/${contractData?.id}/contractdocumentapprover`
            : `/api/internal/contracts/${contractData?.id}/contractdocumentapprover/${approverData?.id}`,
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!updatedData || updatedData.status !== 200) {
        console.error(updatedData);
        throw Error('Error calling FetchApp');
      }
      formAction === 'insert'
        ? insertApprover(updatedData.body)
        : updateApprover(updatedData.body);
    } catch (error) {
      console.error(error);
      const message =
        formAction === 'insert'
          ? `Erro ao incluir aprovador "${approverData?.id}"`
          : `Erro ao editar aprovador "${approverData?.id}"`;
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
          ? `Aprovador "${approverData?.id}" incluido com sucesso`
          : `Aprovador "${approverData?.id}" editado com sucesso`,
      status: 'success',
    });

    setIsFormOpen(false);
    return;
  };

  useEffect(() => {
    startProcessingSpinner();
    if (approverData && formAction !== 'insert') {
      if (approverData.customerContact?.name)
        setApproverName(approverData.customerContact.name);
      if (approverData.customerContact?.email)
        setApproverEmail(approverData.customerContact.email);
    }
    fetchApp({
      endpoint: `/api/internal/customers/${contractData?.customerId}/contacts`,
      baseUrl: window.location.origin,
    })
      .then((result) => {
        setCustomerContactList(result.body);
        const userOptions: tSelectMenuOption[] = result.body.map(
          (contact: tCustomerContact) => {
            return {
              label: contact.name,
              value: contact.id,
            };
          },
        );
        setCustomerContactSelectOptions(userOptions);
      })
      .catch((error) => {
        console.error(`FETCH ERROR: ${error}`);
        toast({
          title: 'Erro ao obter lista de contatos do cliente',
          status: 'error',
        });
        stopProcessingSpinner();
        setIsFormOpen(false);
        throw error;
      });

    if (!approverData && formAction === 'insert') {
      reset({
        isActive: true,
        approveServiceOrder: false,
      });
      stopProcessingSpinner();
      return;
    }
    if (!approverData && formAction !== 'insert') {
      stopProcessingSpinner();
      setIsFormOpen(false);
      throw new Error('Must provide Approver data');
    }

    if (approverData && action === 'insert') {
      reset({
        ...approverData,
      });
      // if (approverData.customerContact?.name)
      //   setApproverName(approverData.customerContact.name);
      // if (approverData.customerContact?.email)
      //   setApproverEmail(approverData.customerContact.email);

      stopProcessingSpinner();
      return;
    }

    fetchApp({
      endpoint: `/api/internal/contracts/${contractData?.id}/contractdocumentapprover/${approverData?.id}`,
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
          title: 'Erro ao obter informações do aprovador',
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
            <Text fontSize="12px">
              <strong>ID: </strong>
              {formAction !== 'insert' && approverData ? approverData.id : '-'}
            </Text>
            <form
              onSubmit={
                formAction === 'view'
                  ? () => setIsFormOpen(false)
                  : handleSubmit(submitDocumentApprover)
              }
            >
              <Flex direction="column" gap={3}>
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

                {/* CONTATO CLIENTE */}
                <FormControl isInvalid={errors.customerContactId !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Contato do Cliente:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'customerContactId'}
                    key={'customerContactId'}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                    }) => (
                      <AltSelect
                        name={name}
                        ref={ref}
                        onChange={(event: any) =>
                          updateSelectedContact(onChange, event.value, value)
                        }
                        //updateSelectedContact
                        //
                        onBlur={onBlur}
                        value={customerContactSelectOptions.find(
                          (item) => item.value === value,
                        )}
                        focusBorderColor="contrast.500"
                        errorBorderColor="error"
                        //bg="backgroundLight"
                        options={customerContactSelectOptions}
                        //color="text.standard"
                        //rounded={0}
                        chakraStyles={altSelectStyle}
                        placeholder="Selecione o produto"
                        isReadOnly={action === 'view' || action === 'delete'}
                      />
                    )}
                  />
                  <FormErrorMessage>
                    {errors.customerContactId?.message}
                  </FormErrorMessage>
                </FormControl>

                <Text fontSize="14px">
                  <strong>NOME: </strong>
                  {approverName}
                </Text>

                <Text fontSize="14px">
                  <strong>E-Mail: </strong>
                  {approverEmail}
                </Text>

                <Spacer />

                {/* APPROVE SERVICE ORDER */}
                <FormControl
                  isInvalid={errors.approveServiceOrder !== undefined}
                >
                  <FormLabel fontSize="11px" color="text.standard">
                    Aprova Ordem de Serviço?
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'approveServiceOrder'}
                    key={'approveServiceOrder'}
                    defaultValue={false}
                    render={({ field: { onChange, value, ref } }) => (
                      <Switch
                        size="md"
                        colorScheme="brandSecondary"
                        onChange={onChange}
                        ref={ref}
                        isChecked={value}
                        isReadOnly={
                          formAction !== 'edit' && formAction !== 'insert'
                        }
                      />
                    )}
                  />
                  <FormErrorMessage>
                    {errors.approveServiceOrder?.message}
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
