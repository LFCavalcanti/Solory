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
  NumberInput,
  NumberInputField,
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
  simplesNacConfigTableRowValidate,
  simplesNacConfigValidate,
  tSimplesNacConfig,
} from '@/types/SimplesNacConfig/tSimplesNacConfig';
import getFormLocaleDate from '@/lib/getFormLocaleDate';

export default function SimplesNacConfigForm() {
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

  //const [supplierData, setSupplierData] = useState<tSimplesNacConfig>();

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
    watch,
    formState: { errors },
  } = useForm<tSimplesNacConfig>({
    resolver: zodResolver(simplesNacConfigValidate),
  });

  const watchEligibleRFactor = watch('isEligibleRFactor', false);

  const submitRegistry: SubmitHandler<tSimplesNacConfig> = async (data) => {
    if (action === 'view') {
      closeForm();
      return;
    }
    startProcessingSpinner();
    delete data.id;
    let updatedData: tFechAppReturn;

    if (action === 'delete') {
      try {
        updatedData = await fetchApp({
          method: 'PUT',
          baseUrl: window.location.origin,
          endpoint: `/api/internal/simplesnacconfig/${registryId}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        stopProcessingSpinner();
        toast({
          title: `Erro ao desativar a configuração "${data.cnaeCode} - ${data.anexoSimples}"`,
          status: 'error',
        });
        return;
      }
      toast({
        title: 'Dados alterados com sucesso',
        status: 'success',
      });
      stopProcessingSpinner();
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
            ? '/api/internal/simplesnacconfig'
            : `/api/internal/simplesnacconfig/${registryId}`,
        body: JSON.stringify({
          ...data,
        }),
        cache: 'no-store',
      });
      if (!updatedData || updatedData.status !== 200)
        throw Error('Error calling FetchApp');
    } catch (error) {
      console.error(error);
      const message =
        action === 'insert'
          ? `Erro ao incluir configuração "${data.cnaeCode} - ${data.anexoSimples}"`
          : `Erro ao editar configuração "${data.cnaeCode} - ${data.anexoSimples}"`;
      toast({
        title: message,
        status: 'error',
      });
      stopProcessingSpinner();
      return;
    }
    toast({
      title:
        action === 'insert'
          ? `Configuração "${data.cnaeCode} - ${data.anexoSimples}" incluida com sucesso`
          : `Configuração "${data.cnaeCode} - ${data.anexoSimples}" editada com sucesso`,
      status: 'success',
    });
    stopProcessingSpinner();
    closeForm();
    router.refresh();
    return;
  };

  useEffect(() => {
    startProcessingSpinner();
    if (!registryData && action === 'insert') {
      reset({
        isActive: true,
        rFactor: 0,
        aliquotStandard: 0,
        aliquotRFactor: 0,
        floorRevenue: 0,
        ceilRevenue: 0,
      });
      stopProcessingSpinner();
      return;
    }
    if (!registryData && action !== 'insert') {
      stopProcessingSpinner();
      throw new Error('Must provide Supplier data');
    }

    const rowData = simplesNacConfigTableRowValidate.safeParse(registryData);

    if (!rowData.success)
      throw new Error('Simples Nac Config row data type validation failed');

    setRegistryId(rowData.data.id);
    setRegistryCreatedAt(rowData.data.createdAt);
    setRegistryDisabledAt(rowData.data.disabledAt || '');
    // PRINCIPAL
    fetchApp({
      endpoint: `/api/internal/simplesnacconfig/${rowData.data.id}`,
      baseUrl: window.location.origin,
    })
      .then((result) => {
        const registrySchema: tSimplesNacConfig = result.body;
        if (registrySchema.activeSince)
          registrySchema.activeSince = getFormLocaleDate(
            registrySchema.activeSince,
          );
        if (registrySchema.expiresAt)
          registrySchema.expiresAt = getFormLocaleDate(
            registrySchema.expiresAt,
          );
        reset({
          ...registrySchema,
        });
        stopProcessingSpinner();
      })
      .catch((error) => {
        console.error(`FETCH ERROR: ${error}`);
        stopProcessingSpinner();
        throw error;
      });
  }, []);

  const title = getTitleByAction('CONFIG. SIMPLES NACIONAL', action);
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
      <form onSubmit={handleSubmit(submitRegistry)}>
        <Flex direction="column" gap={3}>
          <FormControl isInvalid={errors.activeSince !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Ativo de:
            </FormLabel>
            <Input
              type="date"
              variant="outline"
              fontSize="12px"
              placeholder=""
              bg="backgroundLight"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={action === 'view' || action === 'delete'}
              {...register('activeSince')}
            />
            <FormErrorMessage>{errors.activeSince?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.expiresAt !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Ativo até:
            </FormLabel>
            <Input
              type="date"
              variant="outline"
              fontSize="12px"
              placeholder=""
              bg="backgroundLight"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={action === 'view' || action === 'delete'}
              {...register('expiresAt')}
            />
            <FormErrorMessage>{errors.expiresAt?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.cnaeCode !== undefined}>
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
              {...register('cnaeCode')}
            />
            <FormErrorMessage>{errors.cnaeCode?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.anexoSimples !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Anexo Simples:
            </FormLabel>
            <Input
              type="text"
              variant="outline"
              fontSize="12px"
              placeholder="I, II, III..."
              bg="backgroundLight"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={action === 'view' || action === 'delete'}
              {...register('anexoSimples')}
            />
            <FormErrorMessage>{errors.anexoSimples?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.aliquotStandard !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Alíquota:
            </FormLabel>
            <Controller
              name={'aliquotStandard'}
              key={'aliquotStandard'}
              control={control}
              render={({ field: { ref, ...restField } }) => (
                <NumberInput
                  inputMode="decimal"
                  variant="outline"
                  focusBorderColor="contrast.500"
                  errorBorderColor="error"
                  isReadOnly={action === 'view' || action === 'delete'}
                  precision={2}
                  {...restField}
                >
                  <NumberInputField
                    fontSize="12px"
                    placeholder="0"
                    bg="backgroundLight"
                    color="text.standard"
                    rounded={0}
                    ref={ref}
                    name={restField.name}
                  />
                </NumberInput>
              )}
            />
            <FormErrorMessage>
              {errors.aliquotStandard?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.floorRevenue !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Inicio Faixa:
            </FormLabel>
            <Controller
              name={'floorRevenue'}
              key={'floorRevenue'}
              control={control}
              render={({ field: { ref, ...restField } }) => (
                <NumberInput
                  inputMode="decimal"
                  variant="outline"
                  focusBorderColor="contrast.500"
                  errorBorderColor="error"
                  isReadOnly={action === 'view' || action === 'delete'}
                  precision={2}
                  {...restField}
                >
                  <NumberInputField
                    fontSize="12px"
                    placeholder="0"
                    bg="backgroundLight"
                    color="text.standard"
                    rounded={0}
                    ref={ref}
                    name={restField.name}
                  />
                </NumberInput>
              )}
            />
            <FormErrorMessage>{errors.floorRevenue?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.ceilRevenue !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Fim Faixa:
            </FormLabel>
            <Controller
              name={'ceilRevenue'}
              key={'ceilRevenue'}
              control={control}
              render={({ field: { ref, ...restField } }) => (
                <NumberInput
                  inputMode="decimal"
                  variant="outline"
                  focusBorderColor="contrast.500"
                  errorBorderColor="error"
                  isReadOnly={action === 'view' || action === 'delete'}
                  precision={2}
                  {...restField}
                >
                  <NumberInputField
                    fontSize="12px"
                    placeholder="0"
                    bg="backgroundLight"
                    color="text.standard"
                    rounded={0}
                    ref={ref}
                    name={restField.name}
                  />
                </NumberInput>
              )}
            />
            <FormErrorMessage>{errors.ceilRevenue?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.isEligibleRFactor !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Elegível para Fator R?
            </FormLabel>
            <Controller
              control={control}
              name={'isEligibleRFactor'}
              key={'isEligibleRFactor'}
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
            <FormErrorMessage>
              {errors.isEligibleRFactor?.message}
            </FormErrorMessage>
          </FormControl>
          {watchEligibleRFactor && (
            <>
              <FormControl isInvalid={errors.rFactor !== undefined}>
                <FormLabel fontSize="11px" color="text.standard">
                  Fator R:
                </FormLabel>
                <Controller
                  name={'rFactor'}
                  key={'rFactor'}
                  control={control}
                  render={({ field: { ref, ...restField } }) => (
                    <NumberInput
                      inputMode="decimal"
                      variant="outline"
                      focusBorderColor="contrast.500"
                      errorBorderColor="error"
                      isReadOnly={action === 'view' || action === 'delete'}
                      precision={2}
                      {...restField}
                    >
                      <NumberInputField
                        fontSize="12px"
                        placeholder="0"
                        bg="backgroundLight"
                        color="text.standard"
                        rounded={0}
                        ref={ref}
                        name={restField.name}
                      />
                    </NumberInput>
                  )}
                />
                <FormErrorMessage>{errors.rFactor?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.aliquotRFactor !== undefined}>
                <FormLabel fontSize="11px" color="text.standard">
                  Alíquota Fator R:
                </FormLabel>
                <Controller
                  name={'aliquotRFactor'}
                  key={'aliquotRFactor'}
                  control={control}
                  render={({ field: { ref, ...restField } }) => (
                    <NumberInput
                      inputMode="decimal"
                      variant="outline"
                      focusBorderColor="contrast.500"
                      errorBorderColor="error"
                      isReadOnly={action === 'view' || action === 'delete'}
                      precision={2}
                      {...restField}
                    >
                      <NumberInputField
                        fontSize="12px"
                        placeholder="0"
                        bg="backgroundLight"
                        color="text.standard"
                        rounded={0}
                        ref={ref}
                        name={restField.name}
                      />
                    </NumberInput>
                  )}
                />
                <FormErrorMessage>
                  {errors.aliquotRFactor?.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.anexoSimplesFatorR !== undefined}>
                <FormLabel fontSize="11px" color="text.standard">
                  Anexo Fator R:
                </FormLabel>
                <Input
                  type="text"
                  variant="outline"
                  fontSize="12px"
                  placeholder="I, II, III..."
                  bg="backgroundLight"
                  focusBorderColor="contrast.500"
                  errorBorderColor="error"
                  color="text.standard"
                  rounded={0}
                  isReadOnly={action === 'view' || action === 'delete'}
                  {...register('anexoSimplesFatorR')}
                />
                <FormErrorMessage>
                  {errors.anexoSimplesFatorR?.message}
                </FormErrorMessage>
              </FormControl>
            </>
          )}

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
