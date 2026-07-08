import {Request, Response, NextFunction} from "express";
import {injectable, inject} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import {sendSuccess, sendPaginated} from "../../../lib/http/response";
import {validateBody} from "../../../lib/validation/validate";
import {SystemRole} from "../../user/enums";
import {CreateProductDTO, UpdateProductDTO} from "../dto/product.dto";
import {CreateCategoryDTO} from "../dto/category.dto";
import {ProductService} from "../service/product.service";
import {parsePaginationQuery, parseFilters} from "../../../lib/http/pagination/parse-query";
import {AppError} from "../../../lib/error/AppError";
import {db} from "../../../lib/knex/knex";
import {logActivity} from "../../analytics/repository/activity-log.repository";

@injectable()
export class ProductController {
    constructor(@inject(TOKENS.ProductService) private readonly productService: ProductService) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateProductDTO, req.body);
            const restaurantId = Number(req.params.restaurantId);
            const product = await this.productService.create(
                restaurantId,
                req.user?.userId!,
                req.user?.role! as SystemRole,
                data,
            );

            // Log activity
            const userObj = await db("users").where({ id: req.user?.userId }).first();
            const userName = userObj ? userObj.name : (req.user?.email || "System");
            await logActivity(
                restaurantId,
                req.user?.userId || null,
                userName,
                `Created new menu item: ${data.name}`,
                "update",
                `Category: ${data.categoryName || "Uncategorized"} - Calories: ${data.calories || "N/A"}`
            );

            sendSuccess(res, {message: "Product created", product}, 201);
        } catch (err) {
            next(err);
        }
    }

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const params = parsePaginationQuery(req.query, ['createdAt', 'name']);
            const filters = parseFilters(req.query, ['id', 'name', 'restaurantId', 'isTrending']);
            const result = await this.productService.findAll(params, filters);
            sendPaginated(res, result.data, result.meta);
        } catch (err) {
            next(err);
        }
    }

    getTrending = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const results = await this.productService.findTrending(limit);
            sendSuccess(res, results);
        } catch (err) {
            next(err);
        }
    }

    findByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.productService.findByRestaurant(
                Number(req.params.restaurantId),
                req.user?.userId!,
                req.user?.role! as SystemRole,
            );
            sendSuccess(res, results);
        } catch (err) {
            next(err);
        }
    }

    findCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.productService.findCategories(Number(req.params.restaurantId));
            sendSuccess(res, results);
        } catch (err) {
            next(err);
        }
    }

    findRestaurantCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let restaurantId = req.user?.restaurantId;
            if (req.user?.role === SystemRole.SYSTEM_ADMIN) {
                restaurantId = req.query.restaurantId ? Number(req.query.restaurantId) : undefined;
            }
            if (!restaurantId) {
                throw new AppError("Restaurant ID is required", 400);
            }
            const results = await this.productService.findCategories(restaurantId);
            sendSuccess(res, results);
        } catch (err) {
            next(err);
        }
    }

    createCategory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let restaurantId = req.user?.restaurantId;
            if (req.user?.role === SystemRole.SYSTEM_ADMIN) {
                restaurantId = req.query.restaurantId ? Number(req.query.restaurantId) : undefined;
            }
            if (!restaurantId) {
                throw new AppError("Restaurant ID is required", 400);
            }
            const data = await validateBody(CreateCategoryDTO, req.body);
            const { category, created } = await this.productService.getOrCreateCategory(restaurantId, data.name);
            sendSuccess(res, {
                message: created ? "Category created" : "Category already exists",
                category
            }, created ? 201 : 200);
        } catch (err) {
            next(err);
        }
    }

    getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.productService.findAllCategories();
            sendSuccess(res, results);
        } catch (err) {
            next(err);
        }
    }

    findByBranch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.productService.findByBranch(Number(req.params.branchId));
            sendSuccess(res, results);
        } catch (err) {
            next(err);
        }
    }

    findById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const product = await this.productService.findById(Number(req.params.id));
            sendSuccess(res, product);
        } catch (err) {
            next(err);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateProductDTO, req.body);
            const branchId = req.query.branchId ? Number(req.query.branchId) : undefined;
            const result = await this.productService.update(
                Number(req.params.id),
                req.user?.userId!,
                req.user?.role! as SystemRole,
                data,
                branchId,
            );
            sendSuccess(res, {message: "Product updated", ...result});
        } catch (err) {
            next(err);
        }
    }

    findProductsByBranchAndIdsInternal = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.branchId);
            const idsStr = req.query.ids as string;
            const productIds = idsStr ? idsStr.split(",").map(Number).filter(id => !isNaN(id)) : [];
            const products = await this.productService.findProductsByBranchAndIds(branchId, productIds);
            sendSuccess(res, products);
        } catch (err) {
            next(err);
        }
    }

    reserveStockInternal = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.branchId);
            const {items} = req.body;
            const result = await this.productService.reserveStock(branchId, items);
            sendSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    releaseStockInternal = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const branchId = Number(req.params.branchId);
            const {items} = req.body;
            const result = await this.productService.releaseStock(branchId, items);
            sendSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }
}

