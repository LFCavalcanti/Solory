export type iMenuItem = {
  key: string;
  label: string;
  destination: string;
};

export type iCompanyMenu = {
  key: string;
  label: string;
  companyId: string;
};

export const companyMenu: iMenuItem[] = [
  {
    key: 'companyGroups',
    label: 'Grupo de Empresas',
    destination: '/client/companygroups',
  },
  {
    key: 'companies',
    label: 'Empresas',
    destination: '/client/companies',
  },
  {
    key: 'produtos',
    label: 'Produtos',
    destination: '/client/products',
  },
  {
    key: 'contractTypes',
    label: 'Tipos de Contratos',
    destination: '/client/contracttypes',
  },
];

export const customerMenu: iMenuItem[] = [
  {
    key: 'customers',
    label: 'Clientes',
    destination: '/client/customers',
  },
  {
    key: 'customerContacts',
    label: 'Contatos',
    destination: '/client/customercontacts',
  },
  {
    key: 'projects',
    label: 'Projetos',
    destination: '/client/projects',
  },
  {
    key: 'contracts',
    label: 'Contratos',
    destination: '/client/contracts',
  },
];

export const financeMenu: iMenuItem[] = [
  {
    key: 'billing',
    label: 'Faturamento',
    destination: '/client/billing',
  },
  {
    key: 'revenue',
    label: 'Receita',
    destination: '/client/revenue',
  },
  {
    key: 'expenses',
    label: 'Despesas',
    destination: '/client/expenses',
  },
  {
    key: 'cashFlow',
    label: 'Fluxo de Caixa',
    destination: '/client/cashflow',
  },
];

export const operationMenu: iMenuItem[] = [
  {
    key: 'serviceOrder',
    label: 'Ordem de Serviço',
    destination: '/client/serviceorders',
  },
  {
    key: 'projectExecution',
    label: 'Execução de Projeto',
    destination: '/client/projectexecution',
  },
];
