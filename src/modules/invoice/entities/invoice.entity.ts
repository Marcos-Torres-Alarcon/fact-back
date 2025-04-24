import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

export interface InvoiceDocument extends Document {
  correlativo: string
  fechaEmision: string
  moneda: string
  montoTotal: number
  rucEmisor: string
  serie: string
  tipoComprobante: string
  state: string
}

export interface GetInvoiceDocument extends InvoiceDocument {
  _id: string
}

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true })
  correlativo: string

  @Prop({ required: true })
  fechaEmision: string

  @Prop({ required: true })
  moneda: string

  @Prop({ required: true })
  montoTotal: number

  @Prop({ required: true })
  rucEmisor: string

  @Prop({ required: true })
  serie: string

  @Prop({ required: true })
  tipoComprobante: string

  @Prop({ required: true })
  state: string

}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice)
