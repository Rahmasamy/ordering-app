import {Request, Response, NextFunction} from "express";
import {injectable, inject} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import {sendSuccess} from "../../../lib/http/response";
import {validateBody} from "../../../lib/validation/validate";
import {
    CreateIngredientBatchDTO,
    CreateIngredientDTO,
    CreateStoryDTO,
    CreateTestimonialDTO,
    UpdateIngredientDTO,
    UpdateStoryDTO,
    UpdateTestimonialDTO,
} from "../dto/content.dto";
import {ContentService} from "../service/content.service";

@injectable()
export class ContentController {
    constructor(@inject(TOKENS.ContentService) private readonly contentService: ContentService) {}

    getProductDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const details = await this.contentService.getProductDetails(Number(req.params.productId));
            sendSuccess(res, details);
        } catch (err) {
            next(err);
        }
    }

    getProductStory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const story = await this.contentService.getProductStory(Number(req.params.productId));
            sendSuccess(res, story);
        } catch (err) {
            next(err);
        }
    }

    getRestaurantStory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const story = await this.contentService.getRestaurantStory(Number(req.params.restaurantId));
            sendSuccess(res, story);
        } catch (err) {
            next(err);
        }
    }

    createProductStory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateStoryDTO, req.body);
            const story = await this.contentService.createProductStory(Number(req.params.productId), data);
            sendSuccess(res, {message: "Story created", story}, 201);
        } catch (err) {
            next(err);
        }
    }

    createRestaurantStory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateStoryDTO, req.body);
            const story = await this.contentService.createRestaurantStory(Number(req.params.restaurantId), data);
            sendSuccess(res, {message: "Story created", story}, 201);
        } catch (err) {
            next(err);
        }
    }

    updateStory = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateStoryDTO, req.body);
            const story = await this.contentService.updateStory(Number(req.params.storyId), data);
            sendSuccess(res, {message: "Story updated", story});
        } catch (err) {
            next(err);
        }
    }

    getProductIngredients = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ingredients = await this.contentService.getProductIngredients(Number(req.params.productId));
            sendSuccess(res, ingredients);
        } catch (err) {
            next(err);
        }
    }

    createProductIngredient = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateIngredientDTO, req.body);
            const ingredient = await this.contentService.createProductIngredient(Number(req.params.productId), data);
            sendSuccess(res, {message: "Ingredient created", ingredient}, 201);
        } catch (err) {
            next(err);
        }
    }

    createProductIngredientsBatch = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateIngredientBatchDTO, req.body);
            const ingredients = await this.contentService.createProductIngredientsBatch(Number(req.params.productId), data);
            sendSuccess(res, {message: "Ingredients created", ingredients}, 201);
        } catch (err) {
            next(err);
        }
    }

    updateIngredient = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateIngredientDTO, req.body);
            const ingredient = await this.contentService.updateIngredient(Number(req.params.ingredientId), data);
            sendSuccess(res, {message: "Ingredient updated", ingredient});
        } catch (err) {
            next(err);
        }
    }

    deleteIngredient = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.contentService.deleteIngredient(Number(req.params.ingredientId));
            sendSuccess(res, {message: "Ingredient deleted"});
        } catch (err) {
            next(err);
        }
    }

    getProductTestimonials = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const testimonials = await this.contentService.getProductTestimonials(Number(req.params.productId));
            sendSuccess(res, testimonials);
        } catch (err) {
            next(err);
        }
    }

    getRestaurantTestimonials = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const testimonials = await this.contentService.getRestaurantTestimonials(Number(req.params.restaurantId));
            sendSuccess(res, testimonials);
        } catch (err) {
            next(err);
        }
    }

    createProductTestimonial = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateTestimonialDTO, req.body);
            const testimonial = await this.contentService.createProductTestimonial(Number(req.params.productId), data);
            sendSuccess(res, {message: "Testimonial created", testimonial}, 201);
        } catch (err) {
            next(err);
        }
    }

    createRestaurantTestimonial = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateTestimonialDTO, req.body);
            const testimonial = await this.contentService.createRestaurantTestimonial(Number(req.params.restaurantId), data);
            sendSuccess(res, {message: "Testimonial created", testimonial}, 201);
        } catch (err) {
            next(err);
        }
    }

    updateTestimonial = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateTestimonialDTO, req.body);
            const testimonial = await this.contentService.updateTestimonial(Number(req.params.testimonialId), data);
            sendSuccess(res, {message: "Testimonial updated", testimonial});
        } catch (err) {
            next(err);
        }
    }

    deleteTestimonial = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.contentService.deleteTestimonial(Number(req.params.testimonialId));
            sendSuccess(res, {message: "Testimonial deleted"});
        } catch (err) {
            next(err);
        }
    }
}
