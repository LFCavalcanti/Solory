'use client';
import {
  AddIcon,
  EditIcon,
  Search2Icon,
  TriangleDownIcon,
  TriangleUpIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import {
  Button,
  Checkbox,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
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
  chakra,
} from '@chakra-ui/react';
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  ColumnDef,
  SortingState,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { ChangeEvent, useMemo, useState } from 'react';
import { PiExportBold } from 'react-icons/pi';
import { AiOutlineDelete } from 'react-icons/ai';
import { BiBlock } from 'react-icons/bi';
import { FaEllipsisVertical } from 'react-icons/fa6';
import debounce from 'lodash.debounce';

interface Props {
  registerData: object[];
  registerColumns: ColumnDef<object, any>[];
  title: string;
  editComponent: React.FunctionComponent;
  delAction?: 'disable' | 'delete';
}

export default function RegisterPage({
  registerData,
  registerColumns,
  title,
  editComponent,
  delAction = 'delete',
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchInput, setSearchInput] = useState('');
  const [filtering, setFiltering] = useState('');

  const columns = useMemo<ColumnDef<object, any>[]>(
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
      ...registerColumns,
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row, cell, table }) => {
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
                  onClick={() => console.info('VIZUALIZA', cellData)}
                >
                  Visualizar
                </MenuItem>
                <MenuItem
                  fontFamily="button"
                  fontWeight="500"
                  fontSize="12px"
                  color="text.standard"
                  icon={<EditIcon />}
                  onClick={() => console.info('EDITAR', cellData)}
                >
                  Editar
                </MenuItem>
                <MenuItem
                  fontFamily="button"
                  fontWeight="500"
                  fontSize="12px"
                  color="text.standard"
                  icon={
                    delAction === 'delete' ? <AiOutlineDelete /> : <BiBlock />
                  }
                  onClick={() => console.info('DELETAR', cellData)}
                >
                  {delAction === 'delete' ? 'Excluir' : 'Desativar'}
                </MenuItem>
              </MenuList>
            </Menu>
          );
        },
      },
    ],
    [],
  );

  const searchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value: nextValue } = event.target;
    setSearchInput(nextValue);
    const debouncedSave = debounce(() => setFiltering(nextValue), 1000);
    debouncedSave();
  };

  const table = useReactTable({
    columns,
    data: registerData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: filtering,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
  });

  return (
    <Flex
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      padding={2}
      bg="whiteAlpha.500"
    >
      <Flex
        borderBottom="5px solid"
        borderColor="brandPrimary.500"
        alignItems="left"
        justifyContent="center"
        bg="backgroundLight"
        flexDirection="column"
        boxShadow="lg"
        padding={2}
        width="100%"
      >
        <Heading
          mt="auto"
          mb="auto"
          ml={4}
          color="brandPrimary.500"
          fontFamily="heading"
          fontSize={20}
        >
          {title}
        </Heading>
      </Flex>
      <Flex
        borderBottom="5px solid"
        borderColor="contrast.500"
        alignItems="left"
        justifyContent="flex-start"
        bg="whiteAlpha.600"
        flexDirection="column"
        boxShadow="lg"
        padding={2}
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
          <InputGroup size="md" maxWidth="40%">
            <InputLeftElement
              pointerEvents="none"
              children={<Search2Icon color="gray.600" />}
            />
            <Input
              type="text"
              placeholder="Buscar..."
              border="1px solid"
              borderColor="brandPrimary.500"
              borderRadius={0}
              value={searchInput}
              onChange={searchChange}
            />
            {/* <InputRightAddon p={0} border="none">
              <Button variant="primary">Buscar</Button>
            </InputRightAddon> */}
          </InputGroup>
          <Button leftIcon={<AddIcon />} variant="secondary" width={28}>
            Incluir
          </Button>
          <Button
            leftIcon={<PiExportBold size={20} />}
            variant="secondaryOutline"
            width={28}
            onClick={() =>
              console.info(
                'table.getSelectedRowModel().flatRows',
                table.getSelectedRowModel().flatRows,
              )
            }
          >
            Exportar
          </Button>
          <Button
            leftIcon={
              delAction === 'delete' ? (
                <AiOutlineDelete size={18} />
              ) : (
                <BiBlock size={18} />
              )
            } //BiBlock
            variant="delete"
            width={28}
          >
            {delAction === 'delete' ? 'Excluir' : 'Desativar'}
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
          <Table size="sm" variant="registry" maxWidth="100%">
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

                        <chakra.span pl="4">
                          {header.column.getIsSorted() ? (
                            header.column.getIsSorted() === 'desc' ? (
                              <TriangleDownIcon aria-label="Ordenação decrescente" />
                            ) : (
                              <TriangleUpIcon aria-label="Ordenação crescente" />
                            )
                          ) : null}
                        </chakra.span>
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
                  {row.getVisibleCells().map((cell) => {
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
                  })}
                </Tr>
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
    </Flex>
  );
}
