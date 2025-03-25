import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export interface ProviderDocument {
    userId: Types.ObjectId
    name: string
    description: string
    image: string
    address: string
    phone: string
    whatsapp: string
    email: string
    logo: String
    lat: number
    lng: number
}

export interface GetProviderDocument extends ProviderDocument {
    _id: Types.ObjectId
}


@Schema({ timestamps: true })
export class Provider {

    @Prop()
    name: string

    @Prop()
    description: string

    @Prop()
    image: string

    @Prop()
    address: string

    @Prop()
    string: string

    @Prop()
    phone: string

    @Prop()
    whatsapp: string

    @Prop()
    email: string

    @Prop()
    logo: string

    @Prop()
    lat: number

    @Prop()
    lng: number

    @Prop({ default: true })
    active: boolean

}

export const ProviderSchema = SchemaFactory.createForClass(Provider)