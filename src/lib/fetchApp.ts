import getNextBaseUrl from './getNextBaseUrl';

interface Props {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  baseUrl?: string;
  endpoint: string;
  body?: any;
  Authorization?: string;
  revalidate?: number;
  cache?: 'no-store';
}

export default async function fetchApp({
  method = 'GET',
  baseUrl = getNextBaseUrl(),
  endpoint,
  body = {},
  Authorization,
  revalidate,
  cache,
}: Props) {
  const response = await fetch(baseUrl + endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(Authorization && { Authorization }),
    },
    body,
    ...(cache && { cache }),
    ...(revalidate && { next: { revalidate } }),
  });
  return { status: response.status, body: await response.json() };
}
