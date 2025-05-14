import { Module } from '@nestjs/common'
import { ExpenseService } from './expense.service'
import { ExpenseController } from './expense.controller'
import { ExpenseSchema } from './entities/expense.entity'
import { Expense } from './entities/expense.entity'
import { MongooseModule } from '@nestjs/mongoose'
import { EmailModule } from '../email/email.module'
import { CategoryModule } from '../category/category.module'
import { ProjectModule } from '../project/project.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
    EmailModule,
    CategoryModule,
    ProjectModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
