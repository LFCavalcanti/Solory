'use client';
import fetchApp from '@/lib/fetchApp';
import getTitleByAction from '@/lib/getTitleByAction';
import { useRegistryFormStore } from '@/lib/hooks/state/useRegistryFormStore';
import getButtonNameByAction from '@/lib/tokens/getButtonNameByAction';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  companyGroupTableRow,
  tCompanyGroup,
  companyGroupValidate,
} from '@/types/CompanyGroup/tCompanyGroup';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Switch,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import getTableLocaleDate from '@/lib/getTableLocaleDate';
import { useRouter } from 'next/navigation';
import { useTopMessageSliderStore } from '@/lib/hooks/state/useTopMessageSliderStore';
import { tFechAppReturn } from '@/types/tFechAppReturn';

export default function CompanyGroupForm() {
  const router = useRouter();

  const sendTopMessage = useTopMessageSliderStore(
    (state) => state.sendTopMessage,
  );

  const [isProcessing, setIsProcessing] = useState(true);

  const [registryId, setRegistryId] = useState<string>();
  const [registryCreatedAt, setRegistryCreatedAt] = useState<string>();
  const [registryDisabledAt, setRegistryDisabledAt] = useState<string>();

  const [companyGroupData, setCompanyGroupData] = useState<tCompanyGroup>();

  const [registryData, action, closeForm] = useRegistryFormStore((state) => [
    state.registryData,
    state.action,
    state.closeForm,
  ]);

  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<tCompanyGroup>({
    resolver: zodResolver(companyGroupValidate),
  });

  const submitCompanyGroup: SubmitHandler<tCompanyGroup> = async (data) => {
    delete data.id;
    let updatedData: tFechAppReturn;

    if (action === 'delete') {
      try {
        updatedData = await fetchApp({
          method: 'PUT',
          baseUrl: window.location.origin,
          endpoint: `/api/internal/companygroups/${registryId}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        sendTopMessage('error', `Erro ao desativar o grupo "${data.name}"`);
        closeForm();
        return;
      }

      sendTopMessage('success', 'Dados alterados com sucesso');
      closeForm();
      router.refresh();
      return;
    }

    try {
      updatedData = await fetchApp({
        method: action === 'insert' ? 'POST' : 'PUT',
        baseUrl: window.location.origin,
        endpoint:
          action === 'insert'
            ? '/api/internal/companygroups'
            : `/api/internal/companygroups/${registryId}`,
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!updatedData || updatedData.status !== 200)
        throw Error('Error calling FetchApp');
    } catch (error) {
      console.error(error);
      const message =
        action === 'insert'
          ? `Erro ao incluir grupo "${data.name}"`
          : `Erro ao editar grupo "${data.name}"`;
      sendTopMessage('error', message);
      closeForm();
      return;
    }

    sendTopMessage(
      'success',
      action === 'insert'
        ? `Grupo "${data.name}" incluido com sucesso`
        : `Grupo "${data.name}" editado com sucesso`,
    );

    closeForm();
    router.refresh();
    return;
  };

  useEffect(() => {
    if (!registryData && action === 'insert') {
      reset({
        isActive: true,
      });
      setIsProcessing(false);
      return;
    }
    if (!registryData && action !== 'insert') {
      setIsProcessing(false);
      throw new Error('Must provide Company Group data');
    }

    const rowData = companyGroupTableRow.safeParse(registryData);

    if (!rowData.success)
      throw new Error('Company Group data type validation failed');

    setRegistryId(rowData.data.id);
    setRegistryCreatedAt(rowData.data.createdAt);
    setRegistryDisabledAt(rowData.data.disabledAt || '');
    fetchApp({
      endpoint: `/api/internal/companygroups/${rowData.data.id}`,
      baseUrl: window.location.origin,
    })
      .then((result) => {
        reset({
          ...result.body,
        });
        setIsProcessing(false);
        setCompanyGroupData(result.body);
      })
      .catch((error) => {
        console.error(`FETCH ERROR: ${error}`);
        setIsProcessing(false);
        throw error;
      });
  }, []);

  const title = getTitleByAction('GRUPO DE EMPRESAS', action);
  return (
    <Flex direction="column" padding={4} gap={3} height="100%" width="100%">
      <LoadingSpinner showSpinner={isProcessing} />
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
          {action === 'insert' ? '-' : registryId}
        </Text>
        <Text fontSize="12px">
          <strong>CRIADO EM: </strong>
          {action === 'insert'
            ? '-'
            : getTableLocaleDate(registryCreatedAt || '')}
        </Text>
        <Text fontSize="12px">
          <strong>DESATIVADO EM: </strong>
          {action === 'insert'
            ? '-'
            : getTableLocaleDate(registryDisabledAt || '')}
        </Text>
      </Flex>
      <form
        onSubmit={
          action === 'view' ? closeForm : handleSubmit(submitCompanyGroup)
        }
      >
        <Flex direction="column" gap={3}>
          <FormControl isInvalid={errors.name !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Nome:
            </FormLabel>
            <Input
              type="text"
              variant="outline"
              fontSize="12px"
              placeholder="Nome do Grupo"
              bg="backgroundLight"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={action === 'view' || action === 'delete'}
              {...register('name')}
            />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.description !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Descrição:
            </FormLabel>
            <Input
              type="text"
              variant="outline"
              fontSize="12px"
              placeholder="Descrição do Grupo"
              bg="backgroundLight"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={action === 'view' || action === 'delete'}
              {...register('description')}
            />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>

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
                  isReadOnly={action !== 'edit'}
                />
              )}
            />
            <FormErrorMessage>{errors.isActive?.message}</FormErrorMessage>
          </FormControl>
          <Flex>
            <FormControl isInvalid={errors.shareSuppliers !== undefined}>
              <FormLabel fontSize="11px" color="text.standard">
                Compartilha Fornecedores?
              </FormLabel>
              <Controller
                control={control}
                name={'shareSuppliers'}
                key={'shareSuppliers'}
                defaultValue={false}
                render={({ field: { onChange, value, ref } }) => (
                  <Switch
                    size="md"
                    colorScheme="brandSecondary"
                    onChange={onChange}
                    ref={ref}
                    isChecked={value}
                    isReadOnly={
                      companyGroupData?.shareSuppliers ||
                      action === 'view' ||
                      action === 'delete'
                    }
                  />
                )}
              />
              <FormErrorMessage>
                {errors.shareSuppliers?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.shareClients !== undefined}>
              <FormLabel fontSize="11px" color="text.standard">
                Compartilha Clientes?
              </FormLabel>
              <Controller
                control={control}
                name={'shareClients'}
                key={'shareClients'}
                defaultValue={false}
                render={({ field: { onChange, value, ref } }) => (
                  <Switch
                    size="md"
                    colorScheme="brandSecondary"
                    onChange={onChange}
                    ref={ref}
                    isChecked={value}
                    isReadOnly={
                      companyGroupData?.shareClients ||
                      action === 'view' ||
                      action === 'delete'
                    }
                  />
                )}
              />
              <FormErrorMessage>
                {errors.shareClients?.message}
              </FormErrorMessage>
            </FormControl>
          </Flex>
          <Flex>
            <FormControl isInvalid={errors.shareProducts !== undefined}>
              <FormLabel fontSize="11px" color="text.standard">
                Compartilha Produtos?
              </FormLabel>
              <Controller
                control={control}
                name={'shareProducts'}
                key={'shareProducts'}
                defaultValue={false}
                render={({ field: { onChange, value, ref } }) => (
                  <Switch
                    size="md"
                    colorScheme="brandSecondary"
                    onChange={onChange}
                    ref={ref}
                    isChecked={value}
                    isReadOnly={
                      companyGroupData?.shareProducts ||
                      action === 'view' ||
                      action === 'delete'
                    }
                  />
                )}
              />
              <FormErrorMessage>
                {errors.shareProducts?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.shareKpi !== undefined}>
              <FormLabel fontSize="11px" color="text.standard">
                Compartilha KPIs?
              </FormLabel>
              <Controller
                control={control}
                name={'shareKpi'}
                key={'shareKpi'}
                defaultValue={false}
                render={({ field: { onChange, value, ref } }) => (
                  <Switch
                    size="md"
                    colorScheme="brandSecondary"
                    onChange={onChange}
                    ref={ref}
                    isChecked={value}
                    isReadOnly={
                      companyGroupData?.shareKpi ||
                      action === 'view' ||
                      action === 'delete'
                    }
                  />
                )}
              />
              <FormErrorMessage>{errors.shareKpi?.message}</FormErrorMessage>
            </FormControl>
          </Flex>
        </Flex>
        <Button width={28} variant="primary" type="submit" mt={6}>
          {getButtonNameByAction(action)}
        </Button>
      </form>
      <Button width={28} variant="secondaryOutline" onClick={closeForm}>
        CANCELAR
      </Button>
    </Flex>
  );
}
