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
} from '@chakra-ui/react';
import { Select as AltSelect, ChakraStylesConfig } from 'chakra-react-select';
import fetchApp from '@/lib/fetchApp';
import { tFechAppReturn } from '@/types/tFechAppReturn';
import getTableLocaleDate from '@/lib/getTableLocaleDate';
import {
  tUserToBusinessRole,
  userToBusinessRoleValidate,
} from '@/types/BusinessRole/tUserToBusinessRole';
import { tBusinessRole } from '@/types/BusinessRole/tBusinessRole';
import { useUserToBusinessRoleStore } from '@/lib/hooks/state/useUserToBusinessRoleStore';
import { tSelectMenuOption } from '@/types/tSelectMenuOption';

interface Props {
  formAction: tRegistryAction;
  isFormOpen: boolean;
  setIsFormOpen: Dispatch<SetStateAction<boolean>>;
  userToBusinessRoleData?: tUserToBusinessRole | null;
  businessRoleData?: tBusinessRole | null;
}

export default function UserToBusinessRoleForm({
  formAction,
  isFormOpen,
  setIsFormOpen,
  userToBusinessRoleData,
  businessRoleData,
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

  const [usersSelectOptions, setUsersSelectOptions] = useState<
    tSelectMenuOption[]
  >([]);

  const [
    insertUserToBusinessRole,
    updateUserToBusinessRole,
    removeUserToBusinessRole,
  ] = useUserToBusinessRoleStore((state) => [
    state.insertUserToBusinessRole,
    state.updateUserToBusinessRole,
    state.removeUserToBusinessRole,
  ]);

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<tUserToBusinessRole>({
    resolver: zodResolver(userToBusinessRoleValidate),
  });

  const title = getTitleByAction('PAPÉL DE NEGÓCIO - USUÁRIOS', formAction);

  const submitUserToBusinessRole: SubmitHandler<tUserToBusinessRole> = async (
    data,
  ) => {
    let updatedData: tFechAppReturn;

    if (action === 'insert') {
      if (formAction === 'delete') {
        removeUserToBusinessRole(data);
        toast({
          title: 'Usuário removido com sucesso',
          status: 'success',
        });
        setIsFormOpen(false);
        return;
      }
      if (formAction === 'edit') {
        updateUserToBusinessRole(data);
        toast({
          title: 'Usuário atualizado com sucesso',
          status: 'success',
        });
        setIsFormOpen(false);
        return;
      }
      if (formAction === 'insert') {
        insertUserToBusinessRole(data);
        toast({
          title: 'Usuário inserido com sucesso',
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
          endpoint: `/api/internal/businessroles/${businessRoleData?.id}/usertobusinessroles/${userToBusinessRoleData?.id}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        toast({
          title: `Erro ao desativar o usuario "${data.id}"`,
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
            ? `/api/internal/businessroles/${businessRoleData?.id}/usertobusinessroles`
            : `/api/internal/businessroles/${businessRoleData?.id}/usertobusinessroles/${userToBusinessRoleData?.id}`,
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!updatedData || updatedData.status !== 200)
        throw Error('Error calling FetchApp');
      formAction === 'insert'
        ? insertUserToBusinessRole(updatedData.body)
        : updateUserToBusinessRole(updatedData.body);
    } catch (error) {
      console.error(error);
      const message =
        formAction === 'insert'
          ? `Erro ao incluir usuário "${data?.id}"`
          : `Erro ao editar usuário "${userToBusinessRoleData?.id}"`;
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
          ? `Usuário "${data?.id}" incluido com sucesso`
          : `Usuário "${userToBusinessRoleData?.id}" editado com sucesso`,
      status: 'success',
    });

    setIsFormOpen(false);
    return;
  };

  const getUsers = async () => {
    const userList = await fetchApp({
      endpoint: `/api/internal/users?onltActive=true&selectOptions=true`,
      baseUrl: window.location.origin,
    });
    setUsersSelectOptions(userList.body);
  };

  useEffect(() => {
    startProcessingSpinner();
    getUsers();
    if (!userToBusinessRoleData && formAction === 'insert') {
      reset({
        isActive: true,
      });
      stopProcessingSpinner();
      return;
    }
    if (!userToBusinessRoleData && formAction !== 'insert') {
      stopProcessingSpinner();
      setIsFormOpen(false);
      throw new Error('Must provide User to Business Role data');
    }

    if (userToBusinessRoleData && action === 'insert') {
      reset({
        ...userToBusinessRoleData,
      });
      stopProcessingSpinner();
      return;
    }
    Promise.allSettled([
      fetchApp({
        endpoint: `/api/internal/businessroles/${businessRoleData?.id}/usertobusinessroles/${userToBusinessRoleData?.id}`,
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
            title:
              'Erro ao obter informações do usuário para papel de trabalho',
            status: 'error',
          });
          stopProcessingSpinner();
          setIsFormOpen(false);
          throw error;
        }),
      getUsers(),
    ]).then(() => stopProcessingSpinner());
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
                {action === 'insert' ? '-' : userToBusinessRoleData?.id}
              </Text>
              <Text fontSize="12px">
                <strong>CRIADO EM: </strong>
                {action === 'insert'
                  ? '-'
                  : getTableLocaleDate(userToBusinessRoleData?.createdAt || '')}
              </Text>
              <Text fontSize="12px">
                <strong>DESATIVADO EM: </strong>
                {action === 'insert'
                  ? '-'
                  : getTableLocaleDate(
                      userToBusinessRoleData?.disabledAt || '',
                    )}
              </Text>
            </Flex>
            <form
              onSubmit={
                formAction === 'view'
                  ? () => setIsFormOpen(false)
                  : handleSubmit(submitUserToBusinessRole)
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
                <FormControl isInvalid={errors.userId !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Usuário:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'userId'}
                    key={'userId'}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                    }) => (
                      <AltSelect
                        name={name}
                        ref={ref}
                        onChange={(event: any) => onChange(event.value)}
                        onBlur={onBlur}
                        value={usersSelectOptions.find(
                          (item) => item.value === value,
                        )}
                        focusBorderColor="contrast.500"
                        errorBorderColor="error"
                        //bg="backgroundLight"
                        options={usersSelectOptions}
                        //color="text.standard"
                        //rounded={0}
                        chakraStyles={altSelectStyle}
                        placeholder="Selecione o Usuário"
                        isReadOnly={formAction !== 'insert'}
                      />
                    )}
                  />
                  <FormErrorMessage>{errors.userId?.message}</FormErrorMessage>
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
