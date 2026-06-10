import { AppError } from "../../common/error/AppError.js";

export const NoUserFounderror = new AppError("No user found with that email",404)
