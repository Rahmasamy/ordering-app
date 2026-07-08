import {AppError} from "../../lib/error/AppError";

export const OfferNotFoundError = new AppError('Offer not found', 404);
