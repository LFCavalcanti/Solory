'use client';
import fetchApp from '@/lib/fetchApp';
import { tRegistryToDelete } from '@/types/tRegistryToDelete';

export default async function bulkBlockUnblockProject(
  registryList: tRegistryToDelete[],
  action: 'block' | 'unblock',
) {
  if (!registryList)
    return { result: false, errorMessagePile: ['Dados inválidos'] };

  const filteredList = registryList.filter((item) => {
    if (action === 'block' && item.isActive) return true;
    if (action === 'unblock' && !item.isActive) return true;
    return false;
  });

  const endpointAction = action === 'block' ? '/block' : '/unblock';

  return Promise.allSettled(
    filteredList.map((item) => {
      return fetchApp({
        method: 'POST',
        baseUrl: window.location.origin,
        endpoint: `/api/internal/projects/${item.id}${endpointAction}`,
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
          errorMessagePile.push('ITEM REJECTED');
        } else if (
          response.status === 'fulfilled' &&
          response.value.status !== 200
        ) {
          console.error(
            'ERROR CALLING PROJECT API ENDPOINT: ',
            response.value.status,
          );
          result = false;
          errorMessagePile.push(response.value.body.message);
        }
      });
      return { result, errorMessagePile };
    })
    .catch((error) => {
      console.error('ERROR: ', error);
      return { result: false, errorMessagePile: [error] };
    });
}
