import { Types } from 'mongoose'

export interface IUser {
  _id: Types.ObjectId
  email: string
  role: 'ADMIN' | 'COMPANY' | 'PROVIDER' | 'USER' | 'ADMIN2' | 'COLABORADOR'
  companyId?: Types.ObjectId
  providerId?: Types.ObjectId
  firstName?: string
  lastName?: string
  roles?: string[]
}
