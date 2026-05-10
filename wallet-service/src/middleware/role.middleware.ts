import { Request, Response, NextFunction } from "express";

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = (req.headers["x-user-roles"] as string || "").split(",").filter(Boolean);
    if (roles.some(r => userRoles.includes(r))) return next();
    return res.status(403).json({ message: "Forbidden: insufficient permissions" });
  };
}

export function requireInternalKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-internal-key"] as string;
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected || key !== expected) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}
