import { IsEmail, IsEnum, IsString, Length } from "class-validator";
import { SystemRole } from "../../user/entity/enum.js";

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
}
