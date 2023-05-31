import { UnsecuredJWT, jwtVerify } from 'jose';
import getJwtAccessSecretKey from './getJwtAccessSecretKey';

interface AccessJwtPayload {
  jti: string;
  iat: number;
}

export default async function verifyAccessToken(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtAccessSecretKey()),
    );
    return verified.payload as AccessJwtPayload;
  } catch (error) {
    throw new Error('Your token is invalid or has expired.');
  }
}
