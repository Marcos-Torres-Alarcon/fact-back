import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { MongooseModule } from '@nestjs/mongoose'
import { ProjectModule } from './modules/project/project.module'
import { InvoiceModule } from './modules/invoice/invoice.module'
import { ProvidersModule } from './modules/providers/providers.module'
import { EmailModule } from './modules/email/email.module'
import { ExpenseModule } from './modules/expense/expense.module'
import { CategoryModule } from './modules/category/category.module'
import { CompanyModule } from './modules/company/company.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    ProjectModule,
    InvoiceModule,
    ProvidersModule,
    EmailModule,
    ExpenseModule,
    CategoryModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
