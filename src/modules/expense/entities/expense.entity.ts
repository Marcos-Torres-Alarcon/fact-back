import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ExpenseStatus = 'pending' | 'approved' | 'rejected'

export interface ExpenseDocument extends Document {
  proyectId: Types.ObjectId
  total: number
  description: string
  categoryId: Types.ObjectId
  file: string
  data: string
  status?: ExpenseStatus
  statusDate?: Date
  approvedBy?: string
  rejectedBy?: string
  rejectionReason?: string
  companyId: string
  fechaEmision?: Date
}

export interface GetExpenseDocument extends ExpenseDocument {
  _id: string
}

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  proyectId: Types.ObjectId

  @Prop()
  total: number

  @Prop()
  description: string

  @Prop({ required: true, type: Types.ObjectId, ref: 'Category' })
  categoryId: Types.ObjectId

  @Prop({ required: true })
  file: string

  @Prop()
  data: string

  @Prop({ default: 'pending' })
  status: ExpenseStatus

  @Prop()
  statusDate: Date

  @Prop()
  approvedBy: string

  @Prop()
  rejectedBy: string

  @Prop()
  rejectionReason: string

  @Prop()
  createdBy: string

  @Prop({ type: 'ObjectId', ref: 'Company', required: true })
  companyId: string

  @Prop({ type: Date, required: false })
  fechaEmision?: Date
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense)
