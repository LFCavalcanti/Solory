import RegisterPage from '@/components/RegisterPage';
import fetchApp from '@/lib/fetchApp';
import { tBusinessRole } from '@/types/BusinessRole/tBusinessRole';
import { headers } from 'next/headers';
import { businessRoleTableColumns } from './registerFields';
import BusinessRoleForm from './components/businessRoleForm';

const getBusinessRoles = async (): Promise<tBusinessRole[]> => {
  try {
    const returnedData = await fetchApp({
      endpoint: `/api/internal/businessroles?orderBy=name&tableList=true`,
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
  const businessRoles = await getBusinessRoles();

  return (
    <>
      <RegisterPage
        title="PAPÉIS DE NEGÓCIO"
        registerData={businessRoles}
        registerColumns={businessRoleTableColumns}
        delAction="disable"
        FormComponent={BusinessRoleForm}
        registryApiEndpoint="/api/internal/businessroles"
      />
    </>
  );
}
