import { AppError } from "../../common/error/AppError.js";

export const UserAlreadyExistsError = new AppError("User already exists with that email or phone",400)
export const unAuthorizedRegisterationError = new AppError("Unauthorized to register with that system role",403)
export const NoUserFounderror = new AppError("No user found with that email",404)
export const InvalidCredentialsError = new AppError("Invalid email or password",401)
export const InvalidOTPError = new AppError("Invalid OTP",400)