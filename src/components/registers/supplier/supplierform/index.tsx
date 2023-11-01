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
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { MdOutlineWidgets } from 'react-icons/md';
import { z } from 'zod';
import {
  supplierTableRow,
  supplierValidate,
  tSupplier,
} from '@/types/Supplier/tSupplier';
import { tSupplierAddress } from '@/types/Supplier/tSupplierAddress';
import { useSupplierAddressesStore } from '@/lib/hooks/state/useSupplierAddressesStore';
import {
  supplierAddressTableColumns,
  supplierContactTableColumns,
} from '../registerFields';
import SupplierAddressForm from '../supplierAddressForm';
import { useSupplierContactStore } from '@/lib/hooks/state/useSupplierContactStore';
import SupplierContactForm from '../suppliercontactform';

export default function SupplierForm() {
  const router = useRouter();

  const [startProcessingSpinner, stopProcessingSpinner] =
    useLoadingSpinnerStore((state) => [
      state.startProcessingSpinner,
      state.stopProcessingSpinner,
    ]);
  const toast = useToast();

  const cnpjApiInputRef = useRef<HTMLInputElement>(null);

  const [registryId, setRegistryId] = useState<string>();
  const [registryCreatedAt, setRegistryCreatedAt] = useState<string>();
  const [registryDisabledAt, setRegistryDisabledAt] = useState<string>();

  const [isAdressFormOpen, setAdressFormOpen] = useState(false);
  const [adressFormAction, setAdressFormAction] =
    useState<tRegistryAction>(null);
  const [selectedAddress, setSelectedAddress] =
    useState<tSupplierAddress | null>(null);

  const [isContactFormOpen, setContactFormOpen] = useState(false);
  const [contactFormAction, setContactFormAction] =
    useState<tRegistryAction>(null);
  const [selectedContact, setSelectedContact] =
    useState<tSupplierAddress | null>(null);

  const [supplierData, setSupplierData] = useState<tSupplier>();

  const [addressList, setAddressList, insertAddress] =
    useSupplierAddressesStore((state) => [
      state.addressList,
      state.setList,
      state.insertAddress,
    ]);

  const [contactList, setContactList] = useSupplierContactStore((state) => [
    state.contactList,
    state.setList,
  ]);

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
    setValue,
    formState: { errors },
  } = useForm<tSupplier>({
    resolver: zodResolver(supplierValidate),
  });

  const openAddressForm = (
    cellData: tRegistryColumnDef | null,
    action: tRegistryAction,
  ) => {
    setAdressFormAction(action);
    setSelectedAddress(cellData);
    setAdressFormOpen(true);
  };

  const openContactForm = (
    cellData: tRegistryColumnDef | null,
    action: tRegistryAction,
  ) => {
    setContactFormAction(action);
    setSelectedContact(cellData);
    setContactFormOpen(true);
  };

  const addressColumns = useMemo<ColumnDef<tRegistryColumnDef, any>[]>(
    () => [
      ...supplierAddressTableColumns,
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
                  onClick={() => openAddressForm(cellData, 'view')}
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
                      onClick={() => openAddressForm(cellData, 'edit')}
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
                      onClick={() => openAddressForm(cellData, 'delete')}
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

  const contactColumns = useMemo<ColumnDef<tRegistryColumnDef, any>[]>(
    () => [
      ...supplierContactTableColumns,
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
                  onClick={() => openContactForm(cellData, 'view')}
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
                      onClick={() => openContactForm(cellData, 'edit')}
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
                      onClick={() => openContactForm(cellData, 'delete')}
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

  const submitSupplier: SubmitHandler<tSupplier> = async (data) => {
    if (action === 'view') {
      closeForm();
      return;
    }
    delete data.id;
    let updatedData: tFechAppReturn;

    if (!addressList || addressList.length < 1) {
      toast({
        title: 'Deve manter pelo menos um endereço',
        status: 'error',
      });
      return;
    }

    const mainAddresses = addressList.filter((address) => {
      return address.isMainAddress;
    });

    if (!mainAddresses || mainAddresses.length < 1) {
      toast({
        title: `Pelo menos um endereço deve ser marcado como principal`,
        status: 'error',
      });
      return;
    }

    if (mainAddresses && mainAddresses.length > 1) {
      toast({
        title: `Apenas um endereço pode ser marcado como principal`,
        status: 'error',
      });
      return;
    }

    if (action === 'delete') {
      try {
        updatedData = await fetchApp({
          method: 'PUT',
          baseUrl: window.location.origin,
          endpoint: `/api/internal/suppliers/${registryId}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        toast({
          title: `Erro ao desativar o fornecedor "${data.aliasName}"`,
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
            ? '/api/internal/suppliers'
            : `/api/internal/suppliers/${registryId}`,
        body: JSON.stringify({
          ...data,
          ...(action === 'insert' && {
            addresses: addressList,
            contacts: contactList,
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
          ? `Erro ao incluir fornecedor "${data.aliasName}"`
          : `Erro ao editar fornecedor "${data.aliasName}"`;
      toast({
        title: message,
        status: 'error',
      });
      return;
    }
    toast({
      title:
        action === 'insert'
          ? `Fornecedor "${data.aliasName}" incluida com sucesso`
          : `Fornecedor "${data.aliasName}" editada com sucesso`,
      status: 'success',
    });
    closeForm();
    router.refresh();
    return;
  };

  const getCompanyDataFromApi = async () => {
    startProcessingSpinner();

    const cnpjValidator = z
      .string()
      .trim()
      .min(1)
      .regex(/\d{14}/)
      .max(14);

    const cnpjFromForm = cnpjValidator.safeParse(
      cnpjApiInputRef?.current?.value,
    );

    if (!cnpjFromForm.success) {
      toast({
        title: `CNPJ inválido`,
        status: 'error',
      });
      stopProcessingSpinner();
      return;
    }

    const apiDataReturn = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${cnpjFromForm.data}`,
    );

    if (!apiDataReturn || apiDataReturn.status !== 200) {
      toast({
        title: `CNPJ inválido`,
        status: 'error',
      });
      stopProcessingSpinner();
      return;
    }

    const companyApiData = await apiDataReturn.json();

    const companyMainData: tSupplier = {
      isActive: true,
      aliasName: String(companyApiData.razao_social).slice(0, 60),
      fullName: companyApiData.razao_social,
      cnpj: companyApiData.cnpj,
      isMei:
        companyApiData.opcao_pelo_mei == null
          ? false
          : companyApiData.opcao_pelo_mei,
      isSimplesNac:
        companyApiData.opcao_pelo_simples == null
          ? false
          : companyApiData.opcao_pelo_simples,
      phone: companyApiData.ddd_telefone_1,
    };

    const companyMainAddress: tSupplierAddress = {
      isActive: true,
      isMainAddress: true,
      street: `${companyApiData.descricao_tipo_de_logradouro} ${companyApiData.logradouro}`,
      lotNumber: companyApiData.numero,
      complement: companyApiData.complemento,
      locale: companyApiData.bairro,
      postalCode: companyApiData.cep,
      state: companyApiData.uf,
      cityCode: String(companyApiData.codigo_municipio_ibge),
    };

    setSupplierData(companyMainData);
    reset(companyMainData);

    setAddressList([]);
    insertAddress(companyMainAddress);
    stopProcessingSpinner();
  };

  const addressTable = useReactTable({
    columns: addressColumns,
    data: addressList,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const contactTable = useReactTable({
    columns: contactColumns,
    data: contactList,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    startProcessingSpinner();
    if (!registryData && action === 'insert') {
      reset({
        isActive: true,
      });
      stopProcessingSpinner();
      return;
    }
    if (!registryData && action !== 'insert') {
      stopProcessingSpinner();
      throw new Error('Must provide Supplier data');
    }

    const rowData = supplierTableRow.safeParse(registryData);

    if (!rowData.success)
      throw new Error('Supplier data type validation failed');

    setRegistryId(rowData.data.id);
    setRegistryCreatedAt(rowData.data.createdAt);
    setRegistryDisabledAt(rowData.data.disabledAt || '');
    Promise.all([
      // PRINCIPAL
      fetchApp({
        endpoint: `/api/internal/suppliers/${rowData.data.id}`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          reset({
            ...result.body,
          });
          setSupplierData(result.body);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
      // ENDEREÇOS
      fetchApp({
        endpoint: `/api/internal/suppliers/${rowData.data.id}/addresses`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          setAddressList(result.body);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
      // CONTATOS
      fetchApp({
        endpoint: `/api/internal/suppliers/${rowData.data.id}/contacts`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          setContactList(result.body);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
    ]).then(() => stopProcessingSpinner());
  }, []);

  const title = getTitleByAction('FORNECEDOR', action);
  return (
    <Flex direction="column" padding={4} gap={3} height="100%" width="100%">
      {isAdressFormOpen && (
        <SupplierAddressForm
          formAction={adressFormAction}
          isFormOpen={isAdressFormOpen}
          setIsFormOpen={setAdressFormOpen}
          addressData={selectedAddress}
          supplierData={supplierData}
        />
      )}
      {isContactFormOpen && (
        <SupplierContactForm
          formAction={contactFormAction}
          isFormOpen={isContactFormOpen}
          setIsFormOpen={setContactFormOpen}
          contactData={selectedContact}
          supplierData={supplierData}
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
      {action === 'insert' && (
        <Flex
          padding={2}
          gap={2}
          justifyContent="flex-start"
          alignItems="center"
        >
          <Text fontSize="14px" color="text.standard">
            CNPJ para busca:
          </Text>
          <Input
            ref={cnpjApiInputRef}
            type="text"
            variant="outline"
            fontSize="14px"
            placeholder="00000000000000"
            bg="backgroundLight"
            focusBorderColor="contrast.500"
            errorBorderColor="error"
            color="text.standard"
            maxW={40}
            rounded={0}
          />
          <Button
            width={36}
            variant="contrast"
            type="button"
            onClick={() => getCompanyDataFromApi()}
            leftIcon={<MdOutlineWidgets />}
          >
            CONSULTAR
          </Button>
        </Flex>
      )}
      <form onSubmit={handleSubmit(submitSupplier)}>
        <Tabs variant="registryTabs">
          <TabList>
            <Tab>Principal</Tab>
            <Tab>Endereços</Tab>
            <Tab>Contatos</Tab>
          </TabList>
          <TabPanels>
            {/* PRINCIPAL */}
            <TabPanel>
              <Flex direction="column" gap={3}>
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

                <FormControl isInvalid={errors.aliasName !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Nome Fantasia:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="Nome fantasia / Marca"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={action === 'view' || action === 'delete'}
                    {...register('aliasName')}
                  />
                  <FormErrorMessage>
                    {errors.aliasName?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.fullName !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Razão Social:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="Razão Social"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={action === 'view' || action === 'delete'}
                    {...register('fullName')}
                  />
                  <FormErrorMessage>
                    {errors.fullName?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.cnpj !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    CNPJ:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="CNPJ"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={action === 'view' || action === 'delete'}
                    {...register('cnpj')}
                  />
                  <FormErrorMessage>{errors.cnpj?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.phone !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    TELEFONE:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="Telefone - Somente Numeros"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={action === 'view' || action === 'delete'}
                    {...register('phone')}
                  />
                  <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
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
                <Flex>
                  <FormControl isInvalid={errors.isMei !== undefined}>
                    <FormLabel fontSize="11px" color="text.standard">
                      É MEI?
                    </FormLabel>
                    <Controller
                      control={control}
                      name={'isMei'}
                      key={'isMei'}
                      defaultValue={false}
                      render={({ field: { onChange, value, ref } }) => (
                        <Switch
                          size="md"
                          colorScheme="brandSecondary"
                          onChange={(event) => {
                            if (event.target.value)
                              setValue('isSimplesNac', false);
                            onChange(event);
                          }}
                          ref={ref}
                          isChecked={value}
                        />
                      )}
                    />
                    <FormErrorMessage>{errors.isMei?.message}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.isSimplesNac !== undefined}>
                    <FormLabel fontSize="11px" color="text.standard">
                      Simples Nacional?
                    </FormLabel>
                    <Controller
                      control={control}
                      name={'isSimplesNac'}
                      key={'isSimplesNac'}
                      defaultValue={false}
                      render={({ field: { onChange, value, ref } }) => (
                        <Switch
                          size="md"
                          colorScheme="brandSecondary"
                          onChange={(event) => {
                            if (event.target.value) setValue('isMei', false);
                            onChange(event);
                          }}
                          ref={ref}
                          isChecked={value}
                        />
                      )}
                    />
                    <FormErrorMessage>{errors.isMei?.message}</FormErrorMessage>
                  </FormControl>
                </Flex>
              </Flex>
            </TabPanel>
            {/* ENDEREÇOS */}
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
                    onClick={() => openAddressForm(null, 'insert')}
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
                    {addressTable.getHeaderGroups().map((headerGroup) => (
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
                    {addressTable.getRowModel().rows.map((row) => (
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
            {/* CONTATOS */}
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
                    onClick={() => openContactForm(null, 'insert')}
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
                    {contactTable.getHeaderGroups().map((headerGroup) => (
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
                    {contactTable.getRowModel().rows.map((row) => (
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
