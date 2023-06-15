import { SignJWT } from 'jose';
import getJwtEmailSecretKey from './getJwtEmailSecretKey';

export default async function signEmailVerificationToken(
  userData: string,
  IssueDate: number,
) {
  try {
    const accessToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(userData)
      .setIssuedAt(IssueDate)
      .setExpirationTime('5m')
      .sign(new TextEncoder().encode(getJwtEmailSecretKey()));
    return accessToken;
  } catch (error) {
    console.error(error);
    throw new Error('It was not possible to generate an Acess Token');
  }
}
