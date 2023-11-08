import RegisterPage from '@/components/RegisterPage';
import disableBulkSimplesNacConfig from '@/components/registers/simplesNacConfig/disableBulkSimplesNacConfig';
import { simplesNacConfigTableColumns } from '@/components/registers/simplesNacConfig/registerFields';
import SimplesNacConfigForm from '@/components/registers/simplesNacConfig/simplesNacConfigForm';
import fetchApp from '@/lib/fetchApp';
import { tSimplesNacConfig } from '@/types/SimplesNacConfig/tSimplesNacConfig';
import { headers } from 'next/headers';
const getRegistryList = async (): Promise<tSimplesNacConfig[]> => {
  try {
    const returnedData = await fetchApp({
      endpoint: `/api/internal/simplesnacconfig?orderBy=cnae&tableList=true`,
      cache: 'no-store',
      rscHeaders: headers(),
    });
    return returnedData.body;
  } catch (error) {
    console.error(`${error}`);
    throw error;
  }
};

export default async function simplesnacconfig() {
  const registryList = await getRegistryList();

  return (
    <>
      <RegisterPage
        title="CONFIG SIMPLES NACIONAL"
        registerData={registryList}
        registerColumns={simplesNacConfigTableColumns}
        delAction="disable"
        FormComponent={SimplesNacConfigForm}
        deleteBulkFunction={disableBulkSimplesNacConfig}
      />
    </>
  );
}
