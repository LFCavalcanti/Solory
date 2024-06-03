'use client';
import fetchApp from '@/lib/fetchApp';
import getTitleByAction from '@/lib/getTitleByAction';
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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import getTableLocaleDate from '@/lib/getTableLocaleDate';
import { useRouter } from 'next/navigation';
import { tFechAppReturn } from '@/types/tFechAppReturn';
import { useLoadingSpinnerStore } from '@/lib/hooks/state/useLoadingSpinnerStore';
import { Select as AltSelect, ChakraStylesConfig } from 'chakra-react-select';
import { tSelectMenuOption } from '@/types/tSelectMenuOption';
import getFormLocaleDate from '@/lib/getFormLocaleDate';
import {
  measureSelectOptions,
  newProjectValidate,
  projectTableRowValidate,
  reviewProjectValidate,
  typeSelectOptions,
  statusSelectOptions,
  tProject,
} from '@/types/Project/tProject';
import { useProjectFormStore } from '@/lib/hooks/state/useProjectFormStore';
import { tCustomer } from '@/types/Customer/tCustomer';
import { useRegistryFormStore } from '@/lib/hooks/state/useRegistryFormStore';
import MilestoneTable from '../milestoneTable';

export default function ProjectForm() {
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

  const [contractSelectOptions, setContractSelectOptions] = useState<
    tSelectMenuOption[]
  >([]);

  const [registryId, setRegistryId] = useState<string>();
  const [registryCreatedAt, setRegistryCreatedAt] = useState<string>();
  const [registryDisabledAt, setRegistryDisabledAt] = useState<string>();

  // const [isItemFormOpen, setItemFormOpen] = useState(false);
  // const [itemFormAction, setItemFormAction] = useState<tRegistryAction>(null);
  // const [selectedItem, setSelectedItem] = useState<tContractItem | null>(null);

  //const [registryData, setRegistryData] = useState<tProject>();

  // const [contractItemList, setContractItemList] = useContractItemStore(
  //   (state) => [state.contractItemList, state.setList],
  // );

  const [
    milestoneList,
    setMilestoneList,
    resetAll,
    setCustomerId,
    setContractId,
  ] = useProjectFormStore((state) => [
    state.milestoneList,
    state.setMilestoneList,
    state.resetAll,
    state.setCustomerId,
    state.setContractId,
  ]);

  const [registryData, action, closeForm] = useRegistryFormStore((state) => [
    state.registryData,
    state.action,
    state.closeForm,
  ]);

  const [isFieldsReadOnly, setIsFieldsReadOnly] = useState(false);

  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<tProject>({
    resolver: zodResolver(
      action === 'insert' ? newProjectValidate : reviewProjectValidate,
    ),
  });

  const closeProjectForm = () => {
    resetAll();
    closeForm();
  };

  const getContracts = async (customerId: any) => {
    const contractList = await fetchApp({
      endpoint: `/api/internal/customers/${customerId}/contracts?onltActive=true&orderBy=description&selectOptions=true`,
      baseUrl: window.location.origin,
    });
    setContractSelectOptions(contractList.body);
  };

  const onSelectingCustomer = async (
    onChangeFn: (...event: any[]) => void,
    eventData: any,
    value: string | undefined,
  ) => {
    onChangeFn(eventData);
    if (eventData === undefined && eventData !== value) {
      setCustomerId(null);
    }
    if (eventData !== undefined && eventData !== value) {
      setCustomerId(eventData);
      getContracts(eventData);
    }
  };

  const onSelectingContract = async (
    onChangeFn: (...event: any[]) => void,
    eventData: any,
    value: string | undefined,
  ) => {
    onChangeFn(eventData);
    if (eventData === undefined && eventData !== value) {
      setContractId(null);
    } else if (eventData !== undefined && eventData !== value) {
      setContractId(eventData);
    }
  };

  const submitProject: SubmitHandler<tProject> = async (
    projectValidatedData,
  ) => {
    if (action === 'view') {
      closeForm();
      return;
    }
    delete projectValidatedData.id;
    let updatedData: tFechAppReturn;

    if (!milestoneList || milestoneList.length < 1) {
      toast({
        title: 'Deve manter pelo menos um Milestone',
        status: 'error',
      });
      return;
    }

    try {
      updatedData = await fetchApp({
        method: 'POST',
        baseUrl: window.location.origin,
        endpoint:
          action === 'insert'
            ? '/api/internal/projects/new'
            : `/api/internal/projects/${registryId}/review`,
        body: JSON.stringify({
          ...projectValidatedData,
          milestones: milestoneList,
        }),
        cache: 'no-store',
      });
      if (!updatedData || updatedData.status !== 200) {
        console.error(updatedData);
        throw Error('Error calling FetchApp');
      }
    } catch (error) {
      console.error(error);
      const message =
        action === 'insert'
          ? `Erro ao incluir projeto "${projectValidatedData.name}"`
          : `Erro ao revisar projeto "${projectValidatedData.name}"`;
      toast({
        title: message,
        status: 'error',
      });
      return;
    }
    toast({
      title:
        action === 'insert'
          ? `Projeto "${projectValidatedData.name}" incluido com sucesso`
          : `Projeto "${projectValidatedData.name}" revisado com sucesso`,
      status: 'success',
    });
    closeForm();
    router.refresh();
    return;
  };

  useEffect(() => {
    startProcessingSpinner();
    setIsFieldsReadOnly(!(action === 'insert' || action === 'review'));

    if (action === 'insert' || action === 'review' || action === 'view') {
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
          version: 0,
          totalCost: 0,
          progress: 0,
        });
        setMilestoneList([]);
        resetAll();
        stopProcessingSpinner();
        return;
      }
    }
    if (!registryData && action !== 'insert') {
      stopProcessingSpinner();
      throw new Error('Must provide Project data');
    }

    const rowData = projectTableRowValidate.safeParse(registryData);

    if (!rowData.success) {
      console.error('VALIDATION ERROR ON PROJECT DATA', rowData);
      throw new Error('Project data type validation failed');
    }

    setRegistryId(rowData.data.id);
    setRegistryCreatedAt(rowData.data.createdAt);
    setRegistryDisabledAt(rowData.data.disabledAt || '');
    Promise.all([
      fetchApp({
        endpoint: `/api/internal/projects/${rowData.data.id}/?version=${rowData.data.version}`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          const registrySchema: tProject = result.body;
          if (registrySchema.startDate)
            registrySchema.startDate = getFormLocaleDate(
              registrySchema.startDate,
            );
          if (registrySchema.endDate)
            registrySchema.endDate = getFormLocaleDate(registrySchema.endDate);
          if (result.body.customerId) {
            getContracts(result.body.customerId);
          }
          if (result.body.contractId) {
            setContractId(result.body.contractId);
          }
          reset({
            ...result.body,
          });
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
      fetchApp({
        endpoint: `/api/internal/projects/${rowData.data.id}/milestones?tableList=true`,
        baseUrl: window.location.origin,
      })
        .then((result) => {
          setMilestoneList(result.body);
        })
        .catch((error) => {
          console.error(`FETCH ERROR: ${error}`);
          throw error;
        }),
    ]).then(() => stopProcessingSpinner());
  }, []);

  const title = getTitleByAction('PROJETO', action);
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
          <strong>BLOQUEADO EM: </strong>
          {action === 'insert'
            ? '-'
            : getTableLocaleDate(registryDisabledAt || '')}
        </Text>
      </Flex>
      <Tabs variant="registryTabs">
        <TabList>
          <Tab>Principal</Tab>
          <Tab>Itens</Tab>
        </TabList>
        <TabPanels>
          {/* PRINCIPAL */}
          <TabPanel>
            <form>
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
                        onChange={(event: any) =>
                          onSelectingCustomer(onChange, event.value, value)
                        }
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
                        isReadOnly={isFieldsReadOnly}
                      />
                    )}
                  />
                  <FormErrorMessage>
                    {errors.customerId?.message}
                  </FormErrorMessage>
                </FormControl>

                {/* Contrato */}
                <FormControl isInvalid={errors.contractId !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Contrato:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'contractId'}
                    key={'contractId'}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                    }) => (
                      <AltSelect
                        name={name}
                        ref={ref}
                        onChange={(event: any) =>
                          onSelectingContract(onChange, event.value, value)
                        }
                        onBlur={onBlur}
                        value={contractSelectOptions.find(
                          (item) => item.value === value,
                        )}
                        focusBorderColor="contrast.500"
                        errorBorderColor="error"
                        //bg="backgroundLight"
                        options={contractSelectOptions}
                        //color="text.standard"
                        //rounded={0}
                        chakraStyles={altSelectStyle}
                        placeholder="Selecione o contrato"
                        isReadOnly={isFieldsReadOnly}
                      />
                    )}
                  />
                  <FormErrorMessage>
                    {errors.contractId?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.name !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Nome:
                  </FormLabel>
                  <Input
                    type="text"
                    variant="outline"
                    fontSize="12px"
                    placeholder="Nome do Projeto"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={isFieldsReadOnly}
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
                    placeholder="Descrição do Projeto"
                    bg="backgroundLight"
                    focusBorderColor="contrast.500"
                    errorBorderColor="error"
                    color="text.standard"
                    rounded={0}
                    isReadOnly={isFieldsReadOnly}
                    {...register('description')}
                  />
                  <FormErrorMessage>
                    {errors.description?.message}
                  </FormErrorMessage>
                </FormControl>

                <Flex direction="column" gap={3}>
                  <FormControl isInvalid={errors.startDate !== undefined}>
                    <FormLabel fontSize="11px" color="text.standard">
                      Data de Inicio:
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
                      isReadOnly={isFieldsReadOnly}
                      {...register('startDate')}
                    />
                    <FormErrorMessage>
                      {errors.startDate?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.endDate !== undefined}>
                    <FormLabel fontSize="11px" color="text.standard">
                      Data de Conclusão:
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
                      isReadOnly={isFieldsReadOnly}
                      {...register('endDate')}
                    />
                    <FormErrorMessage>
                      {errors.endDate?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Flex>

                {/* TIPO DE PROJETO */}
                <FormControl isInvalid={errors.type !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Tipo de Projeto:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'type'}
                    key={'type'}
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
                        isReadOnly={isFieldsReadOnly}
                      >
                        <option selected hidden disabled value="">
                          Selecione o tipo de projeto
                        </option>
                        {typeSelectOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
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
                        isReadOnly={isFieldsReadOnly}
                      >
                        <option selected hidden disabled value="">
                          Selecione o tipo de medição
                        </option>
                        {measureSelectOptions.map((item) => (
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

                {/* STATUS DO PROJETO */}
                <FormControl isInvalid={errors.status !== undefined}>
                  <FormLabel fontSize="11px" color="text.standard">
                    Status:
                  </FormLabel>
                  <Controller
                    control={control}
                    name={'status'}
                    key={'status'}
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
                        isReadOnly={isFieldsReadOnly}
                      >
                        <option selected hidden disabled value="">
                          Selecione o status do projeto
                        </option>
                        {statusSelectOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  />
                  <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
                </FormControl>
              </Flex>
            </form>
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
              <MilestoneTable />
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Button
        width={28}
        variant="primary"
        mt={6}
        onClick={handleSubmit(submitProject)}
      >
        {getButtonNameByAction(action)}
      </Button>
      <Button width={28} variant="secondaryOutline" onClick={closeProjectForm}>
        CANCELAR
      </Button>
    </Flex>
  );
}
