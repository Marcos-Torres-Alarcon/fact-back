import { Request } from 'express'
import { UserRole } from '../enums/role.enum'

export interface IUser {
  _id: string
  role: UserRole
  companyId: string
}

export interface IRequest extends Request {
  user: IUser
}
