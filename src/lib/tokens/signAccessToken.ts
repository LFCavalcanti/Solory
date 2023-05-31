import { SignJWT } from 'jose';
import getJwtAccessSecretKey from './getJwtAccessSecretKey';

export default async function signAccessToken(userData: string) {
  try {
    const accessToken = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(userData)
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(getJwtAccessSecretKey()));
    return accessToken;
  } catch (error) {
    console.error(error);
    return new Error('It was not possible to generate an Acess Token');
  }
}
