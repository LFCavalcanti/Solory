import RegisterPage from '@/components/RegisterPage';
import fetchApp from '@/lib/fetchApp';
import { companyTableColumns } from './registerFields';
import CompanyForm from './companyform';
import disableBulkCompany from './disableBulkCompany';
import { headers } from 'next/headers';
import { tCompany } from '@/types/Company/tCompany';

const getCompanies = async (): Promise<tCompany[]> => {
  try {
    const companyGroups = await fetchApp({
      endpoint: `/api/internal/companies?orderBy=name&tableList=true`,
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
  const companies = await getCompanies();

  return (
    <>
      <RegisterPage
        title="EMPRESAS"
        registerData={companies}
        registerColumns={companyTableColumns}
        delAction="disable"
        FormComponent={CompanyForm}
        deleteBulkFunction={disableBulkCompany}
      />
    </>
  );
}
