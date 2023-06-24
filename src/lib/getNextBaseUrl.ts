export default function getNextBaseUrl() {
  const baseUrl = process.env.NEXT_BASE_URL;
  if (!baseUrl || baseUrl.length === 0) {
    throw new Error('Environment variable NEXT_BASE_URL is not set. TEST');
  }
  return baseUrl;
}
