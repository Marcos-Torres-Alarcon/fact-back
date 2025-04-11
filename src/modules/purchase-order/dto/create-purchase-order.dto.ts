import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDate,
  IsEnum,
  IsMongoId,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
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

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'Número de orden' })
  @IsString()
  @IsNotEmpty()
  orderNumber: string

  @ApiProperty({ description: 'ID del proveedor' })
  @IsMongoId()
  provider: string

  @ApiProperty({ description: 'ID del proyecto' })
  @IsMongoId()
  project: string

  @ApiProperty({ description: 'Detalles de los productos', type: [PurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[]

  @ApiProperty({ description: 'Total de la orden' })
  @IsNumber()
  @Min(0)
  totalAmount: number

  @ApiProperty({ description: 'Estado de la orden', enum: PurchaseOrderStatus, default: PurchaseOrderStatus.PENDING })
  @IsOptional()
  status?: PurchaseOrderStatus = PurchaseOrderStatus.PENDING
}
