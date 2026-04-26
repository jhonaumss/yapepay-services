import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({
  endpoint: process.env.SQS_ENDPOINT || "http://localhost:9324",
  region: process.env.SQS_REGION || "us-east-1",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

const QUEUE_URL = process.env.SQS_QUEUE_URL ||
  "http://localhost:9324/000000000000/yapepay-transactions";

export async function publishTransactionCompleted(event: {
  txId: string;
  senderId: string;
  receiverId: string;
  amount: string;
  currency: string;
}) {
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