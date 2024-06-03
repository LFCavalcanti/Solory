'use client';
import {
  Button,
  Checkbox,
  Flex,
  Icon,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  ColumnDef,
  getPaginationRowModel,
  ExpandedState,
  getExpandedRowModel,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import {
  MdDeleteOutline,
  MdOutlineEdit,
  MdOutlineAddBox,
  MdExpandMore,
  MdExpandLess,
} from 'react-icons/md';
import { TbMinusVertical } from 'react-icons/tb';
import { RiMenuAddLine } from 'react-icons/ri';
import { useRegistryFormStore } from '@/lib/hooks/state/useRegistryFormStore';
import { useProjectFormStore } from '@/lib/hooks/state/useProjectFormStore';
import { projectTaskTableColumns } from './taskColumns';
import { tProjectTaskWithActivities } from '@/types/Project/tProjectTask';
import { tProjectActivity } from '@/types/Project/tProjectActivity';
import { useTaskActivityFormStore } from '@/lib/hooks/state/useTaskActivityFormStore';
import TaskActivityForm from '../taskActivityForm';

interface Props {
  milestoneIndex: number;
  //   taskListLength: number;
  // taskList: tProjectTaskWithActivities[];
}

// export default function TaskTable({ milestoneIndex, taskListLength }: Props) {
export default function TaskTable({ milestoneIndex }: Props) {
  const [expandedTasks, setExpandedTasks] = useState<ExpandedState>({});
  // const [editing, setEditing] = useState<Map<[number, number], boolean>>(
  //   new Map(),
  // );

  // console.log('TASK LIST LEN: ', taskListLength);

  const [milestoneList, addItemToList, removeItemFromList] =
    useProjectFormStore((state) => [
      state.milestoneList,
      state.addItemToList,
      state.removeItemFromList,
    ]);

  // const taskList = useMemo<tProjectTaskWithActivities[]>(
  //   () => milestoneList[milestoneIndex].tasks,
  //   [taskLength],
  // );

  // const taskList = useMemo<tProjectTaskWithActivities[]>(() => {
  //   console.log('TASK LIST LEN CHANGED: ', taskLength);
  //   return milestoneList[milestoneIndex].tasks;
  // }, [taskLength]);

  const taskList = useMemo<tProjectTaskWithActivities[]>(
    () => [...milestoneList[milestoneIndex].tasks],
    [milestoneList],
  );

  // const [taskList, setTaskList] = useState<tProjectTaskWithActivities[]>([
  //   ...milestoneList[milestoneIndex].tasks,
  // ]);

  // useEffect(() => {
  //   setTaskList([...milestoneList[milestoneIndex].tasks]);
  // }, [milestoneList]);

  // console.log(taskList);

  const [openTaskActivityForm, rowDepth, taskRowIndex, activityRowIndex] =
    useTaskActivityFormStore((state) => [
      state.openTaskActivityForm,
      state.rowDepth,
      state.taskRowIndex,
      state.activityRowIndex,
    ]);

  const formAction = useRegistryFormStore((state) => state.action);

  const addTask = () => {
    addItemToList('task', [milestoneIndex], {
      description: '',
      status: 'CREATED',
      progress: 0,
      effortUnit: 'NONE',
      effortQuantity: 0,
      effortBalance: 0,
      activities: [],
      isActive: true,
    });
  };

  const addActivity = (taskIndex: number) => {
    addItemToList('activity', [milestoneIndex, taskIndex], {
      description: '',
      status: 'CREATED',
      progress: 0,
      effortUnit: 'UNIT',
      effortQuantity: 0,
      effortBalance: 0,
      isActive: true,
    });
  };

  const removeTaskActivity = (
    depth: number,
    rowIndex: number,
    parentIndex: number | undefined = 0,
  ) => {
    if (depth === 1 && parentIndex === undefined) {
      return;
    }
    if (depth === 0) {
      removeItemFromList('task', [milestoneIndex, rowIndex]);
    } else {
      removeItemFromList('activity', [milestoneIndex, parentIndex, rowIndex]);
    }
  };

  const openRowEditForm = (rowData: any) => {
    const parentRow = rowData.getParentRow();
    const rowDepth = rowData.depth;
    const taskRowIndex = rowDepth === 0 ? rowData.index : parentRow.index;
    const activityRowIndex = rowDepth === 0 ? null : rowData.index;
    openTaskActivityForm(rowDepth, taskRowIndex, activityRowIndex, 'edit');
  };

  const columns = useMemo<
    ColumnDef<tProjectTaskWithActivities | tProjectActivity, any>[]
  >(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            variant="registryHead"
            {...{
              isChecked: table.getIsAllRowsSelected(),
              isIndeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <Checkbox
              variant="registryRow"
              {...{
                isChecked: row.getIsSelected(),
                isDisabled: !row.getCanSelect(),
                isIndeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      },
      {
        id: 'expandTaskTable',
        cell: ({ row }) => {
          return row.depth === 0 ? (
            <Button
              leftIcon={
                row.getIsExpanded() ? (
                  <MdExpandLess size={20} />
                ) : (
                  <MdExpandMore size={20} />
                )
              }
              variant="expandRetractLine"
              width={32}
              onClick={() => row.toggleExpanded()}
            />
          ) : (
            <Icon as={TbMinusVertical} w={32} h={6} color="dark.200" />
          );
        },
      },
      ...projectTaskTableColumns,
      {
        id: 'rowActions',
        header: 'Ações',
        cell: ({ row }) => {
          return (
            <Flex flexDirection="row" gap={1} padding={1}>
              <IconButton
                aria-label="Add Task"
                variant="tableMenu"
                //as={IconButton}
                icon={<MdOutlineAddBox />} //ADD TASK
                isDisabled={
                  row.depth !== 0 ||
                  !(formAction === 'review' || formAction === 'insert')
                }
                // onClick={row.depth === 0 ? addTask : () => null}
                onClick={addTask}
              />
              <IconButton
                aria-label="Add Activity"
                variant="tableMenu"
                // as={IconButton}
                icon={<RiMenuAddLine />} //ADD ACTIVITY
                onClick={() =>
                  addActivity(
                    row.depth === 0 ? row.index : row.getParentRow()!.index,
                  )
                }
                isDisabled={
                  !(formAction === 'review' || formAction === 'insert')
                }
              />
              <IconButton
                aria-label="Edit Row"
                variant="tableMenu"
                // as={IconButton}
                icon={<MdOutlineEdit />} //EDIT ROW
                onClick={() =>
                  // openTaskActivityForm(
                  //   row.depth,
                  //   row.index,
                  //   row.getParentRow()?.index || null,
                  //   'edit',
                  // )
                  openRowEditForm(row)
                }
                isDisabled={
                  !(formAction === 'review' || formAction === 'insert')
                }
              />
              <IconButton
                aria-label="Delete"
                variant="tableMenu"
                // as={IconButton}
                icon={<MdDeleteOutline />} //ADD ACTIVITY
                onClick={() =>
                  removeTaskActivity(
                    row.depth,
                    row.index,
                    row.getParentRow()?.index,
                  )
                }
                isDisabled={
                  !(formAction === 'review' || formAction === 'insert')
                }
              />
              {/* <Button
                variant="tableMenu"
                as={IconButton}
                icon={<MdOutlineEditOff />} //CANCEL EDIT ROW
              />
              <Button
                variant="tableMenu"
                as={IconButton}
                icon={<FaRegSquareCheck />} //SAVE EDIT ROW
              /> */}
            </Flex>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: taskList,
    // data: milestoneList[milestoneIndex].tasks,
    state: {
      expanded: expandedTasks,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => {
      return 'activities' in row ? row.activities : undefined;
    },
    onExpandedChange: setExpandedTasks,
  });

  return (
    <Flex
      bg="backgroundLight"
      padding={2}
      width="100%"
      height="100%"
      gap={2}
      boxShadow="sm"
      flexDirection="column"
    >
      <Table
        size="sm"
        variant="registry"
        maxWidth="100%"
        key={`taskTable${milestoneIndex}`}
      >
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
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
          {table.getRowModel().rows.map((row) => (
            <Tr
              key={row.id}
              bg={row.getIsSelected() ? 'brandSecondary.50' : 'transparent'}
            >
              {(row.depth === rowDepth &&
                row.depth === 0 &&
                row.index === taskRowIndex) ||
              (row.depth === rowDepth &&
                row.depth === 1 &&
                row.getParentRow()!.index === taskRowIndex &&
                row.index === activityRowIndex) ? (
                <Td colSpan={10}>
                  <TaskActivityForm milestoneIndex={milestoneIndex} />
                </Td>
              ) : (
                row.getVisibleCells().map((cell) => {
                  // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                  const meta: any = cell.column.columnDef.meta;
                  const rowData: any = row.original;
                  return (
                    <Td
                      key={cell.id}
                      isNumeric={meta?.isNumeric}
                      color={rowData.isActive ? 'text.standard' : 'gray.400'}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Td>
                  );
                })
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  );
}
