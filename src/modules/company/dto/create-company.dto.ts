import { IsString, IsNotEmpty } from "class-validator";

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    comercialName: string;
    @IsString()
    @IsNotEmpty()
    businessName: string;
    @IsString()
    @IsNotEmpty()
    businessId: string; //ruc
    @IsString()
    address: string;
    @IsString()
    phone: string;
    @IsString()
    email: string;
    @IsString()
    logo: string;
}
