'use client';
import fetchApp from '@/lib/fetchApp';
import { tRegistryToDelete } from '@/types/tRegistryToDelete';

export default async function deleteBulkContract(
  registryList: tRegistryToDelete[],
  apiEndpoint: string,
) {
  if (!registryList)
    return { result: false, errorMessagePile: ['Dados inválidos'] };

  const filteredList = registryList.filter((item) => item.isActive);

  return Promise.allSettled(
    filteredList.map((item) => {
      return fetchApp({
        method: 'PUT',
        baseUrl: window.location.origin,
        endpoint: `${apiEndpoint}/${item.id}`,
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
