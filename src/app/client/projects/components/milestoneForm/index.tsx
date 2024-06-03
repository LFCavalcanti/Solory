import { useMilestoneFormStore } from '@/lib/hooks/state/useMilestoneFormStore';
import { useProjectFormStore } from '@/lib/hooks/state/useProjectFormStore';
import {
  newProjectMilestoneValidate,
  statusSelectOptions,
  tNewProjectMilestone,
} from '@/types/Project/tProjectMilestone';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Switch,
  IconButton,
} from '@chakra-ui/react';
import { tSelectMenuOption } from '@/types/tSelectMenuOption';
import { Select as AltSelect, ChakraStylesConfig } from 'chakra-react-select';
import fetchApp from '@/lib/fetchApp';
import { tContractItem } from '@/types/Contract/tContractItem';
import {
  MdOutlineSave,
  MdOutlineCancel,
  MdDeleteOutline,
  MdExitToApp,
} from 'react-icons/md';

export default function MilestoneForm() {
  const altSelectStyle: ChakraStylesConfig = {
    dropdownIndicator: (provided, state) => ({
      ...provided,
      background: state.isFocused ? 'contrast.100' : provided.background,
    }),
    control: (provided) => ({
      ...provided,
      background: 'whiteAlpha.600',
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

  const [contractItemSelectOptions, setContractItemSelectOptions] = useState<
    tSelectMenuOption[]
  >([]);

  const [milestoneList, contractId, editListItem, removeItemFromList] =
    useProjectFormStore((state) => [
      state.milestoneList,
      state.contractId,
      state.editListItem,
      state.removeItemFromList,
    ]);

  const [milestoneRowIndex, milestoneFormAction, closeMilestoneForm] =
    useMilestoneFormStore((state) => [
      state.milestoneRowIndex,
      state.milestoneFormAction,
      state.closeMilestoneForm,
    ]);

  const [isFieldsReadOnly, setIsFieldsReadOnly] = useState(false);

  const {
    register,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<tNewProjectMilestone>({
    resolver: zodResolver(newProjectMilestoneValidate),
  });

  const excludeMilestone = () => {
    if (milestoneRowIndex === null) return;
    removeItemFromList('milestone', [milestoneRowIndex]);
    closeMilestoneForm();
    return;
  };

  const submitMilestone: SubmitHandler<tNewProjectMilestone> = (
    milestoneValidatedData,
  ) => {
    if (milestoneRowIndex === null) return;
    if (milestoneFormAction === 'view') {
      closeMilestoneForm();
      return;
    }
    const currTasks = milestoneList[milestoneRowIndex].tasks;
    editListItem('milestone', [milestoneRowIndex], {
      ...milestoneValidatedData,
      isActive: true,
      tasks: currTasks,
    });
    closeMilestoneForm();
    return;
  };

  const updateContractItemOptions = async () => {
    const returnedData = await fetchApp({
      endpoint: `/api/internal/contracts/${contractId}/items?onlyActive=true&orderBy=description`,
      baseUrl: window.location.origin,
    });
    const contractItemList: tSelectMenuOption[] = returnedData.body.map(
      (item: tContractItem) => {
        return {
          label: item.description!,
          value: item.id!,
        };
      },
    );
    setContractItemSelectOptions(contractItemList);
  };

  const getConfirmButtonIcon = () => {
    if (milestoneFormAction === 'edit') return <MdOutlineSave />;
    if (milestoneFormAction === 'exclude') return <MdDeleteOutline />;
    return <MdExitToApp />;
  };

  useEffect(() => {
    setIsFieldsReadOnly(
      !(milestoneFormAction === 'insert' || milestoneFormAction === 'edit'),
    );
    if (milestoneRowIndex === null) return;
    if (contractId) {
      updateContractItemOptions();
    }
    reset(milestoneList[milestoneRowIndex]);
  }, []);

  return (
    <Flex direction="column" gap={1}>
      <form>
        <Flex direction="row" gap={1} flexGrow={1} alignItems={'top'}>
          <FormControl
            isInvalid={errors.description !== undefined}
            flexGrow={1}
          >
            <FormLabel fontSize="11px" color="text.standard">
              Descrição:
            </FormLabel>
            <Input
              type="text"
              variant="outline"
              fontSize="12px"
              placeholder="Descrição do Milestone"
              bg="whiteAlpha.600"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={
                milestoneFormAction === 'view' ||
                milestoneFormAction === 'exclude'
              }
              {...register('description')}
            />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.status !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Status:
            </FormLabel>
            <Controller
              control={control}
              name={'status'}
              key={'status'}
              defaultValue={undefined}
              rules={{ required: 'Selecione um status' }}
              render={({ field: { onChange, value, name, ref } }) => (
                <Select
                  variant="outline"
                  fontSize="12px"
                  bg="whiteAlpha.600"
                  focusBorderColor="contrast.500"
                  errorBorderColor="error"
                  color="text.standard"
                  placeholder="Selecione um status.."
                  rounded={0}
                  name={name}
                  ref={ref}
                  onChange={onChange}
                  value={value}
                  pointerEvents={'none'}
                >
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

          <FormControl isInvalid={errors.paymentValue !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Valor Pagto:
            </FormLabel>
            <Controller
              name={'paymentValue'}
              key={'paymentValue'}
              control={control}
              render={({ field: { ref, ...restField } }) => (
                <NumberInput
                  inputMode="decimal"
                  variant="outline"
                  focusBorderColor="contrast.500"
                  errorBorderColor="error"
                  isReadOnly={
                    milestoneFormAction === 'view' ||
                    milestoneFormAction === 'exclude'
                  }
                  precision={2}
                  {...restField}
                >
                  <NumberInputField
                    fontSize="12px"
                    placeholder="0"
                    bg="whiteAlpha.600"
                    color="text.standard"
                    rounded={0}
                    ref={ref}
                    name={restField.name}
                  />
                </NumberInput>
              )}
            />
            <FormErrorMessage>{errors.paymentValue?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.isPaymentReq !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Req. Pagamento?
            </FormLabel>
            <Controller
              control={control}
              name={'isPaymentReq'}
              key={'isPaymentReq'}
              defaultValue={false}
              render={({ field: { onChange, value, ref } }) => (
                <Switch
                  size="md"
                  colorScheme="brandSecondary"
                  onChange={onChange}
                  ref={ref}
                  isChecked={value}
                  isReadOnly={milestoneFormAction !== 'edit'}
                />
              )}
            />
            <FormErrorMessage>{errors.isPaymentReq?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.contractItemId !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Item do Contrato:
            </FormLabel>
            <Controller
              control={control}
              name={'contractItemId'}
              key={'contractItemId'}
              render={({ field: { onChange, onBlur, value, name, ref } }) => (
                <AltSelect
                  name={name}
                  ref={ref}
                  onChange={(event: any) => onChange(event.value)}
                  onBlur={onBlur}
                  value={contractItemSelectOptions.find(
                    (item) => item.value === value,
                  )}
                  focusBorderColor="contrast.500"
                  errorBorderColor="error"
                  options={contractItemSelectOptions}
                  chakraStyles={altSelectStyle}
                  placeholder="Selecione o item do contrato"
                  isReadOnly={isFieldsReadOnly}
                />
              )}
            />
            <FormErrorMessage>
              {errors.contractItemId?.message}
            </FormErrorMessage>
          </FormControl>
          <Flex direction="row" gap={1} flexGrow={1} alignItems={'center'}>
            <IconButton
              aria-label="Confirm"
              variant="primaryOutline"
              icon={getConfirmButtonIcon()} //ADD TASK
              onClick={
                milestoneFormAction === 'view'
                  ? closeMilestoneForm
                  : milestoneFormAction === 'exclude'
                    ? excludeMilestone
                    : handleSubmit(submitMilestone)
              }
            />
            <IconButton
              aria-label="Cancel"
              variant="secondaryOutline"
              icon={<MdOutlineCancel />} //ADD TASK
              onClick={closeMilestoneForm}
            />
          </Flex>
        </Flex>
      </form>
    </Flex>
  );
}
