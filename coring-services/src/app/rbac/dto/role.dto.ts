import {IsString, IsNotEmpty, IsOptional, IsArray, IsInt, Min, IsBoolean} from "class-validator";

export class CreateRoleDTO {
    @IsString()
    @IsNotEmpty()
    displayName!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    permissionIds?: number[];
}

export class TogglePermissionDTO {
    @IsInt()
    @Min(1)
    permissionId!: number;

    @IsBoolean()
    enabled!: boolean;
}
