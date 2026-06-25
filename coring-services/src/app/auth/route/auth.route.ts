import { Router } from "express";
import { AuthController } from "../controller/auth.controller.js";
import { TOKENS } from "../../../lib/di/tokens.js";
import { container } from "../../../lib/di/container.js";
export const authRoute = Router();
const authController =container.resolve<AuthController>(TOKENS.AuthController)
authRoute.post("/register",authController.register)
authRoute.post("/login",authController.login)
authRoute.post("/forget-password",authController.forgetPassword)
authRoute.post("/reset-password",authController.resetPassword)
authRoute.post("/accept-invite",authController.acceptInvite)
authRoute.post("/refresh",authController.refreshToken)