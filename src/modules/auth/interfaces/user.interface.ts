import { Types } from 'mongoose'

export interface IUser {
  _id: Types.ObjectId
  email: string
  role: 'ADMIN' | 'COMPANY' | 'PROVIDER'
  companyId?: Types.ObjectId
  providerId?: Types.ObjectId
  firstName?: string
  lastName?: string
}
