'use client';
import fetchApp from '@/lib/fetchApp';
import { tCompanyGroupTableRow } from '@/types/CompanyGroup/tCompanyGroup';

export default async function disableBulkCompanyGroup(
  companyGroups: tCompanyGroupTableRow[],
) {
  if (!companyGroups)
    return { result: false, errorMessagePile: ['Dados inválidos'] };

  return Promise.allSettled(
    companyGroups.map((item) => {
      return fetchApp({
        method: 'PUT',
        baseUrl: window.location.origin,
        endpoint: `/api/internal/companygroups/${item.id}`,
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
