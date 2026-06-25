import { findCategoriesByRestaurantId, findCategoryByNameAndRestaurant, createCategory } from "../repo/category.repo.js";
import { findProductsByBranch, findProductsByRestaurant, findProductById, createProduct, updateProduct } from "../repo/product.repo.js";
import { updateBranchDetails } from "../repo/product-branch-details.repo.js";
import { findRestaurantById } from "../../restaurant/repo/restaurant.repo.js";
import { RestaurantNotFoundError, UnauthorizedProductAccessError, ProductNotFoundError } from "../error.js";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto.js";
import { SystemRole } from "../../user/entity/enum.js";
import type { Product } from "../entity/product.entity.js";
import { injectable } from "tsyringe";

@injectable()
export class ProductService {
    async findCategories(restaurantId: number) {
        return await findCategoriesByRestaurantId(restaurantId);
    }

    async findByBranch(branchId: number) {
        return await findProductsByBranch(branchId);
    }

    async findByRestaurant(restaurantId: number, userId: number, role: string) {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }
        
        // Use == or convert both to numbers to be safe since PG might return string for BIGINT
        if (Number(restaurant.owner_id) !== userId && role !== "SUPERADMIN") {
            throw UnauthorizedProductAccessError;
        }
        
        return await findProductsByRestaurant(restaurantId);
    }

    async findById(id: number) {
        const product = await findProductById(id);
        if (!product) {
            throw ProductNotFoundError;
        }
        return product;
    }

    async create(restaurantId: number, userId: number, role: string, payload: CreateProductDTO) {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }
        
        if (Number(restaurant.owner_id) !== userId && role !== SystemRole.SYSTEM_ADMIN) {
            throw UnauthorizedProductAccessError;
        }

        let categoryId: number | undefined;
        if (payload.categoryName) {
            let category = await findCategoryByNameAndRestaurant(payload.categoryName, restaurantId);
            if (!category) {
                category = await createCategory({
                    name: payload.categoryName,
                    restaurant_id: restaurantId
                });
            }
            categoryId = Number(category.id);
        }

        const productPayload: any = {
            restaurant_id: restaurantId,
            name: payload.name
        };
        if (categoryId !== undefined) productPayload.category_id = categoryId;
        if (payload.description !== undefined) productPayload.description = payload.description;
        if (payload.imageUrl !== undefined) productPayload.image_url = payload.imageUrl;

        const productId = await createProduct(productPayload);

        const newProduct = await findProductById(productId);

        return {
            message: "Product created successfully",
            product: newProduct ? {
                id: newProduct.id,
                name: newProduct.name,
                description: newProduct.description,
                imageUrl: newProduct.image_url,
                restaurantId: newProduct.restaurant_id,
                categoryId: newProduct.category_id,
                createdAt: newProduct.created_at,
                updatedAt: newProduct.updated_at
            } : null
        };
    }

    async update(id: number, branchId: number | undefined, userId: number, role: string, payload: UpdateProductDTO) {
        const product = await findProductById(id);
        if (!product) {
            throw ProductNotFoundError;
        }

        const restaurant = await findRestaurantById(Number(product.restaurant_id));
        if (!restaurant) {
            throw RestaurantNotFoundError;
        }

        if (Number(restaurant.owner_id) !== userId && role !== SystemRole.SYSTEM_ADMIN) {
            throw UnauthorizedProductAccessError;
        }

        let categoryId: number | undefined;
        if (payload.categoryName) {
            let category = await findCategoryByNameAndRestaurant(payload.categoryName, Number(product.restaurant_id));
            if (!category) {
                category = await createCategory({
                    name: payload.categoryName,
                    restaurant_id: Number(product.restaurant_id)
                });
            }
            categoryId = Number(category.id);
        }

        const productUpdate: Partial<Product> = {};
        if (payload.name !== undefined) productUpdate.name = payload.name;
        if (payload.description !== undefined) productUpdate.description = payload.description;
        if (payload.imageUrl !== undefined) productUpdate.image_url = payload.imageUrl;
        if (categoryId !== undefined) productUpdate.category_id = categoryId;

        if (Object.keys(productUpdate).length > 0) {
            await updateProduct(id, productUpdate);
        }

        let branchDetailsResponse;
        if (branchId !== undefined) {
            branchDetailsResponse = await updateBranchDetails(id, branchId, {
                price: payload.price,
                stock: payload.stock,
                isAvailable: payload.isAvailable
            });
        }

        const updatedProduct = await findProductById(id);

        return {
            message: "Product updated successfully",
            product: updatedProduct ? {
                id: updatedProduct.id,
                name: updatedProduct.name,
                description: updatedProduct.description,
                imageUrl: updatedProduct.image_url,
                restaurantId: updatedProduct.restaurant_id,
                categoryId: updatedProduct.category_id,
                createdAt: updatedProduct.created_at,
                updatedAt: updatedProduct.updated_at
            } : null,
            ...(branchDetailsResponse && { branchDetails: branchDetailsResponse })
        };
    }
}

export const productService = new ProductService();
