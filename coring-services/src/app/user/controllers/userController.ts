import type { NextFunction, Request, Response } from "express";
import { UserService, userService } from "../service/user.service.js";
import { validateBody } from "../../../common/validation/validate.js";
import { UpdateUserDTO } from "../dto/user.dto.js";

export class UserController {
  constructor(private readonly userService: UserService) {}
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = BigInt(req.user?.userId!);
      const user = await this.userService.getUserById(id);
      res.status(200).json(user);
    }     
    
    catch (error) {         return next(error);                     
    }

  };

  updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = BigInt(req.user?.userId!);
      const data = await validateBody(UpdateUserDTO, req.body);
      const updatedUser = await this.userService.updateUserProfile(id, data);
      res.status(200).json(updatedUser);
    }
    catch (error) {
      return next(error);
    }
  };
}


export const userController = new UserController(userService)