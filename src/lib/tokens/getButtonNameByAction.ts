import { tRegistryAction } from '@/types/tRegistryAction';

export default function getButtonNameByAction(action: tRegistryAction) {
  if (action === 'insert') return `INCLUIR`;
  if (action === 'view') return `FECHAR`;
  if (action === 'edit') return `SALVAR`;
  if (action === 'delete') return `DESATIVAR`;
  return `AÇÃO DESCONHECIDA`;
}
