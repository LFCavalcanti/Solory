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
  Input,
  FormErrorMessage,
  Switch,
  Button,
  Text,
  useToast,
  Select,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import fetchApp from '@/lib/fetchApp';
import { tFechAppReturn } from '@/types/tFechAppReturn';
import {
  contractItemValidate,
  itemTypeSelectOptions,
  tContractItem,
} from '@/types/Contract/tContractItem';
import { tContract } from '@/types/Contract/tContract';
import { useContractItemStore } from '@/lib/hooks/state/useContractItemStore';
import { tSelectMenuOption } from '@/types/tSelectMenuOption';
import { tProduct } from '@/types/Product/tProduct';
import { Select as AltSelect, ChakraStylesConfig } from 'chakra-react-select';

interface Props {
  formAction: tRegistryAction;
  isFormOpen: boolean;
  setIsFormOpen: Dispatch<SetStateAction<boolean>>;
  itemData?: tContractItem | null;
  contractData?: tContract | null;
}

export default function ContractItemForm({
  formAction,
  isFormOpen,
  setIsFormOpen,
  itemData,
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
  const [insertItem, updateItem, removeItem] = useContractItemStore((state) => [
    state.insertContractItem,
    state.updateContractItem,
    state.removeContractItem,
  ]);

  const [productSelectOptions, setProductSelectOptions] = useState<
    tSelectMenuOption[]
  >([]);

  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<tContractItem>({
    resolver: zodResolver(contractItemValidate),
  });

  const title = getTitleByAction('CONTRATO - ITEM', formAction);

  const submitContractItem: SubmitHandler<tContractItem> = async (data) => {
    let updatedData: tFechAppReturn;

    if (action === 'insert') {
      if (formAction === 'delete') {
        removeItem(data);
        toast({
          title: 'Item removido com sucesso',
          status: 'success',
        });
        setIsFormOpen(false);
        return;
      }
      if (formAction === 'edit') {
        updateItem(data);
        toast({
          title: 'Item atualizado com sucesso',
          status: 'success',
        });
        setIsFormOpen(false);
        return;
      }
      if (formAction === 'insert') {
        insertItem(data);
        toast({
          title: 'Item inserido com sucesso',
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
          endpoint: `/api/internal/contracts/${contractData?.id}/items/${itemData?.id}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        toast({
          title: `Erro ao desativar o item "${data.description}"`,
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
            ? `/api/internal/contracts/${contractData?.id}/items`
            : `/api/internal/contracts/${contractData?.id}/items/${itemData?.id}`,
        body: JSON.stringify(data),
        cache: 'no-store',
      });
      if (!updatedData || updatedData.status !== 200) {
        console.error(updatedData);
        throw Error('Error calling FetchApp');
      }
      formAction === 'insert'
        ? insertItem(updatedData.body)
        : updateItem(updatedData.body);
    } catch (error) {
      console.error(error);
      const message =
        formAction === 'insert'
          ? `Erro ao incluir item "${data?.description}"`
          : `Erro ao editar item "${data?.description}"`;
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
          ? `Item "${data?.description}" incluido com sucesso`
          : `Item "${data?.description}" editado com sucesso`,
      status: 'success',
    });

    setIsFormOpen(false);
    return;
  };

  useEffect(() => {
    startProcessingSpinner();
    fetchApp({
      endpoint: `/api/internal/products`,
      baseUrl: window.location.origin,
    })
      .then((result) => {
        const productList = result.body.map((product: tProduct) => ({
          value: product.id!,
          label: product.description!,
        }));
        setProductSelectOptions(productList);
      })
      .catch((error) => {
        console.error(`FETCH ERROR: ${error}`);
        throw error;
      });
    if (!itemData && formAction === 'insert') {
      reset({
        isActive: true,
        quantity: 0,
        price: 0,
      });
      stopProcessingSpinner();
      return;
    }
    if (!itemData && formAction !== 'insert') {
      stopProcessingSpinner();
      setIsFormOpen(false);
      throw new Error('Must provide Customer Item data');
    }

    if (itemData && action === 'insert') {
      reset({
        ...itemData,
      });
      stopProcessingSpinner();
      return;
    }

    fetchApp({
      endpoint: `/api/internal/contracts/${contractData?.id}/items/${itemData?.id}`,
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
          title: 'Erro ao obter informações do item',
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
              {formAction !== 'insert' && itemData ? itemData.id : '-'}
            </Text>
            <form
              onSubmit={
                formAction === 'view'
                  ? () => setIsFormOpen(false)
                  : handleSubmit(submitContractItem)
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

                {/* RECORRENCIA */}
                <FormControl isInvalid={errors.itemType !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Tipo do item:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'itemType'}
                    key={'itemType'}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                    }) => (
                      <Select
                        name={name}
                        ref={ref}
                        onChange={onChange}
                        onBlur={onBlur}
                        value={value}
                        focusBorderColor="contrast.500"
                        errorBorderColor="error"
                        bg="backgroundLight"
                        color="text.standard"
                        fontSize="12px"
                        rounded={0}
                        isReadOnly={action === 'view' || action === 'delete'}
                      >
                        <option selected hidden disabled value="">
                          Selecione o tipo do item
                        </option>
                        {itemTypeSelectOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <FormErrorMessage>
                    {errors.itemType?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* PRODUTO */}
                <FormControl isInvalid={errors.productId !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Produto:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'productId'}
                    key={'productId'}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                    }) => (
                      <AltSelect
                        name={name}
                        ref={ref}
                        onChange={(event: any) => onChange(event.value)}
                        onBlur={onBlur}
                        value={productSelectOptions.find(
                          (item) => item.value === value,
                        )}
                        focusBorderColor="contrast.500"
                        errorBorderColor="error"
                        //bg="backgroundLight"
                        options={productSelectOptions}
                        //color="text.standard"
                        //rounded={0}
                        chakraStyles={altSelectStyle}
                        placeholder="Selecione o produto"
                        isReadOnly={action === 'view' || action === 'delete'}
                      />
                    )}
                  />
                  <FormErrorMessage>
                    {errors.productId?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.description !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Descrição:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="Descrição"
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

                <FormControl isInvalid={errors.quantity !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Quantidade:
                  </FormLabel>
                  <Controller
                    name={'quantity'}
                    key={'quantity'}
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
                    {errors.quantity?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.price !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Preço:
                  </FormLabel>
                  <Controller
                    name={'price'}
                    key={'price'}
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
                  <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
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
