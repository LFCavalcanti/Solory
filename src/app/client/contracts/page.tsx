import RegisterPage from '@/components/RegisterPage';
import fetchApp from '@/lib/fetchApp';
import { headers } from 'next/headers';
import { contractTableColumns } from '@/app/client/contracts/registerFields';
import ContractForm from '@/app/client/contracts/components/contractform';
import disableBulkContract from '@/app/client/contracts/disableBulkContract';
import { tContract } from '@/types/Contract/tContract';

const getContracts = async (): Promise<tContract[]> => {
  try {
    const returnedData = await fetchApp({
      endpoint: `/api/internal/contracts?orderBy=description&tableList=true`,
      cache: 'no-store',
      rscHeaders: headers(),
    });
    return returnedData.body;
  } catch (error) {
    console.error(`${error}`);
    throw error;
  }
};

export default async function Contracts() {
  const contracts = await getContracts();

  return (
    <>
      <RegisterPage
        title="CONTRATOS"
        registerData={contracts}
        registerColumns={contractTableColumns}
        delAction="disable"
        FormComponent={ContractForm}
        deleteBulkFunction={disableBulkContract}
      />
    </>
  );
}
