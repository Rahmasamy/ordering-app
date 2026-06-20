import { IsString, IsEmail, MinLength, IsOptional, IsUrl, IsEnum, ValidateNested, IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";

export class CreateRestaurantOwnerDTO {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    phone!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @MinLength(6)
    password!: string;
}

export class CreateRestaurantDTO {
    @ValidateNested()
    @Type(() => CreateRestaurantOwnerDTO)
    @IsNotEmpty()
    owner!: CreateRestaurantOwnerDTO;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsUrl()
    @IsOptional()
    logoUrl?: string;

    @IsString()
    @IsNotEmpty()
    primaryCountry!: string;
}

export class UpdateRestaurantDTO {
    @IsString()
    @IsOptional()
    name?: string;

    @IsUrl()
    @IsOptional()
    logoUrl?: string;

    @IsString()
    @IsOptional()
    primaryCountry?: string;
}

export enum RestaurantStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    DISABLED = "disabled",
    PENDING = "pending"
}

export class UpdateRestaurantStatusDTO {
    @IsEnum(RestaurantStatus)
    status!: string;
}
