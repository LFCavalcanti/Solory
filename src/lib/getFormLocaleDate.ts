export default function getFormLocaleDate(dateParam: Date | string) {
  if (!dateParam) return undefined;
  const convertedDate = new Date(dateParam);
  const year = convertedDate.toLocaleString('default', { year: 'numeric' });
  const month = convertedDate.toLocaleString('default', {
    month: '2-digit',
  });
  const day = convertedDate.toLocaleString('default', { day: '2-digit' });

  return [year, month, day].join('-');
}
