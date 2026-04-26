interface TransactionEvent {
  type: "TRANSACTION_COMPLETED";
  txId: string;
  senderId: string;
  receiverId: string;
  amount: string;
  currency: string;
}

export async function handleTransactionEvent(event: TransactionEvent) {
  console.log(`[notification-service] Processing event: ${event.type}`);

  switch (event.type) {
    case "TRANSACTION_COMPLETED":
      await notifyTransactionCompleted(event);
      break;
    default:
      console.log(`Unknown event type: ${event.type}`);
  }
}

async function notifyTransactionCompleted(event: TransactionEvent) {
  // TODO: integrar Firebase Admin SDK para push real
  // Por ahora logueamos la notificación
  console.log(`[PUSH] → sender ${event.senderId}: Transferiste ${event.currency} ${event.amount}`);
  console.log(`[PUSH] → receiver ${event.receiverId}: Recibiste ${event.currency} ${event.amount}`);
}