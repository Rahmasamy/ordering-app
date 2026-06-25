import { Router } from "express";
import { UserController } from "../controllers/userController.js";
import { TOKENS } from "../../../lib/di/tokens.js";
import { container } from "../../../lib/di/container.js";
import { Auth } from "../../../lib/auth/guard.js";

export const userRoute = Router();
const userController = container.resolve<UserController>(TOKENS.UserController);
userRoute.get("/me",Auth,userController.getUserById)
userRoute.put("/me", Auth, userController.updateUserProfile)
