import { tSelectMenuOption } from '@/types/tSelectMenuOption';

export default function getSelectLabel(
  value: string,
  options: tSelectMenuOption[],
) {
  const lenOptions = options.length;
  for (let idx = 0; idx < lenOptions; idx++) {
    if (options[idx].value === value) {
      return options[idx].label;
    }
  }
  return '-';
}
