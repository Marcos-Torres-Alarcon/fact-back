import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { ApiProperty } from '@nestjs/swagger'

export interface ExpenseDocument extends Document {
    proyect: string
    total: number
    description: string
    category: string
    file: string
    data: string
}

export interface GetExpenseDocument extends ExpenseDocument {
    _id: string

}

@Schema({ timestamps: true })
export class Expense {
    @ApiProperty({
        description: 'Nombre del proyecto',
        example: 'Proyecto 1',
    })
    @Prop({ required: true })
    proyect: string

    @ApiProperty({
        description: 'Total de la factura',
        example: '1000',
        required: false,
    })
    @Prop()
    total: number

    @ApiProperty({
        description: 'Descripción de la factura',
        example: 'Factura 1',
    })
    @Prop()
    description: string

    @ApiProperty({
        description: 'Categoría de la factura',
        example: 'Transporte',
    })
    @Prop({ required: true })
    category: string

    @ApiProperty({
        description: 'URL del archivo',
        example: 'https://www.empresacliente.com',
    })
    @Prop({ required: true })
    file: string

    @ApiProperty({
        description: 'Datos de la factura',
        example: 'Datos de la factura',
    })
    @Prop()
    data: string

}

export const ExpenseSchema = SchemaFactory.createForClass(Expense)
