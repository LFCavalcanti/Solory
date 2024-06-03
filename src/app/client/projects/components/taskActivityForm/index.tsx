import { useProjectFormStore } from '@/lib/hooks/state/useProjectFormStore';
import { useTaskActivityFormStore } from '@/lib/hooks/state/useTaskActivityFormStore';
import {
  activityEffortSelectOptions,
  activityStatusSelectOptions,
  newProjectActivityValidate,
  tProjectActivity,
} from '@/types/Project/tProjectActivity';
import {
  newProjectTaskValidate,
  tProjectTaskWithActivities,
  taskEffortSelectOptions,
  taskStatusSelectOptions,
} from '@/types/Project/tProjectTask';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  IconButton,
} from '@chakra-ui/react';
import {
  MdOutlineSave,
  MdOutlineCancel,
  MdDeleteOutline,
  MdExitToApp,
} from 'react-icons/md';
// import { Select as AltSelect, ChakraStylesConfig } from 'chakra-react-select';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';

interface Props {
  milestoneIndex: number;
}

export default function TaskActivityForm({ milestoneIndex }: Props) {
  const [isFieldsReadOnly, setIsFieldsReadOnly] = useState(false);
  const [milestoneList, editListItem, removeItemFromList] = useProjectFormStore(
    (state) => [
      state.milestoneList,
      state.editListItem,
      state.removeItemFromList,
    ],
  );

  const [
    rowDepth,
    taskRowIndex,
    activityRowIndex,
    taskActivityFormAction,
    closeTaskActivityForm,
  ] = useTaskActivityFormStore((state) => [
    state.rowDepth,
    state.taskRowIndex,
    state.activityRowIndex,
    state.taskActivityFormAction,
    state.closeTaskActivityForm,
  ]);

  const {
    register,
    reset,
    setValue,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<tProjectTaskWithActivities | tProjectActivity>({
    resolver: zodResolver(
      rowDepth === 0 ? newProjectTaskValidate : newProjectActivityValidate,
    ),
  });

  const statusSelectOptions =
    rowDepth === 0 ? taskStatusSelectOptions : activityStatusSelectOptions;

  const effortSelectOptions =
    rowDepth === 0 ? taskEffortSelectOptions : activityEffortSelectOptions;

  const excludeElement = () => {
    if (
      rowDepth === null ||
      (rowDepth === 0 && taskRowIndex === null) ||
      (rowDepth === 1 && activityRowIndex === null)
    )
      return;
    removeItemFromList(rowDepth === 0 ? 'task' : 'activity', [
      milestoneIndex,
      taskRowIndex!,
      activityRowIndex!,
    ]);
    closeTaskActivityForm();
    return;
  };

  const submitElement: SubmitHandler<
    tProjectTaskWithActivities | tProjectActivity
  > = (validatedData) => {
    if (
      rowDepth === null ||
      (rowDepth === 0 && taskRowIndex === null) ||
      (rowDepth === 1 && activityRowIndex === null)
    )
      return;
    if (taskActivityFormAction === 'view') {
      closeTaskActivityForm();
      return;
    }
    const currActivities = milestoneList[milestoneIndex].tasks[taskRowIndex!];
    const indexArray = [milestoneIndex, taskRowIndex!];
    if (rowDepth === 1) {
      indexArray.push(activityRowIndex!);
    }
    editListItem(rowDepth === 0 ? 'task' : 'activity', indexArray, {
      ...validatedData,
      isActive: true,
      ...(rowDepth === 0 && { activities: currActivities }),
    });
    closeTaskActivityForm();
    return;
  };

  const getConfirmButtonIcon = () => {
    if (taskActivityFormAction === 'edit') return <MdOutlineSave />;
    if (taskActivityFormAction === 'exclude') return <MdDeleteOutline />;
    return <MdExitToApp />;
  };

  useEffect(() => {
    setIsFieldsReadOnly(
      !(
        taskActivityFormAction === 'insert' || taskActivityFormAction === 'edit'
      ),
    );
    if (
      rowDepth === null ||
      (rowDepth === 0 && taskRowIndex === null) ||
      (rowDepth === 1 && activityRowIndex === null)
    )
      return;
    const rowData =
      rowDepth === 0
        ? milestoneList[milestoneIndex].tasks[taskRowIndex!]
        : milestoneList[milestoneIndex].tasks[taskRowIndex!].activities[
            activityRowIndex!
          ];
    reset(rowData);
  }, []);

  return (
    <Flex direction="column" gap={1}>
      <form>
        <Flex direction="row" gap={1} flexGrow={1} alignItems={'top'}>
          <FormControl isInvalid={errors.order !== undefined} flexGrow={1}>
            <FormLabel fontSize="11px" color="text.standard">
              Ordem:
            </FormLabel>
            <Input
              type="text"
              variant="outline"
              fontSize="12px"
              placeholder="Ordem do item"
              bg="whiteAlpha.600"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={true}
              isDisabled={true}
              {...register('order')}
            />
            <FormErrorMessage>{errors.order?.message}</FormErrorMessage>
          </FormControl>

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
              placeholder="Descrição da tarefa ou atividade"
              bg="whiteAlpha.600"
              focusBorderColor="contrast.500"
              errorBorderColor="error"
              color="text.standard"
              rounded={0}
              isReadOnly={
                // taskActivityFormAction === 'view' ||
                // taskActivityFormAction === 'exclude'
                isFieldsReadOnly
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

          <FormControl isInvalid={errors.effortUnit !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Unidade de Esforço:
            </FormLabel>
            <Controller
              control={control}
              name={'effortUnit'}
              key={'effortUnit'}
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
                  pointerEvents={
                    // taskActivityFormAction === 'view' ? 'none' : 'auto'
                    isFieldsReadOnly ? 'none' : 'auto'
                  }
                >
                  {effortSelectOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              )}
            />
            <FormErrorMessage>{errors.effortUnit?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.effortQuantity !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Quantidade:
            </FormLabel>
            <Controller
              name={'effortQuantity'}
              key={'effortQuantity'}
              control={control}
              render={({ field: { ref, onChange, ...restField } }) => (
                <NumberInput
                  inputMode="decimal"
                  variant="outline"
                  focusBorderColor="contrast.500"
                  errorBorderColor="error"
                  isReadOnly={
                    // taskActivityFormAction === 'view' ||
                    // taskActivityFormAction === 'exclude'
                    isFieldsReadOnly
                  }
                  precision={2}
                  // onChange={(event) =>
                  //   updateBalance(
                  //     event.target.value,
                  //     event.target.value,
                  //     onChange,
                  //   )
                  // }
                  onChange={(event) => {
                    if (event) setValue('effortBalance', Number(event));
                    onChange(event);
                  }}
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
            <FormErrorMessage>
              {errors.effortQuantity?.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.effortBalance !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Saldo de Esforço:
            </FormLabel>
            <Controller
              name={'effortBalance'}
              key={'effortBalance'}
              control={control}
              render={({ field: { ref, ...restField } }) => (
                <NumberInput
                  inputMode="decimal"
                  variant="outline"
                  focusBorderColor="contrast.500"
                  errorBorderColor="error"
                  isReadOnly={true}
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
            <FormErrorMessage>{errors.effortBalance?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.progress !== undefined}>
            <FormLabel fontSize="11px" color="text.standard">
              Progresso:
            </FormLabel>
            <Controller
              name={'progress'}
              key={'progress'}
              control={control}
              render={({ field: { ref, ...restField } }) => (
                <NumberInput
                  inputMode="decimal"
                  variant="outline"
                  focusBorderColor="contrast.500"
                  errorBorderColor="error"
                  isReadOnly={true}
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
            <FormErrorMessage>{errors.progress?.message}</FormErrorMessage>
          </FormControl>
          <Flex direction="row" gap={1} flexGrow={1} alignItems={'center'}>
            <IconButton
              aria-label="Confirm"
              variant="primaryOutline"
              icon={getConfirmButtonIcon()} //ADD TASK
              onClick={
                taskActivityFormAction === 'view'
                  ? closeTaskActivityForm
                  : taskActivityFormAction === 'exclude'
                    ? excludeElement
                    : handleSubmit(submitElement)
              }
            />
            <IconButton
              aria-label="Cancel"
              variant="secondaryOutline"
              icon={<MdOutlineCancel />} //ADD TASK
              onClick={closeTaskActivityForm}
            />
          </Flex>
        </Flex>
      </form>
    </Flex>
  );
}
