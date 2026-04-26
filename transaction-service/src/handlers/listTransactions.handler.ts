import {
  ListTransactionsOperationServerInput,
  ListTransactionsOperationServerOutput,
} from "@yapepay/service-ssdk";

export async function listTransactionsHandler(
  input: ListTransactionsOperationServerInput,
  userId: string
): Promise<ListTransactionsOperationServerOutput> {
  console.log(`[listTransactions] userId=${userId}`, input);

  return {
    transactions: [],
    nextCursor: undefined,
    total: 0,
  };
}