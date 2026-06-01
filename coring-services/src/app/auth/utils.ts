import { SystemRole } from './../user/entity/enum.js';
import bcrypt from "bcrypt";
import jwt, { type Secret } from "jsonwebtoken";
import { env } from "../../common/config/env.config.js";
export async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateToken(jsonPayload: {
    userId: number | bigint;
    SystemRole:SystemRole;
    email:string;
}): string {
  return jwt.sign(jsonPayload, env.auth.accessTokenSecret as Secret, {
    expiresIn: env.auth.accessTokenExpiration as string | number,
  });
}

export function generateRefreshToken(jsonPayload: {
    userId: number | bigint;
    SystemRole:SystemRole;
    email:string;
}): string {
  return jwt.sign(jsonPayload, env.auth.refreshTokenSecret as Secret, {
    expiresIn: env.auth.refreshTokenExpiration as string | number,
  });
}
