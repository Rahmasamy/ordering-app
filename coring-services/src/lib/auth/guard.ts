import type { NextFunction, Request, Response } from "express";
import { NotAuthenticatedError } from "./authError.js";
import { env } from "../config/env.config.js";
import jwt from "jsonwebtoken";

interface AuthPayload extends jwt.JwtPayload {
  userId: string;
  role: string;
  email: string;
  restaurantRoleName?: string;
  restaurantId?: number;
  branchIds?: number[];
}

export function Auth(req: Request, res: Response, next: NextFunction) {
   const accessToken = req.cookies["access_token"];
   console.log(req.cookies);
console.log(req.cookies["access_token"]);
   if (!accessToken) {
    return next(NotAuthenticatedError);
   }
   req.user = jwt.verify(accessToken, env.auth.accessTokenSecret) as AuthPayload;
   next();
}