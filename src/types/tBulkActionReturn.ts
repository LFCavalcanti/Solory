export type tBulkActionReturn = Promise<void | {
  result: boolean;
  errorMessagePile: any[];
}>;
