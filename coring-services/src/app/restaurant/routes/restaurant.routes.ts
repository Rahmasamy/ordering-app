import { Router } from "express";
import { restaurantController } from "../controllers/restaurant.controller.js";
import { Auth } from "../../../common/auth/guard.js";

export const restaurantRouter = Router()

restaurantRouter.get("/", restaurantController.getAllRestaurants);
restaurantRouter.get("/:id", restaurantController.getById);

restaurantRouter.post("/", Auth, restaurantController.create);
restaurantRouter.patch("/:id", Auth, restaurantController.update);
restaurantRouter.patch("/:id/status", Auth, restaurantController.updateStatus);