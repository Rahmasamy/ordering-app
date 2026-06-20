import { IsEmail, IsEnum, IsOptional, IsString, Length, MinLength, ValidateNested } from "class-validator";
import { SystemRole } from "../../user/entity/enum.js";
import { Type } from "class-transformer";

export class RegisterDTO {
  @IsEmail({}, { message: "Invalid email address" })
  email!: string;

  @Length(9, 15, {
    message: "Phone number must be between 9 and 15 characters",
  })
  phone!: string;
  @IsString()
  @Length(2, 50, { message: "Name must be between 2 and 50 characters" })
  name!: string;
  @IsString()
  @Length(8, 50, { message: "Password must be between 8 and 50 characters" })
  password!: string;
 
  @IsEnum(SystemRole, { message: "Invalid system role" })
  SystemRole!:SystemRole;

  @IsOptional()
  @ValidateNested()
  @Type(() => RestaurantUserRegisterDTO)
  restaurnat?: RestaurantUserRegisterDTO;
}

export class LoginDTO {
    @IsEmail({}, { message: "Invalid email address" })
    email!: string;

    @IsString()
    @Length(8, 50, { message: "Password must be between 8 and 50 characters" })
    password!: string;
}

export class ForgetPaaaswordDTO {
    @IsEmail()
    email!:string;
}

export class ResetPasswordDTO {
 @IsEmail()
  email!:string;

  @IsString()
 
  otp!: string;

    @Length(8, 50, { message: "Password must be between 8 and 50 characters" })
  newPassword!: string;


}

export class RefreshTokenDTO {
    @IsString()
    refreshToken!: string;
}

export class RestaurantUserRegisterDTO {
    @IsString()
    @MinLength(2, { message: "Restaurant name must be at least 2 characters long" })
    restaurantName!: string;


    @IsOptional()
    @IsString()
    logoUrl?: string;

    @IsString()
    primaryCountry!: string;

}