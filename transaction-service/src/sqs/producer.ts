import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const QUEUE_URL = process.env.SQS_QUEUE_URL;

export async function publishTransactionCompleted(event: {
  txId: string;
  senderId: string;
  receiverId: string;
  amount: string;
  currency: string;
}) {
  if (!QUEUE_URL) {
    console.warn("[SQS] SQS_QUEUE_URL not set — skipping notification publish");
    return;
  }
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify({
        type: "TRANSACTION_COMPLETED",
        ...event,
      }),
    })
  );
  console.log(`[SQS] Published TRANSACTION_COMPLETED for txId=${event.txId}`);
}