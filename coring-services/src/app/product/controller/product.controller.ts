import type { Request, Response, NextFunction } from "express";
import { sendSuccessResponse } from "../../../lib/http/response.js";
import { productService, type ProductService } from "../services/product.service.js";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto.js";
import { validateBody } from "../../../lib/validation/validate.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";

@injectable()
export class ProductController {
    constructor(@inject(TOKENS.ProductService) private readonly productService: ProductService) {}
    async findCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const restaurantId = parseInt(req.params.restaurantId as string, 10);
            if (isNaN(restaurantId)) {
                res.status(400).json({ success: false, message: "Invalid restaurant ID" });
                return;
            }
            
            const categories = await this.productService.findCategories(restaurantId);
            sendSuccessResponse(res, categories);
        } catch (error) {
            next(error);
        }
    }

    async findByBranch(req: Request, res: Response, next: NextFunction) {
        try {
            const branchId = parseInt(req.params.branchId as string, 10);
            if (isNaN(branchId)) {
                res.status(400).json({ success: false, message: "Invalid branch ID" });
                return;
            }
            
            const responseData = await this.productService.findByBranch(branchId);
            sendSuccessResponse(res, responseData);
        } catch (error) {
            next(error);
        }
    }

    async findByRestaurant(req: Request, res: Response, next: NextFunction) {
        try {
            const restaurantId = parseInt(req.params.restaurantId as string, 10);
            if (isNaN(restaurantId)) {
                res.status(400).json({ success: false, message: "Invalid restaurant ID" });
                return;
            }
            
            const user = (req as any).user;
            const userId = parseInt(user.userId, 10);
            const role = user.role;
            
            const responseData = await this.productService.findByRestaurant(restaurantId, userId, role);
            sendSuccessResponse(res, responseData);
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid product ID" });
                return;
            }
            
            const product = await this.productService.findById(id);
            sendSuccessResponse(res, product);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const restaurantId = parseInt(req.params.restaurantId as string, 10);
            if (isNaN(restaurantId)) {
                res.status(400).json({ success: false, message: "Invalid restaurant ID" });
                return;
            }
            
            const user = (req as any).user;
            const userId = parseInt(user.userId, 10);
            const role = user.role;
            
            const payload = await validateBody(CreateProductDTO, req.body);
            
            const responseData = await this.productService.create(restaurantId, userId, role, payload);
            sendSuccessResponse(res, responseData, 201);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id as string, 10);
            if (isNaN(id)) {
                res.status(400).json({ success: false, message: "Invalid product ID" });
                return;
            }

            const branchIdQuery = req.query.branchId as string;
            const branchId = branchIdQuery ? parseInt(branchIdQuery, 10) : undefined;
            if (branchIdQuery && isNaN(branchId as number)) {
                res.status(400).json({ success: false, message: "Invalid branch ID" });
                return;
            }

            const user = (req as any).user;
            const userId = parseInt(user.userId, 10);
            const role = user.role;
            
            const payload = await validateBody(UpdateProductDTO, req.body);
            
            const responseData = await this.productService.update(id, branchId, userId, role, payload);
            sendSuccessResponse(res, responseData);
        } catch (error) {
            next(error);
        }
    }
}

export const productController = new ProductController(productService);
