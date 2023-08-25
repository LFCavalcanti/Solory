export default function TableLocaleDate(date: Date | string) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
}
