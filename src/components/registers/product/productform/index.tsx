'use client';
import fetchApp from '@/lib/fetchApp';
import getTitleByAction from '@/lib/getTitleByAction';
import { useRegistryFormStore } from '@/lib/hooks/state/useRegistryFormStore';
import getButtonNameByAction from '@/lib/tokens/getButtonNameByAction';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Select,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import getTableLocaleDate from '@/lib/getTableLocaleDate';
import { useRouter } from 'next/navigation';
import { tFechAppReturn } from '@/types/tFechAppReturn';
import { useLoadingSpinnerStore } from '@/lib/hooks/state/useLoadingSpinnerStore';
import {
  productTableRowValidate,
  productValidate,
  tProduct,
} from '@/types/Product/tProduct';
import { tFormSelectOptionList } from '@/types/tFormSelectOptions';
import { tProductType } from '@/types/Product/tProductType';

export default function ProductForm() {
  const router = useRouter();

  const [startProcessingSpinner, stopProcessingSpinner] =
    useLoadingSpinnerStore((state) => [
      state.startProcessingSpinner,
      state.stopProcessingSpinner,
    ]);

  const toast = useToast();

  const [registryId, setRegistryId] = useState<string>();
  const [registryCreatedAt, setRegistryCreatedAt] = useState<string>();
  const [registryDisabledAt, setRegistryDisabledAt] = useState<string>();
  const [productTypeList, setProductTypeList] = useState<tFormSelectOptionList>(
    [],
  );
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
  } = useForm<tProduct>({
    resolver: zodResolver(productValidate),
  });

  const submitCompanyGroup: SubmitHandler<tProduct> = async (data) => {
    delete data.id;
    let updatedData: tFechAppReturn;

    if (action === 'delete') {
      try {
        updatedData = await fetchApp({
          method: 'PUT',
          baseUrl: window.location.origin,
          endpoint: `/api/internal/products/${registryId}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        toast({
          title: `Erro ao desativar o produto "${data.code}"`,
          status: 'error',
        });
        closeForm();
        router.refresh();
        return;
      }

      toast({
        title: 'Dados alterados com sucesso',
        status: 'success',
      });
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
            ? '/api/internal/products'
            : `/api/internal/products/${registryId}`,
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!updatedData || updatedData.status !== 200)
        throw Error('Error calling FetchApp');
    } catch (error) {
      console.error(error);
      const message =
        action === 'insert'
          ? `Erro ao incluir produto "${data.code}"`
          : `Erro ao editar produto "${data.code}"`;
      toast({
        title: message,
        status: 'error',
      });
      closeForm();
      router.refresh();
      return;
    }

    toast({
      title:
        action === 'insert'
          ? `Produto "${data.code}" incluido com sucesso`
          : `Produto "${data.code}" editado com sucesso`,
      status: 'success',
    });

    closeForm();
    router.refresh();
    return;
  };

  useEffect(() => {
    startProcessingSpinner();
    if (!registryData && action === 'insert') {
      reset({
        isActive: true,
      });
      // PRODUCT TYPE LIST
      fetchApp({
        endpoint: `/api/internal/products/producttypes?orderBy=type`,
        baseUrl: window.location.origin,
        cache: 'no-store',
      })
        .then((result) => {
          const productTypes: tProductType[] = result.body;
          const optionList = productTypes.map((item) => {
            return {
              label: item.description || '',
              value: item.id || '',
            };
          });
          setProductTypeList(optionList);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
        stopProcessingSpinner();
      return;
    }
    if (!registryData && action !== 'insert') {
      stopProcessingSpinner();
      throw new Error('Must provide Product data');
    }
    const rowData = productTableRowValidate.safeParse(registryData);

    if (!rowData.success)
      throw new Error('Product data type validation failed');

    setRegistryId(rowData.data.id);
    setRegistryCreatedAt(rowData.data.createdAt);
    setRegistryDisabledAt(rowData.data.disabledAt || '');
    Promise.all([
      // PRODUCT
      fetchApp({
        endpoint: `/api/internal/products/${rowData.data.id}`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          reset({
            ...result.body,
          });
          //stopProcessingSpinner();
          //setProductData(result.body);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);

          throw error;
        }),
      // PRODUCT TYPE LIST
      fetchApp({
        endpoint: `/api/internal/products/producttypes?orderBy=type`,
        baseUrl: window.location.origin,
        cache: 'no-store',
      })
        .then((result) => {
          const productTypes: tProductType[] = result.body;
          const optionList = productTypes.map((item) => {
            return {
              label: item.description || '',
              value: item.id || '',
            };
          });
          setProductTypeList(optionList);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
    ]).then(() => stopProcessingSpinner());
  }, []);

  const title = getTitleByAction('PRODUTOS', action);
  return (
    <Flex direction="column" padding={4} gap={3} height="100%" width="100%">
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
          <FormControl isInvalid={errors.typeId !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Tipo:
            </FormLabel>
            <Controller
              control={control}
              name={'typeId'}
              key={'typeId'}
              defaultValue={undefined}
              rules={{ required: 'Selecione um tipo' }}
              render={({ field: { onChange, value, name, ref } }) => (
                <Select
                  variant="outline"
                  fontSize="12px"
                  bg="backgroundLight"
                  focusBorderColor="contrast.500"
                  errorBorderColor="error"
                  color="text.standard"
                  placeholder="Selecione um tipo..."
                  rounded={0}
                  name={name}
                  ref={ref}
                  onChange={onChange}
                  value={value}
                  pointerEvents={action !== 'insert' ? 'none' : 'auto'}
                >
                  {productTypeList.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              )}
            />
            <FormErrorMessage>{errors.typeId?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.code !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Código:
            </FormLabel>
            <Input
              type="text"
              variant="outline"
              fontSize="12px"
              placeholder="Código"
              bg="backgroundLight"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={action === 'view' || action === 'delete'}
              {...register('code')}
            />
            <FormErrorMessage>{errors.code?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.description !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Descrição:
            </FormLabel>
            <Input
              type="text"
              variant="outline"
              fontSize="12px"
              placeholder="Descrição do produto"
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

          <FormControl isInvalid={errors.ncm !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              NCM:
            </FormLabel>
            <Input
              type="text"
              variant="outline"
              fontSize="12px"
              placeholder="Código NCM"
              bg="backgroundLight"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={action === 'view' || action === 'delete'}
              {...register('ncm')}
            />
            <FormErrorMessage>{errors.ncm?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.codCnae !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              CNAE:
            </FormLabel>
            <Input
              type="text"
              variant="outline"
              fontSize="12px"
              placeholder="Código CNAE"
              bg="backgroundLight"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={action === 'view' || action === 'delete'}
              {...register('codCnae')}
            />
            <FormErrorMessage>{errors.codCnae?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.codIss !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Código ISS:
            </FormLabel>
            <Input
              type="text"
              variant="outline"
              fontSize="12px"
              placeholder="Código ISS"
              bg="backgroundLight"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={action === 'view' || action === 'delete'}
              {...register('codIss')}
            />
            <FormErrorMessage>{errors.codIss?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.codebar !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Código de Barras:
            </FormLabel>
            <Input
              type="text"
              variant="outline"
              fontSize="12px"
              placeholder="Código de Barras"
              bg="backgroundLight"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={action === 'view' || action === 'delete'}
              {...register('codebar')}
            />
            <FormErrorMessage>{errors.codebar?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.gtin !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Código GTIN:
            </FormLabel>
            <Input
              type="text"
              variant="outline"
              fontSize="12px"
              placeholder="Código GTIN"
              bg="backgroundLight"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={action === 'view' || action === 'delete'}
              {...register('gtin')}
            />
            <FormErrorMessage>{errors.gtin?.message}</FormErrorMessage>
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
