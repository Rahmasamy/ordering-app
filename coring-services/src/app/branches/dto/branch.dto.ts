import {IsString, IsNotEmpty, IsNumber, IsInt, Min, IsEnum, IsBoolean, IsOptional} from "class-validator";
import  { Currency } from "../entity/branch.enum.js";

export class CreateBranchDTO {
    @IsString()
    @IsNotEmpty()
    countryCode!: string;

    @IsString()
    @IsNotEmpty()
    label!: string;

    @IsString()
    @IsNotEmpty()
    addressText!: string;

    @IsNumber()
    lat!: number;

    @IsNumber()
    lng!: number;

    @IsString()
    opensAt!: string;

    @IsString()
    closesAt!: string;

    @IsInt()
    @Min(0)
    deliveryRadius!: number;

    @IsEnum(Currency)
    currency!: Currency
}

export class UpdateBranchDTO {
    @IsString()
    @IsOptional()
    label?: string;

    @IsString()
    @IsOptional()
    addressText?: string;

    @IsNumber()
    @IsOptional()
    lat?: number;

    @IsNumber()
    @IsOptional()
    lng?: number;

    @IsString()
    @IsOptional()
    opensAt?: string;

    @IsString()
    @IsOptional()
    closesAt?: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    deliveryRadius?: number;

    @IsEnum(Currency)
    @IsOptional()
    currency?: Currency;

    @IsBoolean()
    @IsOptional()
    acceptOrders?: boolean;
}

export class UpdateBranchStatusDTO {
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsInt()
    @Min(0)
    @IsOptional()
    commission?: number;
}