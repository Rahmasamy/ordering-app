import type { NextFunction, Request, Response } from "express";
import { authService, AuthService } from "../service/auth.service.js";
import { validateBody } from "../../../common/validation/validate.js";
import { ForgetPaaaswordDTO, LoginDTO, RefreshTokenDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto.js";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../utils.js";

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
    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // validate body
            const data = await validateBody(LoginDTO, req.body);
            const result = await this.authService.login(data);
            setAccessTokenCookie(res, result.token);
            setRefreshTokenCookie(res, result.refreshToken);
            res.status(200).json(result);
        } catch (error) {
            return next(error);
        }
    }
    forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
     try {
        // validate body    
        const data = await validateBody(ForgetPaaaswordDTO, req.body);
        const result = await this.authService.forgetPassword(data);
        res.status(200).json({
            "message ": "Email has been sent successfully!"
        });
        } catch (error) {   
            return next(error);
        }
    }
    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // validate body
            const data = await validateBody(ResetPasswordDTO, req.body);
            await this.authService.resetPassword(data);
            res.status(200).json({
                "message ": "Password has been reset successfully!"
            });
        }
        catch (error) {
            return next(error);
        }
      }

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies["refresh_token"] || req.body?.refreshToken;
            const data = await validateBody(RefreshTokenDTO, { refreshToken });
            const result = await this.authService.refreshAccessToken(data.refreshToken);
            setAccessTokenCookie(res, result.token);
            res.status(200).json({
                message: "success"
            });
        } catch (error) {
            return next(error);
        }
    }
}

export const authController = new AuthController(authService)