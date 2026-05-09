import serverlessHttp from 'serverless-http';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';

import { app } from './index';

const serverlessApp = serverlessHttp(app, { requestId: 'x-request-id' });

export const handler = async (event: APIGatewayProxyEventV2, context: Context) => {
  // Reuse DB connections across warm Lambda invocations
  context.callbackWaitsForEmptyEventLoop = false;
  return serverlessApp(event, context);
};
