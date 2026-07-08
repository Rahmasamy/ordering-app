import {injectable} from "tsyringe";
import {AppError} from "../../../lib/error/AppError";
import {PaginationParams, FilterParams, buildPaginationResult} from "../../../lib/http/pagination/cursor-pagination";
import {ProductNotFoundError} from "../../product/errors";
import {findProductById} from "../../product/repository/product.repository";
import {RestaurantNotFoundError} from "../../restaurant/errors";
import {findRestaurantById} from "../../restaurant/repository/restaurant.repo";
import {CreateOfferDTO, UpdateOfferDTO} from "../dto/offer.dto";
import {OfferNotFoundError} from "../errors";
import {
    createOffer,
    findAllOffers,
    findOfferById,
    findOffersByProductId,
    findOffersByRestaurantId,
    updateOffer as updateOfferRecord,
} from "../repository/offer.repository";

@injectable()
export class OfferService {

    findAll = async (params: PaginationParams, filters: FilterParams[]) => {
        const result = await findAllOffers(params, filters);
        return buildPaginationResult(result, params.limit, params.sortBy);
    }

    findById = async (id: number) => {
        const offer = await findOfferById(id);
        if (!offer) throw OfferNotFoundError;
        return offer;
    }

    findByProduct = async (productId: number) => {
        const product = await findProductById(productId);
        if (!product) throw ProductNotFoundError;
        return await findOffersByProductId(productId);
    }

    findByRestaurant = async (restaurantId: number) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;
        return await findOffersByRestaurantId(restaurantId);
    }

    createForRestaurant = async (restaurantId: number, data: CreateOfferDTO) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;

        if (data.productId) {
            const product = await findProductById(data.productId);
            if (!product) throw ProductNotFoundError;
            if (Number(product.restaurantId) !== Number(restaurantId)) {
                throw new AppError('Product does not belong to this restaurant', 400);
            }
        }

        return await createOffer({
            badgeText: data.badgeText,
            imageUrl: data.imageUrl,
            title: data.title,
            description: data.description,
            promoCode: data.promoCode,
            expiresAt: new Date(data.expiresAt),
            productId: data.productId ?? null,
            restaurantId,
            isActive: data.isActive,
        });
    }

    createForProduct = async (productId: number, data: CreateOfferDTO) => {
        const product = await findProductById(productId);
        if (!product) throw ProductNotFoundError;

        return await createOffer({
            badgeText: data.badgeText,
            imageUrl: data.imageUrl,
            title: data.title,
            description: data.description,
            promoCode: data.promoCode,
            expiresAt: new Date(data.expiresAt),
            productId,
            restaurantId: product.restaurantId,
            isActive: data.isActive,
        });
    }

    update = async (id: number, data: UpdateOfferDTO) => {
        const offer = await updateOfferRecord(id, {
            badgeText: data.badgeText,
            imageUrl: data.imageUrl,
            title: data.title,
            description: data.description,
            promoCode: data.promoCode,
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
            isActive: data.isActive,
        });
        if (!offer) throw OfferNotFoundError;
        return offer;
    }
}
