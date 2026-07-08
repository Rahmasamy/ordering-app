import {
    IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsDateString
} from "class-validator";

export class CreateOfferDTO {
    @IsString()
    @IsNotEmpty()
    badgeText!: string;

    @IsString()
    @IsNotEmpty()
    imageUrl!: string;

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsString()
    @IsNotEmpty()
    promoCode!: string;

    @IsDateString()
    expiresAt!: string;

    @IsOptional()
    @IsInt()
    productId?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateOfferDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    badgeText?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    promoCode?: string;

    @IsOptional()
    @IsDateString()
    expiresAt?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
