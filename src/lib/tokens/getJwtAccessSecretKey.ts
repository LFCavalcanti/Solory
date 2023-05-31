export default function getJwtAcessSecretKey() {
  const secret = process.env.ACCESS_SECRET_KEY;
  if (!secret || secret.length === 0) {
    throw new Error('Environment variable ACCESS_SECRET_KEY is not set.');
  }
  return secret;
}
