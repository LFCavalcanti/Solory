import { z } from 'zod';

export default function ValidateBrContractData(
  contractData: any,
  ctx: z.RefinementCtx,
) {
  if (contractData.recurrence === 'INVOICE') {
    if (
      contractData.measureType === 'EVENTUAL' ||
      contractData.measureType === 'WEEKLY' ||
      contractData.measureType === 'MONTLY'
    ) {
      if (
        !(
          contractData.contractType === 'ON_DEMAND' ||
          contractData.contractType === 'PACKAGE'
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `TIPO DE CONTRATO inválido para a recorrência FATURA`,
          path: ['contractType'],
          fatal: true,
        });
        return;
      }
      return;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `TIPO DE MEDIÇÃO inválida para a recorrência FATURA`,
      path: ['measureType'],
      fatal: true,
    });
  } else if (contractData.recurrence === 'FIXED') {
    if (
      contractData.measureType === 'WEEKLY' ||
      contractData.measureType === 'MONTLY'
    ) {
      if (contractData.contractType !== 'PACKAGE') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `TIPO DE CONTRATO inválido para a recorrência FIXO`,
          path: ['contractType'],
          fatal: true,
        });
        return;
      }
      return;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `TIPO DE MEDIÇÃO inválida para a recorrência FIXO`,
      path: ['measureType'],
      fatal: true,
    });
  } else if (contractData.recurrence === 'ON_DEMAND') {
    if (contractData.measureType === 'EVENTUAL') {
      if (contractData.contractType !== 'ON_DEMAND') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `TIPO DE CONTRATO inválido para a recorrência SOB DEMANDA`,
          path: ['contractType'],
          fatal: true,
        });
        return;
      }
      return;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `TIPO DE MEDIÇÃO inválida para a recorrência SOB DEMANDA`,
      path: ['measureType'],
      fatal: true,
    });
  } else if (contractData.recurrence === 'NONE') {
    if (
      contractData.measureType === 'SCOPE' ||
      contractData.measureType === 'ONCE'
    ) {
      if (
        !(
          contractData.contractType === 'ON_DEMAND' ||
          contractData.contractType === 'PROJECT'
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `TIPO DE CONTRATO inválido para a recorrência NENHUMA`,
          path: ['contractType'],
          fatal: true,
        });
        return;
      }
      return;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `TIPO DE MEDIÇÃO inválida para a recorrência NENHUMA`,
      path: ['measureType'],
      fatal: true,
    });
  }
}
