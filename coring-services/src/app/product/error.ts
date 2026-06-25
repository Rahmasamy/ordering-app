import { AppError } from "../../lib/error/AppError.js";

export const RestaurantNotFoundError = new AppError("Restaurant not found", 404);
export const UnauthorizedProductAccessError = new AppError("Unauthorized to view these products", 403);
export const ProductNotFoundError = new AppError("Product not found", 404);
