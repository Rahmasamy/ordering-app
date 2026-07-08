import {injectable} from "tsyringe";
import {AppError} from "../../../lib/error/AppError";
import {ProductNotFoundError} from "../../product/errors";
import {findProductById} from "../../product/repository/product.repository";
import {RestaurantNotFoundError} from "../../restaurant/errors";
import {findRestaurantById} from "../../restaurant/repository/restaurant.repo";
import {
    CreateIngredientBatchDTO,
    CreateIngredientDTO,
    CreateStoryDTO,
    CreateTestimonialDTO,
    UpdateIngredientDTO,
    UpdateStoryDTO,
    UpdateTestimonialDTO,
} from "../dto/content.dto";
import {
    IngredientNotFoundError,
    StoryNotFoundError,
    TestimonialNotFoundError,
} from "../errors";
import {createChef} from "../repository/chef.repository";
import {
    createIngredient,
    deleteIngredient as deleteIngredientRecord,
    findIngredientsByProductId,
    updateIngredient as updateIngredientRecord,
} from "../repository/ingredient.repository";
import {
    createStory,
    findStoryByProductId,
    findStoryByRestaurantId,
    updateStory as updateStoryRecord,
} from "../repository/story.repository";
import {
    createTestimonial,
    deleteTestimonial as deleteTestimonialRecord,
    findTestimonialsByProductId,
    findTestimonialsByRestaurantId,
    updateTestimonial as updateTestimonialRecord,
} from "../repository/testimonial.repository";

@injectable()
export class ContentService {

    getProductDetails = async (productId: number) => {
        const product = await findProductById(productId);
        if (!product) throw ProductNotFoundError;

        const [story, ingredients, testimonials] = await Promise.all([
            findStoryByProductId(productId),
            findIngredientsByProductId(productId),
            findTestimonialsByProductId(productId),
        ]);

        return {story, ingredients, testimonials};
    }

    getProductStory = async (productId: number) => {
        const product = await findProductById(productId);
        if (!product) throw ProductNotFoundError;

        const story = await findStoryByProductId(productId);
        if (!story) throw StoryNotFoundError;
        return story;
    }

    getRestaurantStory = async (restaurantId: number) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;

        const story = await findStoryByRestaurantId(restaurantId);
        if (!story) throw StoryNotFoundError;
        return story;
    }

    createProductStory = async (productId: number, data: CreateStoryDTO) => {
        const product = await findProductById(productId);
        if (!product) throw ProductNotFoundError;

        const existing = await findStoryByProductId(productId);
        if (existing) throw new AppError('Story already exists for this product', 409);

        let chefId = data.chefId ?? null;
        if (data.chef) {
            const chef = await createChef({
                name: data.chef.name,
                title: data.chef.title,
                imageUrl: data.chef.imageUrl,
                quote: data.chef.quote,
            });
            chefId = chef.id;
        }

        return await createStory({
            title: data.title,
            content: data.content,
            featuredQuote: data.featuredQuote,
            productId,
            chefId,
        });
    }

    createRestaurantStory = async (restaurantId: number, data: CreateStoryDTO) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;

        const existing = await findStoryByRestaurantId(restaurantId);
        if (existing) throw new AppError('Story already exists for this restaurant', 409);

        let chefId = data.chefId ?? null;
        if (data.chef) {
            const chef = await createChef({
                name: data.chef.name,
                title: data.chef.title,
                imageUrl: data.chef.imageUrl,
                quote: data.chef.quote,
            });
            chefId = chef.id;
        }

        return await createStory({
            title: data.title,
            content: data.content,
            featuredQuote: data.featuredQuote,
            restaurantId,
            chefId,
        });
    }

    updateStory = async (storyId: number, data: UpdateStoryDTO) => {
        const story = await updateStoryRecord(storyId, data);
        if (!story) throw StoryNotFoundError;
        return story;
    }

    getProductIngredients = async (productId: number) => {
        const product = await findProductById(productId);
        if (!product) throw ProductNotFoundError;
        return await findIngredientsByProductId(productId);
    }

    createProductIngredient = async (productId: number, data: CreateIngredientDTO) => {
        const product = await findProductById(productId);
        if (!product) throw ProductNotFoundError;

        return await createIngredient({
            name: data.name,
            description: data.description,
            productId,
            sortOrder: data.sortOrder,
        });
    }

    createProductIngredientsBatch = async (productId: number, data: CreateIngredientBatchDTO) => {
        const product = await findProductById(productId);
        if (!product) throw ProductNotFoundError;

        const results = [];
        for (const item of data.ingredients) {
            const ingredient = await createIngredient({
                name: item.name,
                description: item.description,
                productId,
                sortOrder: item.sortOrder,
            });
            results.push(ingredient);
        }
        return results;
    }

    updateIngredient = async (ingredientId: number, data: UpdateIngredientDTO) => {
        const ingredient = await updateIngredientRecord(ingredientId, data);
        if (!ingredient) throw IngredientNotFoundError;
        return ingredient;
    }

    deleteIngredient = async (ingredientId: number) => {
        const deleted = await deleteIngredientRecord(ingredientId);
        if (!deleted) throw IngredientNotFoundError;
    }

    getProductTestimonials = async (productId: number) => {
        const product = await findProductById(productId);
        if (!product) throw ProductNotFoundError;
        return await findTestimonialsByProductId(productId);
    }

    getRestaurantTestimonials = async (restaurantId: number) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;
        return await findTestimonialsByRestaurantId(restaurantId);
    }

    createProductTestimonial = async (productId: number, data: CreateTestimonialDTO) => {
        const product = await findProductById(productId);
        if (!product) throw ProductNotFoundError;

        return await createTestimonial({
            content: data.content,
            rating: data.rating,
            authorName: data.authorName,
            productId,
        });
    }

    createRestaurantTestimonial = async (restaurantId: number, data: CreateTestimonialDTO) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;

        return await createTestimonial({
            content: data.content,
            rating: data.rating,
            authorName: data.authorName,
            restaurantId,
        });
    }

    updateTestimonial = async (testimonialId: number, data: UpdateTestimonialDTO) => {
        const testimonial = await updateTestimonialRecord(testimonialId, data);
        if (!testimonial) throw TestimonialNotFoundError;
        return testimonial;
    }

    deleteTestimonial = async (testimonialId: number) => {
        const deleted = await deleteTestimonialRecord(testimonialId);
        if (!deleted) throw TestimonialNotFoundError;
    }
}
