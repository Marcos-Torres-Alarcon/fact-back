import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Company, CompanyDocument } from './entities/company.entity'
import { UserRole } from '../users/enums/user-role.enum'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { v4 as uuidv4 } from 'uuid'
import { UsersService } from '../users/services/users.service'

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: Model<CompanyDocument>,
    private readonly usersService: UsersService
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    // Verificar si ya existe una compañía con el mismo email o taxId
    const existingCompany = await this.companyModel.findOne({
      $or: [
        { email: createCompanyDto.email },
        { taxId: createCompanyDto.taxId }
      ]
    })

    if (existingCompany) {
      throw new ConflictException('Ya existe una compañía con el mismo email o RFC')
    }

    // Crear la compañía
    const company = new this.companyModel(createCompanyDto)
    const savedCompany = await company.save()

    // Crear usuario administrador para la compañía
    const userDto: CreateUserDto = {
      _id: uuidv4(),
      userId: uuidv4(),
      firstName: createCompanyDto.name.split(' ')[0] || 'Admin',
      lastName: createCompanyDto.name.split(' ').slice(1).join(' ') || 'Company',
      email: createCompanyDto.email,
      password: createCompanyDto.password,
      role: UserRole.COMPANY,
      companyId: savedCompany._id.toString()
    }

    await this.usersService.create(userDto)

    return savedCompany
  }

  async findAll(user: any): Promise<Company[]> {
    // Si es ADMIN, puede ver todas las compañías
    if (user.role === UserRole.ADMIN) {
      return this.companyModel.find().exec()
    }

    // Si es COMPANY, solo puede ver su propia compañía
    if (user.role === UserRole.COMPANY) {
      return this.companyModel.find({ _id: user.companyId }).exec()
    }

    // Si es PROVIDER, no puede ver compañías
    if (user.role === UserRole.PROVIDER) {
      throw new BadRequestException('No tienes permisos para ver compañías')
    }

    return []
  }

  async findOne(id: string, user: any): Promise<Company> {
    const company = await this.companyModel.findById(id).exec()
    if (!company) {
      throw new NotFoundException(`Compañía con ID ${id} no encontrada`)
    }

    // Verificar permisos
    if (user.role === UserRole.ADMIN) {
      return company
    }

    if (user.role === UserRole.COMPANY && company._id.toString() === user.companyId) {
      return company
    }

    throw new BadRequestException('No tienes permisos para ver esta compañía')
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: any): Promise<Company> {
    const company = await this.companyModel.findById(id).exec()
    if (!company) {
      throw new NotFoundException(`Compañía con ID ${id} no encontrada`)
    }

    // Verificar permisos
    if (user.role === UserRole.ADMIN) {
      // El ADMIN puede actualizar cualquier compañía
    } else if (user.role === UserRole.COMPANY && company._id.toString() === user.companyId) {
      // El COMPANY solo puede actualizar sus datos básicos
      const allowedFields = ['name', 'email', 'phone', 'address']
      Object.keys(updateCompanyDto).forEach(key => {
        if (!allowedFields.includes(key)) {
          throw new BadRequestException(`No tienes permisos para actualizar el campo ${key}`)
        }
      })
    } else {
      throw new BadRequestException('No tienes permisos para actualizar esta compañía')
    }

    const updatedCompany = await this.companyModel
      .findByIdAndUpdate(id, updateCompanyDto, { new: true })
      .exec()

    return updatedCompany
  }

  async remove(id: string, user: any): Promise<void> {
    // Solo el ADMIN puede eliminar compañías
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('No tienes permisos para eliminar compañías')
    }

    const result = await this.companyModel.findByIdAndDelete(id).exec()
    if (!result) {
      throw new NotFoundException(`Compañía con ID ${id} no encontrada`)
    }
  }
}
