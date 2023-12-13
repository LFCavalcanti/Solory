import RegisterPage from '@/components/RegisterPage';
import fetchApp from '@/lib/fetchApp';
import { headers } from 'next/headers';
import { tCustomer } from '@/types/Customer/tCustomer';
import { customerTableColumns } from '@/app/client/customers/registerFields';
import CustomerForm from '@/app/client/customers/components/customerform';

const getCustomers = async (): Promise<tCustomer[]> => {
  try {
    const returnedData = await fetchApp({
      endpoint: `/api/internal/customers?orderBy=name&tableList=true`,
      cache: 'no-store',
      rscHeaders: headers(),
    });
    return returnedData.body;
  } catch (error) {
    console.error(`${error}`);
    throw error;
  }
};

export default async function customers() {
  const customers = await getCustomers();

  return (
    <>
      <RegisterPage
        title="CLIENTES"
        registerData={customers}
        registerColumns={customerTableColumns}
        delAction="disable"
        FormComponent={CustomerForm}
        registryApiEndpoint="/api/internal/customers"
      />
    </>
  );
}
