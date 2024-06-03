import { tRegistryAction } from '@/types/tRegistryAction';
import { tProjectAction, tProjectFormAction } from '@/types/tProjectAction';

export default function getTitleByAction(
  title: string,
  action: tRegistryAction | tProjectFormAction | tProjectAction,
) {
  if (action === 'insert') return `${title} - INCLUIR`;
  if (action === 'view') return `${title} - VIZUALIZAR`;
  if (action === 'edit') return `${title} - EDITAR`;
  if (action === 'review') return `${title} - REVISAR`;
  if (action === 'delete') return `${title} - DESATIVAR/BLOQUEAR`;
  if (action === 'approve') return `${title} - APROVAR`;
  if (action === 'refuse') return `${title} - RECUSAR`;
  if (action === 'close') return `${title} - CONCLUIR`;
  if (action === 'cancel') return `${title} - CANCELAR`;
  return `${title} - AÇÃO DESCONHECIDA`;
}
