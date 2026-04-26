import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, getKey, {
    audience: process.env.KEYCLOAK_CLIENT_ID,
    issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
  }, (err, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token", error: err.message });
    }
    // Inyectar userId en header interno
    req.headers["x-user-id"] = decoded.sub;
    req.headers["x-user-roles"] = decoded.realm_access?.roles?.join(",") ?? "";
    next();
  });
}