import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CompanyController } from './company.controller'
import { CompanyService } from './company.service'
import { Company, CompanySchema } from './entities/company.entity'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    UsersModule
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
