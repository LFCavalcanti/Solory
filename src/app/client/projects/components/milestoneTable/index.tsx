'use client';
import { AddIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import {
  Button,
  Checkbox,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  // useToast,
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
import { FaEllipsisVertical } from 'react-icons/fa6';
import {
  MdDeleteOutline,
  MdExpandMore,
  MdExpandLess,
  MdOutlineAddBox,
} from 'react-icons/md';
// import { useRouter } from 'next/navigation';
// import { useLoadingSpinnerStore } from '@/lib/hooks/state/useLoadingSpinnerStore';
import { useProjectFormStore } from '@/lib/hooks/state/useProjectFormStore';
import { useMilestoneFormStore } from '@/lib/hooks/state/useMilestoneFormStore';
import MilestoneForm from '../milestoneForm';
import { projectMilestoneTableColumns } from './milestoneColumns';
import TaskTable from '../taskTable';
import { tProjectMilestoneWithTasks } from '@/types/Project/tProjectMilestone';
import { useRegistryFormStore } from '@/lib/hooks/state/useRegistryFormStore';

export default function MilestoneTable() {
  const [expandedMilestones, setExpandedMilestones] = useState<ExpandedState>(
    {},
  );

  const [
    milestoneList,
    // setMilestoneList,
    // resetMilestoneList,
    // editListItem,
    addItemToList,
    // removeItemFromList,
    // resetAll,
  ] = useProjectFormStore((state) => [
    state.milestoneList,
    // state.setMilestoneList,
    // state.resetMilestoneList,
    // state.editListItem,
    state.addItemToList,
    // state.removeItemFromList,
    // state.resetAll,
  ]);

  const [isMilestoneFormOpen, openMilestoneForm, milestoneRowIndex] =
    useMilestoneFormStore((state) => [
      state.isMilestoneFormOpen,
      state.openMilestoneForm,
      state.milestoneRowIndex,
    ]);

  const formAction = useRegistryFormStore((state) => state.action);

  // const [startProcessingSpinner, stopProcessingSpinner] =
  //   useLoadingSpinnerStore((state) => [
  //     state.startProcessingSpinner,
  //     state.stopProcessingSpinner,
  //   ]);
  // const toast = useToast();
  // const router = useRouter();

  const insertNewMilestone = () => {
    addItemToList('milestone', [], {
      description: '',
      status: 'CREATED',
      progress: 0,
      isPaymentReq: false,
      paymentValue: 0,
      contractItemId: null,
      tasks: [],
      isActive: true,
    });
  };

  const addTask = (milestoneIndex: number) => {
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

  const columns = useMemo<ColumnDef<tProjectMilestoneWithTasks, any>[]>(
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
        id: 'expandMilestoneTable',
        cell: ({ row }) => {
          return (
            <Button
              icon={
                row.getIsExpanded() ? (
                  <MdExpandLess size={28} />
                ) : (
                  <MdExpandMore size={28} />
                )
              }
              variant="expandRetractLine"
              as={IconButton}
              //width={16}
              onClick={() => row.toggleExpanded()}
            />
          );
        },
      },
      ...projectMilestoneTableColumns,
      {
        id: 'actionButtons',
        header: 'Ações',
        cell: ({ row }) => {
          return (
            <Flex flexDirection="row" gap={1} padding={1}>
              <IconButton
                aria-label="Add Task"
                variant="tableMenu"
                icon={<MdOutlineAddBox />} //ADD TASK
                isDisabled={
                  row.depth !== 0 ||
                  !(formAction === 'review' || formAction === 'insert')
                }
                onClick={() => addTask(row.index)}
              />
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
                    onClick={() => openMilestoneForm(row.index, 'view')}
                  >
                    Visualizar
                  </MenuItem>
                  <MenuItem
                    fontFamily="button"
                    fontWeight="500"
                    fontSize="12px"
                    color="text.standard"
                    icon={<EditIcon />}
                    onClick={() => openMilestoneForm(row.index, 'edit')}
                    isDisabled={
                      !(formAction === 'review' || formAction === 'insert')
                    }
                  >
                    Editar
                  </MenuItem>
                  <MenuItem
                    fontFamily="button"
                    fontWeight="500"
                    fontSize="12px"
                    color="text.standard"
                    icon={<MdDeleteOutline />}
                    onClick={() => openMilestoneForm(row.index, 'exclude')}
                    isDisabled={
                      !(formAction === 'review' || formAction === 'insert')
                    }
                  >
                    Excluir
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: milestoneList,
    state: {
      expanded: expandedMilestones,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpandedMilestones,
  });

  return (
    <>
      <Flex
        alignItems="left"
        justifyContent="flex-start"
        bg="whiteAlpha.600"
        flexDirection="column"
        boxShadow="lg"
        padding={0}
        width="100%"
        height="100%"
      >
        <Flex
          bg="backgroundLight"
          padding={2}
          width="100%"
          gap={2}
          boxShadow="sm"
        >
          <Button
            leftIcon={<AddIcon />}
            variant="secondary"
            onClick={() => insertNewMilestone()}
          >
            Milestone
          </Button>
        </Flex>
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
            key="milestoneTable"
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
                <>
                  <Tr
                    key={row.id}
                    bg={
                      row.getIsSelected() ? 'brandSecondary.50' : 'transparent'
                    }
                  >
                    {isMilestoneFormOpen && milestoneRowIndex == row.index ? (
                      <Td colSpan={8}>
                        <MilestoneForm key={row.id} />
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
                      })
                    )}
                  </Tr>
                  {row.getIsExpanded() && (
                    <Tr
                      key={`${row.id}-${row.index}`}
                      bg={
                        row.getIsSelected()
                          ? 'brandSecondary.50'
                          : 'transparent'
                      }
                    >
                      <Td colSpan={8}>
                        <TaskTable key={row.id} milestoneIndex={row.index} />
                      </Td>
                    </Tr>
                  )}
                </>
              ))}
            </Tbody>
          </Table>
          <Flex>
            <Button
              variant="tableNavigation"
              onClick={() => table.setPageIndex(0)}
            >
              Primeira
            </Button>
            <Button
              variant="tableNavigation"
              isDisabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="tableNavigation"
              isDisabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Próxima
            </Button>
            <Button
              variant="tableNavigation"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            >
              Última
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
