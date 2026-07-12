import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const QUEUE_URL = process.env.SQS_QUEUE_URL;
// A standard SQS queue only delivers a given message to one consumer, so
// notification-service and credit-service each need their own queue —
// this dual-publishes the same event rather than introducing an SNS fan-out.
const CREDIT_EVENTS_QUEUE_URL = process.env.CREDIT_EVENTS_QUEUE_URL;

export async function publishTransactionCompleted(event: {
  txId: string;
  senderId: string;
  receiverId: string;
  amount: string;
  currency: string;
  /** Transaction type (P2P_TRANSFER/RECHARGE/PAYMENT_QR/REVERSAL) — distinct from the envelope's own "type" below. */
  transactionType: string;
}) {
  const messageBody = JSON.stringify({
    type: "TRANSACTION_COMPLETED",
    ...event,
  });

  if (!QUEUE_URL) {
    console.warn("[SQS] SQS_QUEUE_URL not set — skipping notification publish");
  } else {
    await sqs.send(new SendMessageCommand({ QueueUrl: QUEUE_URL, MessageBody: messageBody }));
    console.log(`[SQS] Published TRANSACTION_COMPLETED for txId=${event.txId}`);
  }

  if (!CREDIT_EVENTS_QUEUE_URL) {
    console.warn("[SQS] CREDIT_EVENTS_QUEUE_URL not set — skipping credit-service event publish");
  } else {
    await sqs.send(new SendMessageCommand({ QueueUrl: CREDIT_EVENTS_QUEUE_URL, MessageBody: messageBody }));
    console.log(`[SQS] Published TRANSACTION_COMPLETED (credit-events) for txId=${event.txId}`);
  }
}
