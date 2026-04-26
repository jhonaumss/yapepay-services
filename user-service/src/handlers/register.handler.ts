import bcrypt from "bcrypt";
import { pool } from "../db/client";

interface RegisterInput {
  phoneNumber: string;
  fullName: string;
  email?: string;
  pin: string;
}

async function createKeycloakUser(
  fullName: string,
  email: string,
  password: string
): Promise<string> {
  // 1. Obtener admin token
  const tokenRes = await fetch(
    `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "password",
        client_id: "admin-cli",
        username: process.env.KEYCLOAK_ADMIN || "admin",
        password: process.env.KEYCLOAK_ADMIN_PASSWORD || "admin123",
      }),
    }
  );
  const tokenData = await tokenRes.json() as { access_token: string };
  const adminToken = tokenData.access_token;

  // 2. Crear usuario en Keycloak
  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");

  const createRes = await fetch(
    `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        username: email,
        email,
        firstName,
        lastName,
        enabled: true,
        credentials: [{ type: "password", value: password, temporary: false }],
        realmRoles: ["user"],
      }),
    }
  );

  if (!createRes.ok) {
    const err = await createRes.json()as { errorMessage: string };
    throw new Error(err.errorMessage || "Failed to create Keycloak user");
  }

  // 3. Obtener el sub (userId) del usuario creado
  const location = createRes.headers.get("location");
  const keycloakUserId = location!.split("/").pop()!;

  // 4. Asignar rol 'user'
  const rolesRes = await fetch(
    `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/roles/user`,
    {
      headers: { Authorization: `Bearer ${adminToken}` },
    }
  );
  const role = await rolesRes.json();

  await fetch(
    `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users/${keycloakUserId}/role-mappings/realm`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify([role]),
    }
  );

  return keycloakUserId;
}

export async function registerHandler(input: RegisterInput) {
  const { phoneNumber, fullName, email, pin } = input;
  const pinHash = await bcrypt.hash(pin, 12);

  // 1. Crear en Keycloak primero — obtener el sub
  const keycloakUserId = await createKeycloakUser(
    fullName,
    email ?? phoneNumber,
    pin
  );
  console.log("Created Keycloak user with ID:", keycloakUserId);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT "userId" FROM usuario WHERE "phoneNumber" = $1`,
      [phoneNumber]
    );
    if (existing.rows.length > 0) throw new Error("Phone number already registered");

    // 2. Insertar en BD usando el sub de Keycloak como userId
    const result = await client.query(
      `INSERT INTO usuario ("userId", "phoneNumber", "fullName", "email", "pinHash")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING "userId", "phoneNumber", "fullName", "email", "kycStatus", "createdAt"`,
      [keycloakUserId, phoneNumber, fullName, email ?? null, pinHash]
    );

    const user = result.rows[0];
    await client.query("COMMIT");

    // 3. Crear billetera en wallet-service
    await fetch(`http://localhost:3002/v1/billeteras`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.userId }),
    });

    return { user };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}