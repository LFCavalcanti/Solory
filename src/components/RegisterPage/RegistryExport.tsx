'use client';
import { useRegistryExportStore } from '@/lib/hooks/state/useRegistryExportStore';
import {
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRef } from 'react';
import { PiFileCsvDuotone, PiFilePdfDuotone } from 'react-icons/pi';
import { useReactToPrint } from 'react-to-print';
import { CSVLink } from 'react-csv';
import type { Headers } from 'react-csv/components/CommonPropTypes';

export default function RegistryExport({
  exportTitle,
}: {
  exportTitle: string;
}) {
  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const [isOpen, closeModal, rowsData, columnsDef] = useRegistryExportStore(
    (state) => [
      state.isOpen,
      state.closeModal,
      state.rowsData,
      state.columnsDef,
    ],
  );

  const table = useReactTable({
    columns: columnsDef,
    data: rowsData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const csvData = table.getRowModel().rows.map((row) => {
    const newRowData: any = {};
    row.getVisibleCells().forEach((cell) => {
      const cellContext = cell.getContext();
      const column = cellContext.column.id;
      const cellData: any =
        cell.column.columnDef.cell &&
        typeof cell.column.columnDef.cell === 'function'
          ? cell.column.columnDef.cell(cellContext)
          : 'ERROR';
      newRowData[column] = cellData;
    });
    return newRowData;
  });

  const csvColumns: Headers = table.getAllFlatColumns().map((column) => {
    return {
      label: String(column.columnDef.header),
      key: String(column.id),
    };
  });

  return (
    <div>
      <Modal
        closeOnOverlayClick={false}
        blockScrollOnMount={true}
        scrollBehavior={'inside'}
        isOpen={isOpen}
        onClose={closeModal}
        motionPreset="slideInRight"
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          borderRadius="0"
          maxHeight="calc(100vh - 50px)"
          maxWidth="calc(100vw - 50px)"
          height="fit-content"
        >
          <ModalCloseButton padding={2} mr={2} />
          <ModalBody padding={2}>
            <Flex gap={2}>
              <Button
                rightIcon={<PiFilePdfDuotone size={26} />}
                variant="primary"
                onClick={handlePrint}
              >
                Imprimir
              </Button>

              <CSVLink
                data={csvData}
                headers={csvColumns}
                separator={';'}
                filename={`${exportTitle}.csv`}
              >
                <Button
                  rightIcon={<PiFileCsvDuotone size={26} />}
                  variant="secondaryOutline"
                >
                  Exportar
                </Button>
              </CSVLink>
            </Flex>
            <Flex
              alignItems="left"
              justifyContent="flexStart"
              flexDirection="column"
              padding={4}
              gap={2}
              ref={componentRef}
            >
              <Heading
                mt="auto"
                mb="auto"
                color="brandPrimary.500"
                fontFamily="heading"
                fontSize={20}
              >{`${exportTitle} - EXPORTAR/IMPRIMIR`}</Heading>
              <Table size="sm" variant="registryExport" maxWidth="100%" mt={4}>
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
                    <Tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        // see https://tanstack.com/table/v8/docs/api/core/column-def#meta to type this correctly
                        const meta: any = cell.column.columnDef.meta;
                        const rowData: any = row.original;
                        return (
                          <Td
                            key={cell.id}
                            isNumeric={meta?.isNumeric}
                            // color={
                            //   rowData.isActive ? 'text.standard' : 'gray.400'
                            // }
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
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
