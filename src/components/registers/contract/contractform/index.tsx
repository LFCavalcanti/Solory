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
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberInput,
  NumberInputField,
  Switch,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tabs,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import getTableLocaleDate from '@/lib/getTableLocaleDate';
import { useRouter } from 'next/navigation';
import { tFechAppReturn } from '@/types/tFechAppReturn';
import { useLoadingSpinnerStore } from '@/lib/hooks/state/useLoadingSpinnerStore';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { AddIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { tRegistryColumnDef } from '@/types/tRegistryColumnDef';
import { FaEllipsisVertical } from 'react-icons/fa6';
import { BiBlock } from 'react-icons/bi';
import { tRegistryAction } from '@/types/tRegistryAction';
import {
  contractTableRowValidate,
  contractTypeSelectOptions,
  contractValidate,
  measureTypeSelectOptions,
  paymentTypeSelectOptions,
  recurrenceSelectOptions,
  tContract,
} from '@/types/Contract/tContract';
import { tContractItem } from '@/types/Contract/tContractItem';
import { useContractItemStore } from '@/lib/hooks/state/useContractItemStore';
import { contractItemTableColumns } from '../registerFields';
import ContractItemForm from '../contractItemForm';
import { Select as AltSelect, ChakraStylesConfig } from 'chakra-react-select';
import { tCustomer } from '@/types/Customer/tCustomer';
import { tSelectMenuOption } from '@/types/tSelectMenuOption';
import getFormLocaleDate from '@/lib/getFormLocaleDate';

export default function ContractForm() {
  const router = useRouter();

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

  const [customerSelectOptions, setCustomerSelectOptions] = useState<
    tSelectMenuOption[]
  >([]);

  const [registryId, setRegistryId] = useState<string>();
  const [registryCreatedAt, setRegistryCreatedAt] = useState<string>();
  const [registryDisabledAt, setRegistryDisabledAt] = useState<string>();

  const [isItemFormOpen, setItemFormOpen] = useState(false);
  const [itemFormAction, setItemFormAction] = useState<tRegistryAction>(null);
  const [selectedItem, setSelectedItem] = useState<tContractItem | null>(null);

  const [contractData, setContractData] = useState<tContract>();

  const [contractItemList, setContractItemList] = useContractItemStore(
    (state) => [state.contractItemList, state.setList],
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
  } = useForm<tContract>({
    resolver: zodResolver(contractValidate),
  });

  const openItemForm = (
    cellData: tRegistryColumnDef | null,
    action: tRegistryAction,
  ) => {
    setItemFormAction(action);
    setSelectedItem(cellData);
    setItemFormOpen(true);
  };

  const itemColumns = useMemo<ColumnDef<tRegistryColumnDef, any>[]>(
    () => [
      ...contractItemTableColumns,
      {
        id: 'actionButtons',
        header: 'Ações',
        cell: ({ cell }) => {
          const cellData = cell.row.original;
          return (
            <Menu>
              <MenuButton
                variant="tableMenu"
                as={IconButton}
                icon={<FaEllipsisVertical />}
              />
              <MenuList fontFamily="button" fontWeight="700">
                <MenuItem
                  fontFamily="button"
                  fontWeight="500"
                  fontSize="12px"
                  color="text.standard"
                  icon={<ViewIcon />}
                  type="button"
                  onClick={() => openItemForm(cellData, 'view')}
                >
                  Visualizar
                </MenuItem>
                {(action === 'edit' || action === 'insert') && (
                  <>
                    <MenuItem
                      fontFamily="button"
                      fontWeight="500"
                      fontSize="12px"
                      color="text.standard"
                      type="button"
                      icon={<EditIcon />}
                      onClick={() => openItemForm(cellData, 'edit')}
                    >
                      Editar
                    </MenuItem>
                    <MenuItem
                      fontFamily="button"
                      fontWeight="500"
                      fontSize="12px"
                      color="text.standard"
                      type="button"
                      icon={<BiBlock />}
                      onClick={() => openItemForm(cellData, 'delete')}
                    >
                      Desativar
                    </MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          );
        },
      },
    ],
    [],
  );

  const submitContract: SubmitHandler<tContract> = async (data) => {
    if (action === 'view') {
      closeForm();
      return;
    }
    delete data.id;
    let updatedData: tFechAppReturn;

    if (!contractItemList || contractItemList.length < 1) {
      toast({
        title: 'Deve manter pelo menos um item',
        status: 'error',
      });
      return;
    }

    if (action === 'delete') {
      try {
        updatedData = await fetchApp({
          method: 'PUT',
          baseUrl: window.location.origin,
          endpoint: `/api/internal/contracts/${registryId}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        toast({
          title: `Erro ao desativar o contrato "${data.description}"`,
          status: 'error',
        });
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
            ? '/api/internal/contracts'
            : `/api/internal/contracts/${registryId}`,
        body: JSON.stringify({
          ...data,
          ...(action === 'insert' && {
            items: contractItemList,
          }),
        }),
        cache: 'no-store',
      });
      if (!updatedData || updatedData.status !== 200)
        throw Error('Error calling FetchApp');
    } catch (error) {
      console.error(error);
      const message =
        action === 'insert'
          ? `Erro ao incluir contrato "${data.description}"`
          : `Erro ao editar contrato "${data.description}"`;
      toast({
        title: message,
        status: 'error',
      });
      return;
    }
    toast({
      title:
        action === 'insert'
          ? `Contrato "${data.description}" incluido com sucesso`
          : `Contrato "${data.description}" editado com sucesso`,
      status: 'success',
    });
    closeForm();
    router.refresh();
    return;
  };

  const itemTable = useReactTable({
    columns: itemColumns,
    data: contractItemList,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    startProcessingSpinner();
    fetchApp({
      endpoint: `/api/internal/customers`,
      baseUrl: window.location.origin,
    })
      .then((result) => {
        const customerList = result.body.map((customer: tCustomer) => ({
          value: customer.id!,
          label: customer.aliasName!,
        }));
        setCustomerSelectOptions(customerList);
      })
      .catch((error) => {
        console.error(`FETCH ERROR: ${error}`);
        throw error;
      });
    if (!registryData && action === 'insert') {
      reset({
        isActive: true,
        termDuration: 0,
        paymentTerm: 0,
        invoiceClosureDay: 0,
      });
      stopProcessingSpinner();
      return;
    }
    if (!registryData && action !== 'insert') {
      stopProcessingSpinner();
      throw new Error('Must provide Customer data');
    }

    const rowData = contractTableRowValidate.safeParse(registryData);

    if (!rowData.success)
      throw new Error('Customer data type validation failed');

    setRegistryId(rowData.data.id);
    setRegistryCreatedAt(rowData.data.createdAt);
    setRegistryDisabledAt(rowData.data.disabledAt || '');
    Promise.all([
      // PRINCIPAL
      fetchApp({
        endpoint: `/api/internal/contracts/${rowData.data.id}`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          const registrySchema: tContract = result.body;
          if (registrySchema.termStart)
            registrySchema.termStart = getFormLocaleDate(
              registrySchema.termStart,
            );
          if (registrySchema.termEnd)
            registrySchema.termEnd = getFormLocaleDate(registrySchema.termEnd);
          reset({
            ...result.body,
          });
          setContractData(result.body);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
      // ENDEREÇOS
      fetchApp({
        endpoint: `/api/internal/contracts/${rowData.data.id}/items`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          setContractItemList(result.body);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
    ]).then(() => stopProcessingSpinner());
  }, []);

  const title = getTitleByAction('CONTRATO', action);
  return (
    <Flex direction="column" padding={4} gap={3} height="100%" width="100%">
      {isItemFormOpen && (
        <ContractItemForm
          formAction={itemFormAction}
          isFormOpen={isItemFormOpen}
          setIsFormOpen={setItemFormOpen}
          itemData={selectedItem}
          contractData={contractData}
        />
      )}
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
      <form onSubmit={handleSubmit(submitContract)}>
        <Tabs variant="registryTabs">
          <TabList>
            <Tab>Principal</Tab>
            <Tab>Itens</Tab>
          </TabList>
          <TabPanels>
            {/* PRINCIPAL */}
            <TabPanel>
              <Flex direction="column" gap={3}>
                {/* CLIENTE */}
                <FormControl isInvalid={errors.customerId !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Cliente:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'customerId'}
                    key={'customerId'}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                    }) => (
                      <AltSelect
                        name={name}
                        ref={ref}
                        onChange={(event: any) => onChange(event.value)}
                        onBlur={onBlur}
                        value={customerSelectOptions.find(
                          (item) => item.value === value,
                        )}
                        focusBorderColor="contrast.500"
                        errorBorderColor="error"
                        //bg="backgroundLight"
                        options={customerSelectOptions}
                        //color="text.standard"
                        //rounded={0}
                        chakraStyles={altSelectStyle}
                        placeholder="Selecione o cliente"
                        isReadOnly={action === 'view' || action === 'delete'}
                      />
                    )}
                  />
                  <FormErrorMessage>
                    {errors.customerId?.message}
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
                    placeholder="Descrição do contrato"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={action === 'view' || action === 'delete'}
                    {...register('description')}
                  />
                  <FormErrorMessage>
                    {errors.description?.message}
                  </FormErrorMessage>
                </FormControl>

                <Flex direction="column" gap={3}>
                  <FormControl isInvalid={errors.termStart !== undefined}>
                    <FormLabel fontSize="11px" color="text.standard">
                      Início Vigência:
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
                      {...register('termStart')}
                    />
                    <FormErrorMessage>
                      {errors.termEnd?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.termDuration !== undefined}>
                    <FormLabel fontSize="11px" color="text.standard">
                      Duração:
                    </FormLabel>
                    <Controller
                      name={'termDuration'}
                      key={'termDuration'}
                      control={control}
                      render={({ field: { ref, ...restField } }) => (
                        <NumberInput
                          inputMode="numeric"
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
                      {errors.termDuration?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.termEnd !== undefined}>
                    <FormLabel fontSize="11px" color="text.standard">
                      Fim Vigência:
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
                      {...register('termEnd')}
                    />
                    <FormErrorMessage>
                      {errors.termEnd?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Flex>

                <FormControl isInvalid={errors.autoRenewal !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Renovação Automática?
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'autoRenewal'}
                    key={'autoRenewal'}
                    defaultValue={false}
                    render={({ field: { onChange, value, ref } }) => (
                      <Switch
                        size="md"
                        colorScheme="brandSecondary"
                        onChange={onChange}
                        ref={ref}
                        isChecked={value}
                        isReadOnly={action === 'view' || action === 'delete'}
                      />
                    )}
                  />
                  <FormErrorMessage>
                    {errors.autoRenewal?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* RECORRENCIA */}
                <FormControl isInvalid={errors.recurrence !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Recorrência:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'recurrence'}
                    key={'recurrence'}
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
                          Selecione o modo de recorrência
                        </option>
                        {recurrenceSelectOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <FormErrorMessage>
                    {errors.recurrence?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* TIPO DE MEDIÇÃO */}
                <FormControl isInvalid={errors.measureType !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Tipo de Medição:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'measureType'}
                    key={'measureType'}
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
                          Selecione o tipo de medição
                        </option>
                        {measureTypeSelectOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <FormErrorMessage>
                    {errors.measureType?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* TIPO DE CONTRATO */}
                <FormControl isInvalid={errors.contractType !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Tipo de Contrato:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'contractType'}
                    key={'contractType'}
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
                          Selecione o tipo de contrato
                        </option>
                        {contractTypeSelectOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <FormErrorMessage>
                    {errors.contractType?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* TIPO DE PAGAMENTO */}
                <FormControl isInvalid={errors.paymentType !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Forma de Pagamento:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'paymentType'}
                    key={'paymentType'}
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
                          Selecione a forma de pagamento
                        </option>
                        {paymentTypeSelectOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <FormErrorMessage>
                    {errors.paymentType?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.paymentTerm !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Condição de Pagamento:
                  </FormLabel>
                  <Controller
                    name={'paymentTerm'}
                    key={'paymentTerm'}
                    control={control}
                    render={({ field: { ref, ...restField } }) => (
                      <NumberInput
                        inputMode="numeric"
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
                    {errors.paymentTerm?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.invoiceClosureDay !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Dia de Faturamento:
                  </FormLabel>
                  <Controller
                    name={'invoiceClosureDay'}
                    key={'invoiceClosureDay'}
                    control={control}
                    render={({ field: { ref, ...restField } }) => (
                      <NumberInput
                        inputMode="numeric"
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
                    {errors.invoiceClosureDay?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.renewalPriceIndex !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Índice de Reajuste:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="IPCA, IGPM, etc"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={action === 'view' || action === 'delete'}
                    {...register('renewalPriceIndex')}
                  />
                  <FormErrorMessage>
                    {errors.renewalPriceIndex?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.generalNotes !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Anotações Gerais:
                  </FormLabel>
                  <Textarea
                    variant="outline"
                    fontSize="12px"
                    placeholder="Informações adicionais do contrato"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={action === 'view' || action === 'delete'}
                    {...register('generalNotes')}
                  />
                  <FormErrorMessage>
                    {errors.generalNotes?.message}
                  </FormErrorMessage>
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
                  <FormErrorMessage>
                    {errors.isActive?.message}
                  </FormErrorMessage>
                </FormControl>
              </Flex>
            </TabPanel>
            {/* ITENS */}
            <TabPanel>
              <Flex
                alignItems="left"
                justifyContent="flexStart"
                flexDirection="column"
                padding={4}
                gap={2}
              >
                {(action === 'insert' || action === 'edit') && (
                  <Button
                    // eslint-disable-next-line react/jsx-no-undef
                    leftIcon={<AddIcon />}
                    variant="primaryOutline"
                    onClick={() => openItemForm(null, 'insert')}
                    maxW={24}
                    type="button"
                  >
                    Incluir
                  </Button>
                )}

                <Table
                  size="sm"
                  variant="registryExport"
                  maxWidth="100%"
                  mt={4}
                >
                  <Thead>
                    {itemTable.getHeaderGroups().map((headerGroup) => (
                      <Tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                          const meta: any = header.column.columnDef.meta;
                          return (
                            <Th
                              key={header.id}
                              onClick={header.column.getToggleSortingHandler()}
                              isNumeric={meta?.isNumeric}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </Th>
                          );
                        })}
                      </Tr>
                    ))}
                  </Thead>
                  <Tbody>
                    {itemTable.getRowModel().rows.map((row) => (
                      <Tr key={row.id}>
                        {row.getVisibleCells().map((cell) => {
                          // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                          const meta: any = cell.column.columnDef.meta;
                          const rowData: any = row.original;
                          return (
                            <Td
                              key={cell.id}
                              isNumeric={meta?.isNumeric}
                              color={
                                rowData.isActive ? 'text.standard' : 'gray.400'
                              }
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </Td>
                          );
                        })}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>

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
