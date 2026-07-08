import {
    IsString, IsNotEmpty, IsOptional, IsNumber, IsInt, Min, Max, IsArray, ValidateNested
} from "class-validator";
import {Type} from "class-transformer";

export class CreateChefDTO {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    quote?: string;
}

export class CreateStoryDTO {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    content!: string;

    @IsOptional()
    @IsString()
    featuredQuote?: string;

    @IsOptional()
    @IsInt()
    chefId?: number;

    @IsOptional()
    @ValidateNested()
    @Type(() => CreateChefDTO)
    chef?: CreateChefDTO;
}

export class UpdateStoryDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    content?: string;

    @IsOptional()
    @IsString()
    featuredQuote?: string;

    @IsOptional()
    @IsInt()
    chefId?: number;
}

export class CreateIngredientDTO {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class UpdateIngredientDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class CreateIngredientBatchDTO {
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => CreateIngredientDTO)
    ingredients!: CreateIngredientDTO[];
}

export class CreateTestimonialDTO {
    @IsString()
    @IsNotEmpty()
    content!: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsString()
    authorName?: string;
}

export class UpdateTestimonialDTO {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    content?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsString()
    authorName?: string;
}
