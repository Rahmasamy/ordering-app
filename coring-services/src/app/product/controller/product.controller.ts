import type { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service.js";
import { validateBody } from "../../../common/validation/validate.js";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto.js";

export class ProductController {
    async findCategories(req: Request, res: Response, next: NextFunction) {
        try {
            const restaurantId = parseInt(req.params.restaurantId as string, 10);
            if (isNaN(restaurantId)) {
                res.status(400).json({ success: false, message: "Invalid restaurant ID" });
                return;
            }
            
            const categories = await productService.findCategories(restaurantId);
            res.status(200).json({ data: categories });
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
            
            const responseData = await productService.findByBranch(branchId);
            res.status(200).json(responseData);
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
            
            const responseData = await productService.findByRestaurant(restaurantId, userId, role);
            res.status(200).json(responseData);
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
            
            const product = await productService.findById(id);
            res.status(200).json(product);
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
            
            const responseData = await productService.create(restaurantId, userId, role, payload);
            res.status(201).json(responseData);
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
            
            const responseData = await productService.update(id, branchId, userId, role, payload);
            res.status(200).json(responseData);
        } catch (error) {
            next(error);
        }
    }
}

export const productController = new ProductController();
