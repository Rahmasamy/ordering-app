import { Router } from "express";
import { productController } from "../controller/product.controller.js";
import { Auth } from "../../../common/auth/guard.js";

export const productRouter = Router();

productRouter.get("/restaurants/:restaurantId/categories",Auth, productController.findCategories.bind(productController));
productRouter.get("/branches/:branchId/products",Auth, productController.findByBranch.bind(productController));
productRouter.get("/restaurants/:restaurantId/products", Auth, productController.findByRestaurant.bind(productController));
productRouter.get("/products/:id", productController.findById.bind(productController));
productRouter.post("/restaurants/:restaurantId/products", Auth, productController.create.bind(productController));
productRouter.patch("/products/:id", Auth, productController.update.bind(productController));
