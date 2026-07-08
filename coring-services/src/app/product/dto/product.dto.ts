import {IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, Min, IsBoolean} from "class-validator";

export class CreateProductDTO {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    categoryName?: string;

    @IsOptional()
    @IsBoolean()
    isTrending?: boolean;

    @IsOptional()
    @IsBoolean()
    isChefSpecial?: boolean;

    @IsOptional()
    @IsBoolean()
    isPopular?: boolean;

    @IsOptional()
    @IsInt()
    calories?: number;

    @IsOptional()
    @IsBoolean()
    isDairyFree?: boolean;

    @IsOptional()
    @IsBoolean()
    containsGluten?: boolean;

    @IsOptional()
    @IsInt()
    reviewsCount?: number;

    @IsOptional()
    @IsNumber()
    rating?: number;

    @IsOptional()
    imageUrls?: string[];

    @IsOptional()
    donenessOptions?: string[];

    @IsOptional()
    addons?: any[];

    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;
}

export class UpdateProductDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    categoryName?: string;

    @IsOptional()
    @IsBoolean()
    isTrending?: boolean;

    @IsOptional()
    @IsBoolean()
    isChefSpecial?: boolean;

    @IsOptional()
    @IsBoolean()
    isPopular?: boolean;

    @IsOptional()
    @IsInt()
    calories?: number;

    @IsOptional()
    @IsBoolean()
    isDairyFree?: boolean;

    @IsOptional()
    @IsBoolean()
    containsGluten?: boolean;

    @IsOptional()
    @IsInt()
    reviewsCount?: number;

    @IsOptional()
    @IsNumber()
    rating?: number;

    @IsOptional()
    imageUrls?: string[];

    @IsOptional()
    donenessOptions?: string[];

    @IsOptional()
    addons?: any[];

    // branch-level overrides (requires branchId query param)
    @IsOptional()
    @IsInt()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;
}

