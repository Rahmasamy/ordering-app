import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, Length } from "class-validator";

export class CreateCustomerAddressDTO {
  @IsOptional()
  @IsString({ message: "Label must be a string" })
  @Length(2, 100, { message: "Label must be between 2 and 100 characters" })
  label?: string;

  @IsNumber({}, { message: "Latitude must be a number" })
  lat!: number;

  @IsNumber({}, { message: "Longitude must be a number" })
  lng!: number;

  @IsString({ message: "Country must be a string" })
  country!: string;

  @IsString({ message: "City must be a string" })
  city!: string;

  @IsString({ message: "Street must be a string" })
  street!: string;

  @IsOptional()
  @IsString({ message: "Building must be a string" })
  building?: string;

  @IsOptional()
  @IsString({ message: "Apartment number must be a string" })
  apartmentNumber?: string;

  @IsEnum(['home', 'office', 'public_place'], {
    message: "Type must be one of: home, office, public_place"
  })
  type!: 'home' | 'office' | 'public_place';

  @IsOptional()
  @IsBoolean({ message: "isDefault must be a boolean" })
  isDefault?: boolean;
}

export class UpdateCustomerAddressDTO {
  @IsOptional()
  @IsString({ message: "Label must be a string" })
  @Length(2, 100, { message: "Label must be between 2 and 100 characters" })
  label?: string;

  @IsOptional()
  @IsNumber({}, { message: "Latitude must be a number" })
  lat?: number;

  @IsOptional()
  @IsNumber({}, { message: "Longitude must be a number" })
  lng?: number;

  @IsOptional()
  @IsString({ message: "Country must be a string" })
  country?: string;

  @IsOptional()
  @IsString({ message: "City must be a string" })
  city?: string;

  @IsOptional()
  @IsString({ message: "Street must be a string" })
  street?: string;

  @IsOptional()
  @IsString({ message: "Building must be a string" })
  building?: string;

  @IsOptional()
  @IsString({ message: "Apartment number must be a string" })
  apartmentNumber?: string;

  @IsOptional()
  @IsEnum(['home', 'office', 'public_place'], {
    message: "Type must be one of: home, office, public_place"
  })
  type?: 'home' | 'office' | 'public_place';

  @IsOptional()
  @IsBoolean({ message: "isDefault must be a boolean" })
  isDefault?: boolean;
}
