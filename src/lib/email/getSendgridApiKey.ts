export default function getSendgridApiKey() {
  const secret = process.env.SENDGRID_API_KEY;
  if (!secret || secret.length === 0) {
    throw new Error('Environment variable SENDGRID_API_KEY is not set.');
  }
  return secret;
}
