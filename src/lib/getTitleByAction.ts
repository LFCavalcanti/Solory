import { tRegistryAction } from '@/types/tRegistryAction';

export default function getTitleByAction(
  title: string,
  action: tRegistryAction,
) {
  if (action === 'insert') return `${title} - INCLUIR`;
  if (action === 'view') return `${title} - VIZUALIZAR`;
  if (action === 'edit') return `${title} - EDITAR`;
  if (action === 'delete') return `${title} - DESATIVAR/BLOQUEAR`;
  return `${title} - AÇÃO DESCONHECIDA`;
}
