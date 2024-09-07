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
import { tUserToBusinessRole } from '@/types/BusinessRole/tUserToBusinessRole';
import {
  businessRoleTableRowValidate,
  businessRoleValidate,
  tBusinessRole,
} from '@/types/BusinessRole/tBusinessRole';
import { useUserToBusinessRoleStore } from '@/lib/hooks/state/useUserToBusinessRoleStore';
import { userToBusinessRoleTableColumns } from '../../registerFields';
import UserToBusinessRoleForm from '../userToBusinessRoleForm';

export default function BusinessRoleForm() {
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

  const [isUserToRoleFormOpen, setUserToRoleFormOpen] = useState(false);
  const [userToRoleFormAction, setUserToRoleFormAction] =
    useState<tRegistryAction>(null);
  const [selectedUserToRole, setSelectedUserToRole] =
    useState<tUserToBusinessRole | null>(null);

  const [businessRoleData, setBusinessRoleData] = useState<tBusinessRole>();

  const [userToBusinessRoleList, setUserToBusinessRoleList] =
    useUserToBusinessRoleStore((state) => [
      state.userToBusinessRoleList,
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
  } = useForm<tBusinessRole>({
    resolver: zodResolver(businessRoleValidate),
  });

  const openUserToBusinessRoleForm = (
    cellData: tRegistryColumnDef | null,
    action: tRegistryAction,
  ) => {
    setUserToRoleFormAction(action);
    setSelectedUserToRole(cellData);
    setUserToRoleFormOpen(true);
  };

  const userToRoleColumns = useMemo<ColumnDef<tRegistryColumnDef, any>[]>(
    () => [
      ...userToBusinessRoleTableColumns,
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
                  onClick={() => openUserToBusinessRoleForm(cellData, 'view')}
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
                      onClick={() =>
                        openUserToBusinessRoleForm(cellData, 'edit')
                      }
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
                      onClick={() =>
                        openUserToBusinessRoleForm(cellData, 'delete')
                      }
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

  const submitSupplier: SubmitHandler<tBusinessRole> = async (data) => {
    if (action === 'view') {
      closeForm();
      return;
    }
    delete data.id;
    let updatedData: tFechAppReturn;

    if (action === 'delete') {
      try {
        updatedData = await fetchApp({
          method: 'PUT',
          baseUrl: window.location.origin,
          endpoint: `/api/internal/businessroles/${registryId}`,
          body: JSON.stringify({ isActive: false }),
          cache: 'no-store',
        });
        if (!updatedData || updatedData.status !== 200)
          throw Error('Error calling FetchApp');
      } catch (error) {
        console.error(error);
        toast({
          title: `Erro ao desativar o Papel de Negócio "${data.name}"`,
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
            ? '/api/internal/businessroles'
            : `/api/internal/businessroles/${registryId}`,
        body: JSON.stringify({
          ...data,
          ...(action === 'insert' && {
            users: userToBusinessRoleList,
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
          ? `Erro ao incluir o papel de negócio "${data.name}"`
          : `Erro ao editar papel de negócio "${data.name}"`;
      toast({
        title: message,
        status: 'error',
      });
      return;
    }
    toast({
      title:
        action === 'insert'
          ? `Papel de negócio "${data.name}" incluida com sucesso`
          : `Papel de negócio "${data.name}" editada com sucesso`,
      status: 'success',
    });
    closeForm();
    router.refresh();
    return;
  };

  const userToBusinessRoleTable = useReactTable({
    columns: userToRoleColumns,
    data: userToBusinessRoleList,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    startProcessingSpinner();
    if (!registryData && action === 'insert') {
      reset({
        isActive: true,
        serviceOrder: false,
        invoiceCalculate: false,
      });
      stopProcessingSpinner();
      return;
    }
    if (!registryData && action !== 'insert') {
      stopProcessingSpinner();
      throw new Error('Must provide Supplier data');
    }

    const rowData = businessRoleTableRowValidate.safeParse(registryData);

    if (!rowData.success)
      throw new Error('Supplier data type validation failed');

    setRegistryId(rowData.data.id);
    setRegistryCreatedAt(rowData.data.createdAt);
    setRegistryDisabledAt(rowData.data.disabledAt || '');
    Promise.all([
      // PRINCIPAL
      fetchApp({
        endpoint: `/api/internal/businessroles/${rowData.data.id}`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          reset({
            ...result.body,
          });
          setBusinessRoleData(result.body);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
      // CONTATOS
      fetchApp({
        endpoint: `/api/internal/businessroles/${rowData.data.id}/usertobusinessroles?tableList=true`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          setUserToBusinessRoleList(result.body);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
    ]).then(() => stopProcessingSpinner());
  }, []);

  const title = getTitleByAction('PAPÉIS DE TRABALHO', action);
  return (
    <Flex direction="column" padding={4} gap={3} height="100%" width="100%">
      {isUserToRoleFormOpen && (
        <UserToBusinessRoleForm
          formAction={userToRoleFormAction}
          isFormOpen={isUserToRoleFormOpen}
          setIsFormOpen={setUserToRoleFormOpen}
          userToBusinessRoleData={selectedUserToRole}
          businessRoleData={businessRoleData}
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
      <form onSubmit={handleSubmit(submitSupplier)}>
        <Tabs variant="registryTabs">
          <TabList>
            <Tab>Principal</Tab>
            <Tab>Usuários</Tab>
          </TabList>
          <TabPanels>
            {/* PRINCIPAL */}
            <TabPanel>
              <Flex direction="column" gap={3}>
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
                    isReadOnly={action === 'view' || action === 'delete'}
                    {...register('name')}
                  />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
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
                  <FormControl isInvalid={errors.serviceOrder !== undefined}>
                    <FormLabel fontSize="11px" color="text.standard">
                      Analista em Ordem de Serviço?
                    </FormLabel>
                    <Controller
                      control={control}
                      name={'serviceOrder'}
                      key={'serviceOrder'}
                      defaultValue={false}
                      render={({ field: { onChange, value, ref } }) => (
                        <Switch
                          size="md"
                          colorScheme="brandSecondary"
                          onChange={(event) => {
                            if (event.target.value)
                              setValue('serviceOrder', false);
                            onChange(event);
                          }}
                          ref={ref}
                          isChecked={value}
                        />
                      )}
                    />
                    <FormErrorMessage>
                      {errors.serviceOrder?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isInvalid={errors.invoiceCalculate !== undefined}
                  >
                    <FormLabel fontSize="11px" color="text.standard">
                      Calcula Faturas?
                    </FormLabel>
                    <Controller
                      control={control}
                      name={'invoiceCalculate'}
                      key={'invoiceCalculate'}
                      defaultValue={false}
                      render={({ field: { onChange, value, ref } }) => (
                        <Switch
                          size="md"
                          colorScheme="brandSecondary"
                          onChange={(event) => {
                            if (event.target.value)
                              setValue('invoiceCalculate', false);
                            onChange(event);
                          }}
                          ref={ref}
                          isChecked={value}
                        />
                      )}
                    />
                    <FormErrorMessage>
                      {errors.invoiceCalculate?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Flex>
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
                    onClick={() => openUserToBusinessRoleForm(null, 'insert')}
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
                    {userToBusinessRoleTable
                      .getHeaderGroups()
                      .map((headerGroup) => (
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
                    {userToBusinessRoleTable.getRowModel().rows.map((row) => (
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
