import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import bcrypt from "bcrypt";

import { pool } from "../db/client";

type UserRole = 'regular_user' | 'cashier_user';

interface RegisterInput {
  phoneNumber: string;
  fullName: string;
  email?: string;
  pin: string;
  role?: UserRole;
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

async function createCognitoUser(
  fullName: string,
  email: string,
  pin: string,
  role: UserRole,
): Promise<string> {
  const userPoolId = process.env.COGNITO_USER_POOL_ID!;

  // Create the user — SUPPRESS skips the welcome/temp-password email
  const createResponse = await cognitoClient.send(
    new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email,
      MessageAction: "SUPPRESS",
      TemporaryPassword: pin,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: fullName },
        { Name: "email_verified", Value: "true" },
      ],
    }),
  );

  const userId = createResponse.User?.Attributes?.find(a => a.Name === "sub")?.Value;
  if (!userId) throw new Error("Failed to retrieve Cognito user sub");

  // Set a permanent password so the user is not stuck in FORCE_CHANGE_PASSWORD
  await cognitoClient.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: email,
      Password: pin,
      Permanent: true,
    }),
  );

  await cognitoClient.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: email,
      GroupName: role,
    }),
  );

  return userId;
}

export async function registerHandler(input: RegisterInput) {
  const { phoneNumber, fullName, email, pin, role = 'regular_user' } = input;
  const pinHash = await bcrypt.hash(pin, 12);
  const identifier = email ?? phoneNumber;

  const cognitoUserId = await createCognitoUser(fullName, identifier, pin, role);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT "userId" FROM usuario WHERE "phoneNumber" = $1`,
      [phoneNumber],
    );
    if (existing.rows.length > 0) throw new Error("Phone number already registered");

    const result = await client.query(
      `INSERT INTO usuario ("userId", "phoneNumber", "fullName", "email", "pinHash")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING "userId", "phoneNumber", "fullName", "email", "kycStatus", "createdAt"`,
      [cognitoUserId, phoneNumber, fullName, email ?? null, pinHash],
    );

    const user = result.rows[0];
    await client.query("COMMIT");

    // Call wallet-service through the shared ALB to create the initial wallet
    const walletUrl = process.env.WALLET_SERVICE_URL;
    if (walletUrl) {
      const walletRes = await fetch(`${walletUrl}/v1/billeteras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-key": process.env.INTERNAL_API_KEY ?? "",
        },
        body: JSON.stringify({ userId: user.userId }),
      });
      if (!walletRes.ok) {
        console.error(`wallet-service responded ${walletRes.status} for userId ${user.userId}`);
      } else {
        console.log(`wallet created for userId ${user.userId}`);
      }
    } else {
      console.warn("WALLET_SERVICE_URL not set — wallet not created");
    }

    return { user };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
