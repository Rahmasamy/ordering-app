import {AppError} from "../../lib/error/AppError";

export const StoryNotFoundError = new AppError('Story not found', 404);
export const IngredientNotFoundError = new AppError('Ingredient not found', 404);
export const TestimonialNotFoundError = new AppError('Testimonial not found', 404);
export const ChefNotFoundError = new AppError('Chef not found', 404);
