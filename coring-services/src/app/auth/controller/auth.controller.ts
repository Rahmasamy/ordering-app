import type { NextFunction, Request, Response } from "express";
import { authService, AuthService } from "../service/auth.service.js";
import { validateBody } from "../../../common/validation/validate.js";
import { RegisterDTO } from "../dto/auth.dto.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await validateBody(RegisterDTO, req.body);
      const result = await this.authService.register(data);
      res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  };
}

export const authController = new AuthController(authService)