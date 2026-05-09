import { SQSBatchResponse, SQSEvent, SQSRecord, Context } from 'aws-lambda';

import { handleTransactionEvent } from './handlers/notification.handler';

export const handler = async (
  event: SQSEvent,
  context: Context,
): Promise<SQSBatchResponse> => {
  // Reuse connections across warm Lambda invocations
  context.callbackWaitsForEmptyEventLoop = false;

  const batchItemFailures: { itemIdentifier: string }[] = [];

  await Promise.allSettled(
    event.Records.map(async (record: SQSRecord) => {
      try {
        const body = JSON.parse(record.body);
        await handleTransactionEvent(body);
      } catch (error) {
        console.error(`Error procesando mensaje ${record.messageId}:`, error);
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }),
  );

  return { batchItemFailures };
};
