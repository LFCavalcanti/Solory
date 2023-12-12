'use client';
import fetchApp from '@/lib/fetchApp';
import { tSupplierTableRow } from '@/types/Supplier/tSupplier';

export default async function disableBulkSupplier(
  suppliers: tSupplierTableRow[],
) {
  if (!suppliers)
    return { result: false, errorMessagePile: ['Dados inválidos'] };

  return Promise.allSettled(
    suppliers.map((item) => {
      return fetchApp({
        method: 'PUT',
        baseUrl: window.location.origin,
        endpoint: `/api/internal/suppliers/${item.id}`,
        body: JSON.stringify({ isActive: false }),
        cache: 'no-store',
      });
    }),
  )
    .then((apiResponses) => {
      const errorMessagePile: string[] = [];
      let result = true;
      apiResponses.forEach((response) => {
        if (response.status === 'rejected') {
          result = false;
          return;
        }

        if (response.status === 'fulfilled' && response.value.status !== 200) {
          result = false;
          errorMessagePile.push(response.value.body.message);
        }
      });
      return { result, errorMessagePile };
    })
    .catch((error) => {
      return { result: false, errorMessagePile: [error] };
    });
}
