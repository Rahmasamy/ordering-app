import { SystemRole } from "../../user/entity/enum.js";
import {
  createUserIfNotExists,
  findIfUserExists,
  selectUserByEmail,
} from "../../user/repo/user.repo.js";
import type {
  ForgetPaaaswordDTO,
  LoginDTO,
  RegisterDTO,
  ResetPasswordDTO,
  RestaurantUserRegisterDTO,
} from "../dto/auth.dto.js";
import {
  InvalidCredentialsError,
  InvalidOTPError,
  NoUserFounderror,
  RestaurantInvalidDataError,
  unAuthorizedRegisterationError,
  UserAlreadyExistsError,
} from "../error.js";
import {
  comparePassword,
  generateRefreshToken,
  generateToken,
  hashPassword,
  verifyOTP,
} from "../utils.js";
import {
  consumePasswordReset,
  createPasswordReset,
  findPasswordResetByUserId,
  updatePassword,
} from "../repo/auth.repo.js";
import jwt from "jsonwebtoken";
import { env } from "../../../common/config/env.config.js";
import { restaurantService, RestaurantService } from "../../restaurant/service/restaurant.service.js";
import { da } from "zod/locales";
import { db } from "../../../common/knex/knex.js";

export class AuthService {
  constructor(private readonly resautrantService : RestaurantService){}
  register = async (data: RegisterDTO) => {
    // check if user exists
    if (data.SystemRole === SystemRole.SYSTEM_ADMIN) {
      throw unAuthorizedRegisterationError;
    }
    const userExists = await findIfUserExists(data.email, data.phone);
    if (userExists) {
      throw UserAlreadyExistsError;
    }
    // hash password
    const hashedPassword = await hashPassword(data.password);
    // create user
    const now = new Date();
    let user;
    let restaurant;
    const trx = await db.transaction()
    try {
      user = await createUserIfNotExists(
       
        {
      email: data.email,
      phone: data.phone,
      name: data.name,
      password_hash: hashedPassword,
      system_role: data.SystemRole,
      created_at: now,
      updated_at: now,
    },trx
  );
     // if user of type resturant user, create resturant as well 
      if(data.SystemRole === SystemRole.RESTAURANT_USER) {
       if(!data.restaurnat) {
        throw RestaurantInvalidDataError;
       }
       restaurant = await this.resautrantService.create(Number(user.id),{
        restaurantName:data.restaurnat?.restaurantName,
        primaryCountry:data.restaurnat?.primaryCountry,
        logoUrl:data.restaurnat?.logoUrl
       } as RestaurantUserRegisterDTO ,trx)
    }
    await trx.commit()
    } catch(error) {
      await trx.rollback()
      console.log(error)
      throw error;
    }
    
   

  
    // generate token and refresh token
    const tokenPayload = {
      userId: user?.id,
      SystemRole: user?.system_role,
      email: user?.email,
    };
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        system_role: user.system_role,
      },
      restaurant:data.SystemRole === SystemRole.RESTAURANT_USER ? restaurant : undefined
    };
  };
  login = async (data: LoginDTO) => {
    // check if user exists
    const user = await selectUserByEmail(data.email);
    if (!user) {
      throw NoUserFounderror;
    }
    // verify password
    const isMatch = await comparePassword(data.password, user.password_hash);
    if (!isMatch) {
      throw InvalidCredentialsError;
    }
    // generate token and refresh token
    const tokenPayload = {
      userId: user.id,
      SystemRole: user.system_role,
      email: user.email,
    };
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        system_role: user.system_role,
      },
    };
  };
  forgetPassword = async (data: ForgetPaaaswordDTO) => {
    const user = await selectUserByEmail(data.email);
    if (!user) {
      return;
    }
    // Create password reset record and generate OTP
    const { otp } = await createPasswordReset(user.id);

    console.log(`email mocked sended successfully! ${otp}`);
  };
  resetPassword = async (data: ResetPasswordDTO) => {
    // find user by email
    const user = await selectUserByEmail(data.email);
    if (!user) {
      throw InvalidOTPError;
    }
    // find password reset record by user id
    const passwordReset = await findPasswordResetByUserId(user.id);
    if (!passwordReset || passwordReset.isExpired()) {
      throw InvalidOTPError;
    }
    // verify otp
    const isValidOTP = await verifyOTP(data.otp, passwordReset.otp_hash);
    if (!isValidOTP) {
      throw InvalidOTPError;
    }
    // consume password reset code
    await consumePasswordReset(passwordReset.id);

    // hash new password
    const hashedPassword = await hashPassword(data.newPassword);

    // update user password
    await updatePassword(user.id, hashedPassword);

    // update password reset consumed at
    await consumePasswordReset(passwordReset.id);
  };

  refreshAccessToken = async (refreshToken: string) => {
    // Verify refresh token
    if (!refreshToken) {
      throw InvalidCredentialsError;
    }
    const decoded = jwt.verify(
      refreshToken,
      env.auth.refreshTokenSecret,
    ) as jwt.JwtPayload;

    // Generate new access token
    const tokenPayload = {
      userId: decoded.userId,
      SystemRole: decoded.SystemRole,
      email: decoded.email,
    };
    const newAccessToken = generateToken(tokenPayload);

    return {
      token: newAccessToken,
    };
  };
}

export const authService = new AuthService(restaurantService);
