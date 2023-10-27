import RegisterPage from '@/components/RegisterPage';
import fetchApp from '@/lib/fetchApp';
import { headers } from 'next/headers';
import { tSupplier } from '@/types/Supplier/tSupplier';
import disableBulkSupplier from '@/components/registers/supplier/disableBulkSupplier';
import { supplierTableColumns } from '@/components/registers/supplier/registerFields';
import SupplierForm from '@/components/registers/supplier/supplierform';

const getSuppliers = async (): Promise<tSupplier[]> => {
  try {
    const returnedData = await fetchApp({
      endpoint: `/api/internal/suppliers?orderBy=name&tableList=true`,
      cache: 'no-store',
      rscHeaders: headers(),
    });
    return returnedData.body;
  } catch (error) {
    console.error(`${error}`);
    throw error;
  }
};

export default async function suppliers() {
  const suppliers = await getSuppliers();

  return (
    <>
      <RegisterPage
        title="FORNECEDORES"
        registerData={suppliers}
        registerColumns={supplierTableColumns}
        delAction="disable"
        FormComponent={SupplierForm}
        deleteBulkFunction={disableBulkSupplier}
      />
    </>
  );
}
