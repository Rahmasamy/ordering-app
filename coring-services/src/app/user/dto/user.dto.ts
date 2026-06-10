import { IsString, Length, IsOptional } from "class-validator";

export class UpdateUserDTO {
  @IsOptional()
  @IsString({ message: "Name must be a string" })
  @Length(2, 50, { message: "Name must be between 2 and 50 characters" })
  name?: string;

  @IsOptional()
  @IsString({ message: "Phone must be a string" })
  @Length(9, 15, { message: "Phone number must be between 9 and 15 characters" })
  phone?: string;
}
