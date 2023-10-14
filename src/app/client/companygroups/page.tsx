import RegisterPage from '@/components/RegisterPage';
import fetchApp from '@/lib/fetchApp';
import { tCompanyGroup } from '@/types/CompanyGroup/tCompanyGroup';
import { companyGroupTableColumns } from '@/components/registers/companyGroup/registerFields';
import CompanyGroupForm from '@/components/registers/companyGroup/companygroupform';
import disableBulkCompanyGroup from '@/components/registers/companyGroup/disableBulkCompanyGroup';
import { headers } from 'next/headers';

const getCompanyGroups = async (): Promise<tCompanyGroup[]> => {
  try {
    const companyGroups = await fetchApp({
      endpoint: `/api/internal/companygroups?orderBy=name&tableList=true`,
      cache: 'no-store',
      rscHeaders: headers(),
    });
    return companyGroups.body;
  } catch (error) {
    console.error(`${error}`);
    throw error;
  }
};

export default async function companygroup() {
  const companyGroups = await getCompanyGroups();

  return (
    <>
      <RegisterPage
        title="GRUPOS DE EMPRESAS"
        registerData={companyGroups}
        registerColumns={companyGroupTableColumns}
        delAction="disable"
        FormComponent={CompanyGroupForm}
        deleteBulkFunction={disableBulkCompanyGroup}
      />
    </>
  );
}
