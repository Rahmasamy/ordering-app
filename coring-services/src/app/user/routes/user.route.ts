import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { Auth } from "../../../common/auth/guard.js";

export const userRoute = Router();
userRoute.get("/me",Auth,userController.getUserById)
userRoute.put("/me", Auth, userController.updateUserProfile)
