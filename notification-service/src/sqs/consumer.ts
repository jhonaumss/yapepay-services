import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

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

export async function startConsumer(
  handler: (message: any) => Promise<void>
) {
  console.log("Starting SQS consumer...");

  while (true) {
    try {
      const response = await sqs.send(
        new ReceiveMessageCommand({
          QueueUrl: QUEUE_URL,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20, // long polling
        })
      );

      if (response.Messages && response.Messages.length > 0) {
        for (const message of response.Messages) {
          try {
            const body = JSON.parse(message.Body!);
            await handler(body);

            // Eliminar mensaje procesado
            await sqs.send(
              new DeleteMessageCommand({
                QueueUrl: QUEUE_URL,
                ReceiptHandle: message.ReceiptHandle!,
              })
            );
          } catch (err) {
            console.error("Error processing message:", err);
          }
        }
      }
    } catch (err) {
      console.error("SQS error:", err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
}