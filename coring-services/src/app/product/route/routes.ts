import { Router } from "express";
import { withCache } from "../../../lib/cache/withCache.js";
import { ProductController } from "../controller/product.controller.js";
import { TOKENS } from "../../../lib/di/tokens.js";
import { container } from "../../../lib/di/container.js";
import { Auth } from "../../../lib/auth/guard.js";

export const productRouter = Router();
const productController = container.resolve<ProductController>(TOKENS.ProductController);

productRouter.get("/restaurants/:restaurantId/categories",Auth, withCache(false, 3600), productController.findCategories.bind(productController));
productRouter.get("/branches/:branchId/products",Auth, withCache(false, 60), productController.findByBranch.bind(productController));
productRouter.get("/restaurants/:restaurantId/products", Auth, withCache(false, 60), productController.findByRestaurant.bind(productController));
productRouter.get("/products/:id",Auth, withCache(false, 60), productController.findById.bind(productController));
productRouter.post("/restaurants/:restaurantId/products", Auth, productController.create.bind(productController));
productRouter.patch("/products/:id", Auth, productController.update.bind(productController));
