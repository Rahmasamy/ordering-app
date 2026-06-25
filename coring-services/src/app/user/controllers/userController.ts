import type { NextFunction, Request, Response } from "express";
import { sendSuccessResponse } from "../../../lib/http/response.js";
import { UserService, userService } from "../service/user.service.js";
import { UpdateUserDTO } from "../dto/user.dto.js";
import { validateBody } from "../../../lib/validation/validate.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";

@injectable()
export class UserController {
  constructor(@inject(TOKENS.UserService) private readonly userService: UserService) {}
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = BigInt(req.user?.userId!);
      const user = await this.userService.getUserById(id);
      sendSuccessResponse(res, user);
    }     
    
    catch (error) {         return next(error);                     
    }

  };

  updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = BigInt(req.user?.userId!);
      const data = await validateBody(UpdateUserDTO, req.body);
      const updatedUser = await this.userService.updateUserProfile(id, data);
      sendSuccessResponse(res, updatedUser);
    }
    catch (error) {
      return next(error);
    }
  };
}


export const userController = new UserController(userService)