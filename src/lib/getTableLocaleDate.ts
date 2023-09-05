export default function getTableLocaleDate(date: Date | string) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
}
