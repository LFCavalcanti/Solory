import { jwtVerify } from 'jose';
import getJwtEmailSecretKey from './getJwtEmailSecretKey';

interface AccessJwtPayload {
  jti: string;
  iat: number;
}

export default async function verifyEmailVerificationToken(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtEmailSecretKey()),
    );
    return verified.payload as AccessJwtPayload;
  } catch (error) {
    throw new Error('Your token is invalid or has expired.');
  }
}
