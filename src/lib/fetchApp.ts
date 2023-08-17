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
}: Props) {
  const response = await fetch(baseUrl + endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(Authorization && { Authorization }),
      ...(authCookie && { Cookie: authCookie }),
    },
    ...(body && { body }),
    ...(cache && { cache }),
    ...(revalidate && { next: { revalidate } }),
  });
  return { status: response.status, body: await response.json() };
}
