import {injectable} from "tsyringe";
import {UnAuthorisedError} from "../../../lib/auth/errors";
import {RestaurantNotFoundError} from "../../restaurant/errors";
import {findRestaurantById} from "../../restaurant/repository/restaurant.repo";
import {ProductNotFoundError} from "../errors";
import {SystemRole} from "../../user/enums";
import {CreateProductDTO, UpdateProductDTO} from "../dto/product.dto";
import {
    createProduct,
    findProductById,
    findProductsByBranch,
    findProductsByRestaurant,
    updateProduct,
    findAllProducts,
    findTrendingProducts,
    findProductsByBranchAndIds
} from "../repository/product.repository";
import {
    reserveStock,
    releaseStock
} from "../repository/stock.repository";
import {
    findCategoryByName,
    findCategoriesByRestaurant,
    createCategory,
    findAllCategories
} from "../repository/category.repository";
import {updateBranchDetails} from "../repository/product-branch-details.repository";
import {findBranchById} from "../../branch/repository/branch.repository";
import {PaginationParams, FilterParams, buildPaginationResult} from "../../../lib/http/pagination/cursor-pagination";

@injectable()
export class ProductService {

    create = async (restaurantId: number, userId: number, userRole: SystemRole, data: CreateProductDTO) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnAuthorisedError;
        }

        let categoryId: number | null = null;
        if (data.categoryName) {
            let category = await findCategoryByName(restaurantId, data.categoryName);
            if (!category) {
                category = await createCategory(restaurantId, data.categoryName);
            }
            categoryId = category.id;
        }

        return await createProduct({
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            restaurantId,
            categoryId,
            isTrending: data.isTrending,
            isChefSpecial: data.isChefSpecial,
            isPopular: data.isPopular,
            calories: data.calories,
            isDairyFree: data.isDairyFree,
            containsGluten: data.containsGluten,
            reviewsCount: data.reviewsCount,
            rating: data.rating,
            imageUrls: data.imageUrls,
            donenessOptions: data.donenessOptions,
            addons: data.addons,
            stock: data.stock,
            isAvailable: data.isAvailable,
        });
    }

    findByRestaurant = async (restaurantId: number, userId: number, userRole: SystemRole) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnAuthorisedError;
        }
        return await findProductsByRestaurant(restaurantId);
    }

    findAll = async (params: PaginationParams, filters: FilterParams[]) => {
        const result = await findAllProducts(params, filters);
        return buildPaginationResult(result, params.limit, params.sortBy);
    }

    findTrending = async (limit: number = 10) => {
        return await findTrendingProducts(limit);
    }

    findCategories = async (restaurantId: number) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;
        return await findCategoriesByRestaurant(restaurantId);
    }

    getOrCreateCategory = async (restaurantId: number, name: string) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;

        let category = await findCategoryByName(restaurantId, name);
        let created = false;
        if (!category) {
            category = await createCategory(restaurantId, name);
            created = true;
        }
        return { category, created };
    }

    findAllCategories = async () => {
        return await findAllCategories();
    }

    findByBranch = async (branchId: number) => {
        return await findProductsByBranch(branchId);
    }

    findById = async (id: number) => {
        const product = await findProductById(id);
        if (!product) {
            throw ProductNotFoundError;
        }
        return product;
    }

    update = async (productId: number, userId: number, userRole: SystemRole, data: UpdateProductDTO, branchId?: number) => {
        const product = await findProductById(productId);
        if (!product) {
            throw ProductNotFoundError;
        }

        const restaurant = await findRestaurantById(product.restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnAuthorisedError;
        }

        let categoryId: number | undefined = undefined;
        if (data.categoryName) {
            let category = await findCategoryByName(product.restaurantId, data.categoryName);
            if (!category) {
                category = await createCategory(product.restaurantId, data.categoryName);
            }
            categoryId = category.id;
        }

        const updatedProduct = await updateProduct(productId, {
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            categoryId,
            isTrending: data.isTrending,
            isChefSpecial: data.isChefSpecial,
            isPopular: data.isPopular,
            calories: data.calories,
            isDairyFree: data.isDairyFree,
            containsGluten: data.containsGluten,
            reviewsCount: data.reviewsCount,
            rating: data.rating,
            imageUrls: data.imageUrls,
            donenessOptions: data.donenessOptions,
            addons: data.addons,
            stock: branchId ? undefined : data.stock,
            isAvailable: branchId ? undefined : data.isAvailable,
        });

        let branchDetails;
        if (branchId && (data.price !== undefined || data.stock !== undefined || data.isAvailable !== undefined)) {
            const branch = await findBranchById(branchId);
            if (!branch || Number(branch.restaurantId) !== Number(product.restaurantId)) {
                throw new Error("Invalid branch ID for this restaurant");
            }
            branchDetails = await updateBranchDetails(branchId, productId, {
                price: data.price,
                stock: data.stock,
                isAvailable: data.isAvailable,
            });
        }

        return {product: updatedProduct, branchDetails};
    }

    findProductsByBranchAndIds = async (branchId: number, productIds: number[]) => {
        return await findProductsByBranchAndIds(branchId, productIds);
    }

    reserveStock = async (branchId: number, items: {productId: number, quantity: number}[]) => {
        return await reserveStock(branchId, items);
    }

    releaseStock = async (branchId: number, items: {productId: number, quantity: number}[]) => {
        return await releaseStock(branchId, items);
    }
}
