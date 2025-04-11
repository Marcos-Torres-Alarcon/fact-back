import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { InvoiceController } from './invoice.controller'
import { InvoiceService } from './invoice.service'
import { Invoice, InvoiceSchema } from './entities/invoice.entity'
import { ProjectModule } from '../project/project.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]),
    ProjectModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
