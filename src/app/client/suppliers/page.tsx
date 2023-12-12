import RegisterPage from '@/components/RegisterPage';
import fetchApp from '@/lib/fetchApp';
import { headers } from 'next/headers';
import { tSupplier } from '@/types/Supplier/tSupplier';
import disableBulkSupplier from '@/app/client/suppliers/disableBulkSupplier';
import { supplierTableColumns } from '@/app/client/suppliers/registerFields';
import SupplierForm from '@/app/client/suppliers/components/supplierform';

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
