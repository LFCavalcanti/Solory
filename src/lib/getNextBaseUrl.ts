export default function getNextBaseUrl() {
  const secret = process.env.NEXT_BASE_URL;
  if (!secret || secret.length === 0) {
    throw new Error('Environment variable NEXT_BASE_URL is not set.');
  }
  return secret;
}
