import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { Payment, PaymentSchema } from './entities/payment.entity'
import { InvoiceModule } from '../invoice/invoice.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    InvoiceModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
