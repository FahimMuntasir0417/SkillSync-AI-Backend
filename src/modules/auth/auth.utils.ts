import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import type { JwtPayload } from "@/modules/auth/auth.interface.js";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, SALT_ROUNDS);

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => bcrypt.compare(password, hashedPassword);

export const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: string,
): string =>
  jwt.sign(payload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });

export const verifyToken = (token: string, secret: string): JwtPayload => {
  const decoded = jwt.verify(token, secret);

  if (
    typeof decoded !== "object" ||
    !("userId" in decoded) ||
    !("email" in decoded) ||
    !("role" in decoded)
  ) {
    throw new jwt.JsonWebTokenError("Invalid token payload");
  }

  return {
    userId: String(decoded.userId),
    email: String(decoded.email),
    role: decoded.role as JwtPayload["role"],
  };
};
