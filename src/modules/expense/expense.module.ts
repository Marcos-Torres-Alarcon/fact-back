import { Module } from '@nestjs/common'
import { ExpenseService } from './expense.service'
import { ExpenseController } from './expense.controller'
import { ExpenseSchema } from './entities/expense.entity'
import { Expense } from './entities/expense.entity'
import { MongooseModule } from '@nestjs/mongoose'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
    EmailModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
