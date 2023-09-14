import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import getNextBaseUrl from './getNextBaseUrl';

interface Props {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  baseUrl?: string;
  endpoint: string;
  body?: any;
  Authorization?: string;
  revalidate?: number;
  cache?: 'no-store';
  authCookie?: string | null;
  rscHeaders?: ReadonlyHeaders;
}

export default async function fetchApp({
  method = 'GET',
  baseUrl = getNextBaseUrl(),
  endpoint,
  body = null,
  Authorization,
  revalidate,
  cache,
  authCookie = undefined,
  rscHeaders = undefined,
}: Props) {
  const response = await fetch(baseUrl + endpoint, {
    method,
    ...(rscHeaders && { headers: rscHeaders }),
    ...(!rscHeaders && {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(Authorization && { Authorization }),
        ...(authCookie && { Cookie: authCookie }),
      },
    }),
    ...(body && { body }),
    ...(cache && { cache }),
    ...(revalidate && { next: { revalidate } }),
  });
  return { status: response.status, body: await response.json() };
}
