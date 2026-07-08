import {Router} from "express";
import {requireInternalApiKey} from "../../lib/auth/api-key";
import {container} from "../../lib/di/container";
import {TOKENS} from "../../lib/di/tokens";
import {ProductController} from "./controller/product.controller";

export const internalProductRouter = Router();

const productController = container.resolve<ProductController>(TOKENS.ProductController);

internalProductRouter.use(requireInternalApiKey);

internalProductRouter.get("/branches/:branchId/products", productController.findProductsByBranchAndIdsInternal);
internalProductRouter.post("/branches/:branchId/reserve-stock", productController.reserveStockInternal);
internalProductRouter.post("/branches/:branchId/release-stock", productController.releaseStockInternal);
