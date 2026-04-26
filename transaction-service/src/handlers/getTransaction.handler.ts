import {
  GetTransactionOperationServerInput,
  GetTransactionOperationServerOutput,
} from "@yapepay/service-ssdk";

export async function getTransactionHandler(
  input: GetTransactionOperationServerInput,
  userId: string
): Promise<GetTransactionOperationServerOutput> {
  console.log(`[getTransaction] userId=${userId} txId=${input.txId}`);

  // TODO: buscar en PostgreSQL, verificar que userId sea sender o receiver
  return {
    transaction: {
      txId: input.txId,
      senderId: userId,
      receiverId: "placeholder",
      amount: "0.00",
      currency: "BOB",
      type: "P2P_TRANSFER",
      status: "COMPLETED",
      createdAt: new Date(),
    },
  };
}