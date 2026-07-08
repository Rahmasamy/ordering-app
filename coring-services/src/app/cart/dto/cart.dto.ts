import { IsInt, Min, IsOptional, IsString, IsArray } from 'class-validator';

export class AddToCartDTO {
    @IsInt()
    @Min(1)
    productId!: number;

    @IsInt()
    @Min(1)
    @IsOptional()
    quantity?: number;

    @IsString()
    @IsOptional()
    selectedDoneness?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    selectedAddons?: string[];
}
