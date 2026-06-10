import { Router } from "express";
import { authController } from "../controller/auth.controller.js";

export const authRoute = Router();
authRoute.post("/register",authController.register)
authRoute.post("/login",authController.login)
authRoute.post("/forget-password",authController.forgetPassword)
authRoute.post("/reset-password",authController.resetPassword)
authRoute.post("/refresh",authController.refreshToken)