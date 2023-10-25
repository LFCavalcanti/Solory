import RegisterPage from '@/components/RegisterPage';
import fetchApp from '@/lib/fetchApp';
import { headers } from 'next/headers';
import { tProduct } from '@/types/Product/tProduct';
import { productTableColumns } from '@/components/registers/product/registerFields';
import disableBulkProduct from '@/components/registers/product/disableBulkProduct';
import ProductForm from '@/components/registers/product/productform';

const getProducts = async (): Promise<tProduct[]> => {
  try {
    const companyGroups = await fetchApp({
      endpoint: `/api/internal/products?orderBy=name&tableList=true`,
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
  const products = await getProducts();

  return (
    <>
      <RegisterPage
        title="GRUPOS DE EMPRESAS"
        registerData={products}
        registerColumns={productTableColumns}
        delAction="disable"
        FormComponent={ProductForm}
        deleteBulkFunction={disableBulkProduct}
      />
    </>
  );
}
