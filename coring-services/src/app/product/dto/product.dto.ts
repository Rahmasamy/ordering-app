import { IsString, IsOptional, IsNotEmpty, IsNumber, IsBoolean } from "class-validator";

export class CreateProductDTO {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    categoryName?: string;
}

export class UpdateProductDTO {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsString()
    @IsOptional()
    categoryName?: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsNumber()
    @IsOptional()
    stock?: number;

    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;
}

export interface BranchProductDto {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    restaurantId: number;
    categoryId: number;
    categoryName: string;
    price: number;
    stock: number;
    isAvailable: boolean;
}

export interface ProductDto {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    restaurantId: number;
    categoryId: number;
    createdAt: string;
    updatedAt: string;
}
