import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNumber, IsArray, ValidateNested, IsMongoId, Min, IsNotEmpty, IsOptional } from 'class-validator'
import { Type } from 'class-transformer'
import { PurchaseOrderStatus } from '../entities/purchase-order.entity'

class PurchaseOrderItemDto {
  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'Cantidad del producto' })
  @IsNumber()
  @Min(1)
  quantity: number

  @ApiProperty({ description: 'Precio unitario del producto' })
  @IsNumber()
  @Min(0)
  unitPrice: number

  @ApiProperty({ description: 'Total del producto' })
  @IsNumber()
  @Min(0)
  total: number
}

export class UpdatePurchaseOrderDto {
  @ApiProperty({ description: 'Número de orden', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  orderNumber?: string

  @ApiProperty({ description: 'ID del proveedor', required: false })
  @IsMongoId()
  @IsOptional()
  provider?: string

  @ApiProperty({ description: 'ID del proyecto', required: false })
  @IsMongoId()
  @IsOptional()
  project?: string

  @ApiProperty({ description: 'Detalles de los productos', type: [PurchaseOrderItemDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  @IsOptional()
  items?: PurchaseOrderItemDto[]

  @ApiProperty({ description: 'Total de la orden', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAmount?: number

  @ApiProperty({ description: 'Estado de la orden', enum: PurchaseOrderStatus, required: false })
  @IsOptional()
  status?: PurchaseOrderStatus
}
