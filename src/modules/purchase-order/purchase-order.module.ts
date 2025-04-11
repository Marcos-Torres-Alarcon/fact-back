import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PurchaseOrderService } from './purchase-order.service'
import { PurchaseOrderController } from './purchase-order.controller'
import { PurchaseOrder, PurchaseOrderSchema } from './entities/purchase-order.entity'
import { ProvidersModule } from '../providers/providers.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PurchaseOrder.name, schema: PurchaseOrderSchema }
    ]),
    ProvidersModule
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService]
})
export class PurchaseOrderModule {}
