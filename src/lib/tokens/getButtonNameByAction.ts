import { tRegistryAction } from '@/types/tRegistryAction';
import { tProjectAction, tProjectFormAction } from '@/types/tProjectAction';

export default function getButtonNameByAction(
  action: tRegistryAction | tProjectFormAction | tProjectAction,
) {
  if (action === 'insert') return `INCLUIR`;
  if (action === 'review') return `REVISAR`;
  if (action === 'view') return `FECHAR`;
  if (action === 'edit') return `SALVAR`;
  if (action === 'delete') return `DESATIVAR`;
  if (action === 'exclude') return `EXCLUIR`;
  if (action === 'approve') return `APROVAR`;
  if (action === 'refuse') return `RECUSAR`;
  if (action === 'close') return `CONCLUIR`;
  if (action === 'cancel') return `CANCELAR`;
  return `AÇÃO DESCONHECIDA`;
}
