import { Request, Response, NextFunction } from "express";
import jwt, { JwtHeader, SigningKeyCallback } from "jsonwebtoken";
import jwksClient, { SigningKey } from "jwks-rsa";

const region = process.env.AWS_REGION ?? "us-east-1";
const userPoolId = process.env.COGNITO_USER_POOL_ID!;

const client = jwksClient({
  jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
});

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid!, (err: Error | null, key?: SigningKey) => {
    if (err) return callback(err);
    callback(null, key?.getPublicKey());
  });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];

  // Cognito access tokens have no `aud` claim — validate issuer only
  jwt.verify(token, getKey, {
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token", error: err.message });
    }
    const payload = decoded as jwt.JwtPayload;
    req.headers["x-user-id"] = payload.sub;
    req.headers["x-user-roles"] = ((payload["cognito:groups"] as string[]) ?? []).join(",");
    next();
  });
}
