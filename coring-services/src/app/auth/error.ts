import { AppError } from "../../common/error/AppError.js";

export const UserAlreadyExistsError = new AppError("User already exists with that email or phone",400)
export const unAuthorizedRegisterationError = new AppError("Unauthorized to register with that system role",403)