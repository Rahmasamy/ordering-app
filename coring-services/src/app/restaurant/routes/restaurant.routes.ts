import { Router } from "express";
import { withCache } from "../../../lib/cache/withCache.js";
import { RestaurantController } from "../controllers/restaurant.controller.js";
import { TOKENS } from "../../../lib/di/tokens.js";
import { container } from "../../../lib/di/container.js";
import { Auth } from "../../../lib/auth/guard.js";


export const restaurantRouter = Router();
const restaurantController = container.resolve<RestaurantController>(TOKENS.RestaurantController);

restaurantRouter.get("/", withCache(false, 600), restaurantController.getAllRestaurants);
restaurantRouter.get("/:id", withCache(false, 600), restaurantController.getById);

restaurantRouter.post("/", Auth, restaurantController.create);
restaurantRouter.patch("/:id", Auth, restaurantController.update);
restaurantRouter.patch("/:id/status", Auth, restaurantController.updateStatus);