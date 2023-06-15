export default function getJwtEmailSecretKey() {
  const secret = process.env.EMAIL_VERIFY_SECRET;
  if (!secret || secret.length === 0) {
    throw new Error('Environment variable EMAIL_VERIFY_SECRET is not set.');
  }
  return secret;
}
