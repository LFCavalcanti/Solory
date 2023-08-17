import { cookies } from 'next/headers';
export default function getApiAuthToken() {
  const authCookie = cookies().get('next-auth.session-token');
  if (authCookie) {
    return `${authCookie.name}=${authCookie.value}`;
  }
  return null;
}
