import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema, Types } from 'mongoose'

export interface ProviderDocument {
    userId: Types.ObjectId
    name: string
    description: string
    image: string
    address: string
    phone: string
    whatsapp: string
    email: string
    logo: string
    lat: number
    lng: number
    isActive: boolean
    notes?: string
}

export interface GetProviderDocument extends ProviderDocument {
    _id: Types.ObjectId
}

@Schema({ timestamps: true })
export class Provider {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: string

    @Prop({ required: true })
    name: string

    @Prop()
    description: string

    @Prop()
    image: string

    @Prop({ required: true })
    address: string

    @Prop({ required: true })
    phone: string

    @Prop()
    whatsapp: string

    @Prop({ required: true })
    email: string

    @Prop()
    logo: string

    @Prop()
    lat: number

    @Prop()
    lng: number

    @Prop({ default: true })
    isActive: boolean

    @Prop()
    notes?: string

    @Prop({ type: Date, default: Date.now })
    createdAt: Date

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date
}

export const ProviderSchema = SchemaFactory.createForClass(Provider)
