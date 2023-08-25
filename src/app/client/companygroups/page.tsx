import RegisterPage from '@/components/RegisterPage';
import fetchApp from '@/lib/fetchApp';
import getApiAuthToken from '@/lib/getApiAuthToken';
import { tCompanyGroup } from '@/types/CompanyGroup/tCompanyGroup';
import {
  companyGroupRegisterFields,
  companyGroupTableColumns,
} from './registerFields';
import companyGroupForm from './companyGroupForm';

const getCompanyGroups = async (): Promise<tCompanyGroup[]> => {
  try {
    const companyGroups = await fetchApp({
      endpoint: `/api/internal/companygroups?orderBy=name`,
      cache: 'no-store',
      authCookie: getApiAuthToken(),
    });
    return companyGroups.body;
  } catch (error) {
    console.error(error);
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
        editComponent={companyGroupForm}
        delAction="disable"
      />
    </>
  );
}
