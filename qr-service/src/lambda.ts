import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import type { Context } from "aws-lambda";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let serverlessApp: ((event: any, context: any) => Promise<any>) | null = null;

// Runs once at Lambda cold start: fetch DB credentials, run migration, init app.
// Dynamic imports ensure the pg Pool is created after env vars are populated.
const bootstrapPromise = (async () => {
  if (process.env.DB_SECRET_ARN) {
    const sm = new SecretsManagerClient({ region: process.env.AWS_REGION ?? "us-east-1" });
    const res = await sm.send(new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_ARN }));
    const secret = JSON.parse(res.SecretString!);
    process.env.DB_USER = secret.username;
    process.env.DB_PASSWORD = secret.password;
  }

  const { runMigration } = await import("./db/migrate");
  await runMigration();

  const serverlessHttp = (await import("serverless-http")).default;
  const { app } = await import("./index");
  serverlessApp = serverlessHttp(app, { requestId: "x-request-id" });
})();

export const handler = async (event: any, context: Context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await bootstrapPromise;
  return serverlessApp!(event, context);
};
