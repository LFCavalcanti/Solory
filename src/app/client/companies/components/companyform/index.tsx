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
  Select,
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
  companyTableRow,
  companyValidate,
  tCompany,
} from '@/types/Company/tCompany';
import { tCompanyAddress } from '@/types/Company/tCompanyAddress';
import { tCompanyCnaeIss } from '@/types/Company/tCompanyCnaeIss';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  companyAddressTableColumns,
  companyCnaeIssTableColumns,
} from '../../registerFields';
import { AddIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { tRegistryColumnDef } from '@/types/tRegistryColumnDef';
import { FaEllipsisVertical } from 'react-icons/fa6';
import { BiBlock } from 'react-icons/bi';
import { tRegistryAction } from '@/types/tRegistryAction';
import CompanyAddressForm from '../companyAddressForm';
import CompanyCnaeIssForm from '../companyCnaeIssForm';
import { useCompanyAddressesStore } from '@/lib/hooks/state/useCompanyAddressesStore';
import { useCompanyCnaeIssStore } from '@/lib/hooks/state/useCompanyCnaeIssStore';
import { MdOutlineWidgets } from 'react-icons/md';
import { z } from 'zod';
import { tCompanyGroup } from '@/types/CompanyGroup/tCompanyGroup';
import { tFormSelectOptionList } from '@/types/tFormSelectOptions';

export default function CompanyForm() {
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
    useState<tCompanyAddress | null>(null);

  const [isCnaeIssFormOpen, setCnaeIssFormOpen] = useState(false);
  const [cnaeIssFormAction, setCnaeIssFormAction] =
    useState<tRegistryAction>(null);
  const [selectedCnaeIss, setSelectedCnaeIss] =
    useState<tCompanyCnaeIss | null>(null);

  const [companyData, setCompanyData] = useState<tCompany>();
  const [companyGroupsList, setCompanyGroupsList] =
    useState<tFormSelectOptionList>([]);

  const [addressList, setAddressList, insertAddress] = useCompanyAddressesStore(
    (state) => [state.addressList, state.setList, state.insertAddress],
  );

  const [cnaeIssList, setCnaeIssList] = useCompanyCnaeIssStore((state) => [
    state.cnaeIssList,
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
  } = useForm<tCompany>({
    resolver: zodResolver(companyValidate),
  });

  const openAddressForm = (
    cellData: tRegistryColumnDef | null,
    action: tRegistryAction,
  ) => {
    setAdressFormAction(action);
    setSelectedAddress(cellData);
    setAdressFormOpen(true);
  };

  const openCnaeIssForm = (
    cellData: tRegistryColumnDef | null,
    action: tRegistryAction,
  ) => {
    setCnaeIssFormAction(action);
    setSelectedCnaeIss(cellData);
    setCnaeIssFormOpen(true);
  };

  const addressColumns = useMemo<ColumnDef<tRegistryColumnDef, any>[]>(
    () => [
      ...companyAddressTableColumns,
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

  const cnaeIssColumns = useMemo<ColumnDef<tRegistryColumnDef, any>[]>(
    () => [
      ...companyCnaeIssTableColumns,
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
                  type="button"
                  icon={<ViewIcon />}
                  onClick={() => openCnaeIssForm(cellData, 'view')}
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
                      onClick={() => openCnaeIssForm(cellData, 'edit')}
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
                      onClick={() => openCnaeIssForm(cellData, 'delete')}
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

  const submitCompany: SubmitHandler<tCompany> = async (data) => {
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

    if (!cnaeIssList || cnaeIssList.length < 1) {
      toast({
        title: `Deve manter pelo menos um CNAE vs ISS`,
        status: 'error',
      });
      return;
    }

    if (action === 'delete') {
      try {
        updatedData = await fetchApp({
          method: 'PUT',
          baseUrl: window.location.origin,
          endpoint: `/api/internal/companies/${registryId}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        toast({
          title: `Erro ao desativar a empresa "${data.aliasName}"`,
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
            ? '/api/internal/companies'
            : `/api/internal/companies/${registryId}`,
        body: JSON.stringify({
          ...data,
          ...(action === 'insert' && {
            addresses: addressList,
            cnaeIss: cnaeIssList,
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
          ? `Erro ao incluir empresa "${data.aliasName}"`
          : `Erro ao editar empresa "${data.aliasName}"`;
      toast({
        title: message,
        status: 'error',
      });
      return;
    }
    toast({
      title:
        action === 'insert'
          ? `Empresa "${data.aliasName}" incluida com sucesso`
          : `Empresa "${data.aliasName}" editada com sucesso`,
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
      .nonempty()
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

    const companyMainData: tCompany = {
      isActive: true,
      aliasName: String(companyApiData.razao_social).slice(0, 60),
      fullName: companyApiData.razao_social,
      cnpj: companyApiData.cnpj,
      mainCnae: String(companyApiData.cnae_fiscal),
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

    const companyMainAddress: tCompanyAddress = {
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

    const companyMainCnaeIss: tCompanyCnaeIss = {
      isActive: true,
      cnaeCode: String(companyApiData.cnae_fiscal),
      description: companyApiData.cnae_fiscal_descricao,
    };

    const secondaryCnaeIssList: tCompanyCnaeIss[] =
      companyApiData.cnaes_secundarios.map(
        (item: { codigo: string; descricao: string }) => {
          return {
            isActive: true,
            cnaeCode: String(item.codigo),
            description: item.descricao,
          };
        },
      );

    setCompanyData(companyMainData);
    reset(companyMainData);

    setAddressList([]);
    insertAddress(companyMainAddress);
    setCnaeIssList([companyMainCnaeIss, ...secondaryCnaeIssList]);
    //insertCnaeIss(companyCnaeIss);

    stopProcessingSpinner();
  };

  const addressTable = useReactTable({
    columns: addressColumns,
    data: addressList,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const cnaeIssTable = useReactTable({
    columns: cnaeIssColumns,
    data: cnaeIssList,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    startProcessingSpinner();
    if (!registryData && action === 'insert') {
      fetchApp({
        endpoint: `/api/internal/companygroups?onlyActive=true&orderBy=name`,
        baseUrl: window.location.origin,
        cache: 'no-store',
      })
        .then((result) => {
          const companyGroups: tCompanyGroup[] = result.body;
          const optionList = companyGroups.map((item) => {
            return {
              label: item.name || '',
              value: item.id || '',
            };
          });
          setCompanyGroupsList(optionList);
          stopProcessingSpinner();
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          stopProcessingSpinner();
          throw error;
        });
      reset({
        isActive: true,
      });
      return;
    }
    if (!registryData && action !== 'insert') {
      stopProcessingSpinner();
      throw new Error('Must provide Company data');
    }

    const rowData = companyTableRow.safeParse(registryData);

    if (!rowData.success)
      throw new Error('Company data type validation failed');

    setRegistryId(rowData.data.id);
    setRegistryCreatedAt(rowData.data.createdAt);
    setRegistryDisabledAt(rowData.data.disabledAt || '');
    Promise.all([
      // PRINCIPAL
      fetchApp({
        endpoint: `/api/internal/companies/${rowData.data.id}`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          reset({
            ...result.body,
          });
          setCompanyData(result.body);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
      // ENDEREÇOS
      fetchApp({
        endpoint: `/api/internal/companies/${rowData.data.id}/addresses`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          setAddressList(result.body);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
      // CNAE ISS
      fetchApp({
        endpoint: `/api/internal/companies/${rowData.data.id}/cnaeiss`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          setCnaeIssList(result.body);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
      // COMPANY GROUP LIST
      fetchApp({
        endpoint: `/api/internal/companygroups?onlyActive=true&orderBy=name`,
        baseUrl: window.location.origin,
        cache: 'no-store',
      })
        .then((result) => {
          const companyGroups: tCompanyGroup[] = result.body;
          const optionList = companyGroups.map((item) => {
            return {
              label: item.name || '',
              value: item.id || '',
            };
          });
          setCompanyGroupsList(optionList);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
    ]).then(() => stopProcessingSpinner());
  }, []);

  const title = getTitleByAction('EMPRESA', action);
  return (
    <Flex direction="column" padding={4} gap={3} height="100%" width="100%">
      {isAdressFormOpen && (
        <CompanyAddressForm
          formAction={adressFormAction}
          isFormOpen={isAdressFormOpen}
          setIsFormOpen={setAdressFormOpen}
          addressData={selectedAddress}
          companyData={companyData}
        />
      )}
      {isCnaeIssFormOpen && (
        <CompanyCnaeIssForm
          formAction={cnaeIssFormAction}
          isFormOpen={isCnaeIssFormOpen}
          setIsFormOpen={setCnaeIssFormOpen}
          cnaeIssData={selectedCnaeIss}
          companyData={companyData}
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
      <form onSubmit={handleSubmit(submitCompany)}>
        <Tabs variant="registryTabs">
          <TabList>
            <Tab>Principal</Tab>
            <Tab>CNAE e ISS</Tab>
            <Tab>Endereços</Tab>
          </TabList>
          <TabPanels>
            {/* PRINCIPAL */}
            <TabPanel>
              <Flex direction="column" gap={3}>
                <FormControl isInvalid={errors.companyGroupId !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Grupo de Empresas:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'companyGroupId'}
                    key={'companyGroupId'}
                    defaultValue={''}
                    rules={{ required: 'Selecione um grupo de empresas' }}
                    render={({ field: { onChange, value, name, ref } }) => (
                      <Select
                        variant="outline"
                        fontSize="12px"
                        bg="backgroundLight"
                        focusBorderColor="contrast.500"
                        errorBorderColor="error"
                        color="text.standard"
                        placeholder="Selecione um grupo..."
                        rounded={0}
                        name={name}
                        ref={ref}
                        onChange={onChange}
                        value={value}
                        pointerEvents={action !== 'insert' ? 'none' : 'auto'}
                      >
                        {companyGroupsList.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <FormErrorMessage>
                    {errors.companyGroupId?.message}
                  </FormErrorMessage>
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

                <FormControl isInvalid={errors.mainCnae !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    CNAE Principal:
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
                    {...register('mainCnae')}
                  />
                  <FormErrorMessage>
                    {errors.mainCnae?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.mainIssCode !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Código ISS Principal:
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
                    {...register('mainIssCode')}
                  />
                  <FormErrorMessage>
                    {errors.mainIssCode?.message}
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
            {/* CNAE ISS */}
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
                    type="button"
                    onClick={() => openCnaeIssForm(null, 'insert')}
                    maxW={24}
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
                    {cnaeIssTable.getHeaderGroups().map((headerGroup) => (
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
                    {cnaeIssTable.getRowModel().rows.map((row) => (
                      <Tr key={row.id}>
                        {row.getVisibleCells().map((cell) => {
                          // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                          const meta: any = cell.column.columnDef.meta;
                          return (
                            <Td key={cell.id} isNumeric={meta?.isNumeric}>
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
