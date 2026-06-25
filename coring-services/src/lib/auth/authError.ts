import { AppError } from '../error/AppError.js';
export const InvalidCredentialsError = new AppError("Invalid Credentials",401)
export const NotAuthenticatedError = new AppError("Not authenticated",403)