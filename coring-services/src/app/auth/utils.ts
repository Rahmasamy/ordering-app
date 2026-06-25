import { SystemRole } from './../user/entity/enum.js';
import bcrypt from "bcrypt";
import jwt, { type Secret } from "jsonwebtoken";
import { randomInt, createHash } from "crypto";
import type { Response } from 'express';
import { env } from '../../lib/config/env.config.js';
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
    restaurantRoleName?: string;
    restaurantId?: number;
    branchIds?: number[];
}): string {
  console.log(
  env.auth.accessTokenExpiration,
  typeof env.auth.accessTokenExpiration
);
  const token = jwt.sign(jsonPayload, env.auth.accessTokenSecret as Secret, {

    expiresIn: env.auth.accessTokenExpiration as any,
  });
  console.log(jwt.decode(token));
  return token;
}

export function generateRefreshToken(jsonPayload: {
    userId: number | bigint;
    SystemRole:SystemRole;
    email:string;
    restaurantRoleName?: string;
    restaurantId?: number;
    branchIds?: number[];
}): string {
  return jwt.sign(jsonPayload, env.auth.refreshTokenSecret as Secret, {
    expiresIn: env.auth.refreshTokenExpiration as any,
  });
}

export function generateOTP(length: number = 6): string {
  return randomInt(1000000, 9999999).toString()
}

export function hashOTP(otp: string): Promise<string> {
  return Promise.resolve(createHash("sha256").update(otp).digest("hex"));
}

export function verifyOTP(otp: string, hash: string): boolean {
  const hashedOtp = createHash("sha256").update(otp).digest("hex");
  return hashedOtp === hash;
}

export function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    maxAge: parseTokenExpiration(env.auth.accessTokenExpiration),
  });
}

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    path: "/auth/refresh-token",
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    maxAge: parseTokenExpiration(env.auth.refreshTokenExpiration),
  });
}

function parseTokenExpiration(expiration: string | number): number {
  if (typeof expiration === "number") {
    return expiration * 1000;
  }
  // Parse string like "1h", "7d", etc.
  const num = parseInt(expiration);
  if (expiration.includes("h")) {
    return num * 60 * 60 * 1000;
  } else if (expiration.includes("d")) {
    return num * 24 * 60 * 60 * 1000;
  } else if (expiration.includes("m")) {
    return num * 60 * 1000;
  }
  return num * 1000;
}
