import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { TOKENS } from "../../lib/di/tokens";
import { container } from "../../lib/di/container";
import { CartController } from "./controller/cart.controller";

export const cartRouter = Router();

const cartController = container.resolve<CartController>(TOKENS.CartController);

cartRouter.use("/", authenticate);
cartRouter.get("/", cartController.getCart);
cartRouter.post("/items", cartController.addItem);
cartRouter.delete("/items/:productId", cartController.removeItem);
cartRouter.delete("/", cartController.clearCart);
