import { IsString } from "class-validator"

import { IsNotEmpty } from "class-validator"

export class CreateExpenseDto {
    @IsString()
    @IsNotEmpty()
    proyect: string
    @IsString()
    @IsNotEmpty()
    category: string
    @IsString()
    @IsNotEmpty()
    imageUrl: string
}
