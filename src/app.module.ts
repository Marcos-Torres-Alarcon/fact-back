import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './modules/user/user.module'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { MongooseModule } from '@nestjs/mongoose'
import { RoleModule } from './modules/role/role.module'
import { CompanyModule } from './modules/company/company.module'
import { ClientModule } from './modules/client/client.module'
import { ProjectModule } from './modules/project/project.module'
import { JobModule } from './modules/job/job.module'
import { InvoiceModule } from './modules/invoice/invoice.module'
import { PaymentModule } from './modules/payment/payment.module'
import { PurchaseOrderModule } from './modules/purchase-order/purchase-order.module'
import { ProvidersModule } from './modules/providers/providers.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    UserModule,
    RoleModule,
    CompanyModule,
    ClientModule,
    ProjectModule,
    JobModule,
    InvoiceModule,
    PaymentModule,
    PurchaseOrderModule,
    ProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
