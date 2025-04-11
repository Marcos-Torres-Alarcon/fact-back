import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import { Provider, ProviderDocument } from './entities/provider.entity'
import { UserRole } from '../auth/enums/user-role.enum'
import { UserService } from '../user/user.service'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { v4 as uuidv4 } from 'uuid'

interface RequestUser {
  _id: string;
  role: UserRole;
  company?: string;
  companyId?: string;
  providerId?: string;
}

@Injectable()
export class ProviderService {
  constructor(
    @InjectModel(Provider.name)
    private providerModel: Model<ProviderDocument>,
    private userService: UserService
  ) {}

  async create(createProviderDto: CreateProviderDto, companyId: string): Promise<Provider> {
    // Verificar si ya existe un proveedor con el mismo email o taxId
    const existingProvider = await this.providerModel.findOne({
      $or: [
        { email: createProviderDto.email },
        { taxId: createProviderDto.taxId }
      ]
    })

    if (existingProvider) {
      throw new BadRequestException('Ya existe un proveedor con este email o NIT')
    }

    // Crear el proveedor
    const provider = new this.providerModel({
      ...createProviderDto,
      companyId
    })
    const savedProvider = await provider.save()

    // Crear usuario administrador para el proveedor
    const userDto: CreateUserDto = {
      firstName: createProviderDto.name,
      lastName: 'Admin',
      email: createProviderDto.email,
      password: createProviderDto.password,
      role: UserRole.PROVIDER,
      userId: uuidv4(),
      isActive: true,
      createdBy: companyId
    }

    await this.userService.create(userDto)

    return savedProvider
  }

  async findAll(user: any): Promise<Provider[]> {
    // Si es ADMIN, puede ver todos los proveedores
    if (user.role === UserRole.ADMIN) {
      return this.providerModel.find()
    }

    // Si es COMPANY, solo puede ver sus proveedores
    if (user.role === UserRole.COMPANY) {
      return this.providerModel.find({ companyId: user.userId })
    }

    // Si es PROVIDER, solo puede ver su propio proveedor
    if (user.role === UserRole.PROVIDER) {
      return this.providerModel.find({ _id: user.userId })
    }

    return []
  }

  async findOne(id: string, user: any): Promise<Provider> {
    const provider = await this.providerModel.findById(id)
    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado')
    }

    // Verificar permisos
    if (user.role === UserRole.ADMIN) {
      return provider
    }

    if (user.role === UserRole.COMPANY && provider.companyId === user.userId) {
      return provider
    }

    if (user.role === UserRole.PROVIDER && provider._id.toString() === user.userId) {
      return provider
    }

    throw new ForbiddenException('No tienes permisos para ver este proveedor')
  }

  async findByTaxId(taxId: string, user: any): Promise<Provider[]> {
    // Si es ADMIN, puede buscar por NIT
    if (user.role === UserRole.ADMIN) {
      return this.providerModel.find({ taxId })
    }

    // Si es COMPANY, solo puede buscar en sus proveedores
    if (user.role === UserRole.COMPANY) {
      return this.providerModel.find({ taxId, companyId: user.userId })
    }

    // Si es PROVIDER, no puede buscar por NIT
    if (user.role === UserRole.PROVIDER) {
      throw new ForbiddenException('No tienes permisos para buscar por NIT')
    }

    return []
  }

  async findByProject(project: string, user: any): Promise<Provider[]> {
    // Si es ADMIN, puede buscar por proyecto
    if (user.role === UserRole.ADMIN) {
      return this.providerModel.find({ 'products.project': project })
    }

    // Si es COMPANY, solo puede buscar en sus proveedores
    if (user.role === UserRole.COMPANY) {
      return this.providerModel.find({ 
        'products.project': project,
        companyId: user.userId 
      })
    }

    // Si es PROVIDER, no puede buscar por proyecto
    if (user.role === UserRole.PROVIDER) {
      throw new ForbiddenException('No tienes permisos para buscar por proyecto')
    }

    return []
  }

  async update(id: string, updateProviderDto: UpdateProviderDto, user: any): Promise<Provider> {
    const provider = await this.providerModel.findById(id)
    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado')
    }

    // Verificar permisos
    if (user.role === UserRole.ADMIN) {
      // El ADMIN puede actualizar cualquier proveedor
    } else if (user.role === UserRole.COMPANY && provider.companyId === user.userId) {
      // El COMPANY solo puede actualizar sus proveedores
    } else if (user.role === UserRole.PROVIDER && provider._id.toString() === user.userId) {
      // El PROVIDER solo puede actualizar sus datos básicos
      const allowedFields = ['name', 'email', 'phone', 'address']
      Object.keys(updateProviderDto).forEach(key => {
        if (!allowedFields.includes(key)) {
          throw new ForbiddenException(`No tienes permisos para actualizar el campo ${key}`)
        }
      })
    } else {
      throw new ForbiddenException('No tienes permisos para actualizar este proveedor')
    }

    const updatedProvider = await this.providerModel
      .findByIdAndUpdate(id, updateProviderDto, { new: true })

    return updatedProvider
  }

  async remove(id: string, user: any): Promise<void> {
    const provider = await this.providerModel.findById(id)
    if (!provider) {
      throw new NotFoundException('Proveedor no encontrado')
    }

    // Solo el ADMIN o la COMPANY propietaria puede eliminar proveedores
    if (user.role === UserRole.ADMIN) {
      // El ADMIN puede eliminar cualquier proveedor
    } else if (user.role === UserRole.COMPANY && provider.companyId === user.userId) {
      // El COMPANY solo puede eliminar sus proveedores
    } else {
      throw new ForbiddenException('No tienes permisos para eliminar este proveedor')
    }

    await this.providerModel.findByIdAndDelete(id)
  }
}
