import { Router } from "express";
import { authController } from "../controller/auth.controller.js";

export const authRoute = Router();
authRoute.post("/register",authController.register)