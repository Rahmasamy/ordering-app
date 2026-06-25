import type { NextFunction, Request, Response } from "express";
import { sendSuccessResponse } from "../../../lib/http/response.js";
import { authService, AuthService } from "../service/auth.service.js";
import { ForgetPaaaswordDTO, LoginDTO, RefreshTokenDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto.js";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../utils.js";
import { validateBody } from "../../../lib/validation/validate.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";

@injectable()
export class AuthController {
  constructor(@inject(TOKENS.AuthService) private readonly authService: AuthService) {}
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await validateBody(RegisterDTO, req.body);
      const result = await this.authService.register(data);
      sendSuccessResponse(res, result, 201);
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
            sendSuccessResponse(res, result);
        } catch (error) {
            return next(error);
        }
    }
    forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
     try {
        // validate body    
        const data = await validateBody(ForgetPaaaswordDTO, req.body);
        const result = await this.authService.forgetPassword(data);
        sendSuccessResponse(res, {
            "message ": "Email has been sent successfully!"
        });
        } catch (error) {   
            return next(error);
        }
    }


     acceptInvite = async(req: Request, res: Response, next: NextFunction) => {
        try{
            const data = await validateBody(ResetPasswordDTO, req.body);
            await this.authService.acceptInvite(data);
            sendSuccessResponse(res, {
                "message": "Invitation accepted successfully, please login again",
            });
        }
        catch(err) {
            next(err);
        }
    }

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // validate body
            const data = await validateBody(ResetPasswordDTO, req.body);
            await this.authService.resetPassword(data);
            sendSuccessResponse(res, {
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
            sendSuccessResponse(res, {
                message: "success"
            });
        } catch (error) {
            return next(error);
        }
    }
}

export const authController = new AuthController(authService)