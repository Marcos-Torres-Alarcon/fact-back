import {
  Injectable,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Provider } from './entities/provider.entity'
import {
  IProvider,
  CreateProviderDTO,
  UpdateProviderDTO,
} from '../../shared/interfaces/provider.interface'
import { BcryptService } from '../../shared/services/bcrypt.service'
import { Document } from 'mongoose'

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger(ProvidersService.name)

  constructor(
    @InjectModel(Provider.name)
    private providerModel: Model<Provider>,
    private readonly bcryptService: BcryptService
  ) {}

  private toIProvider(doc: Provider & Document): IProvider {
    const provider = doc.toObject()
    return {
      ...provider,
      _id: provider._id.toString(),
      companyId: provider.companyId ? provider.companyId.toString() : null,
    }
  }

  async create(createProviderDto: CreateProviderDTO): Promise<IProvider> {
    this.logger.debug(
      `Creando proveedor con datos: ${JSON.stringify(createProviderDto)}`
    )

    const existingProvider = await this.providerModel
      .findOne({ email: createProviderDto.email })
      .exec()
    if (existingProvider) {
      this.logger.warn(
        `Ya existe un proveedor con el email: ${createProviderDto.email}`
      )
      throw new ConflictException('Ya existe un proveedor con este email')
    }

    if (!createProviderDto.companyId) {
      this.logger.warn('El companyId es requerido para crear un proveedor')
      throw new BadRequestException('El companyId es requerido')
    }

    const hashedPassword = await this.bcryptService.hash(
      createProviderDto.password
    )
    const providerData = {
      ...createProviderDto,
      password: hashedPassword,
      companyId: createProviderDto.companyId,
    }

    this.logger.debug(
      `Datos del proveedor antes de guardar: ${JSON.stringify(providerData)}`
    )

    const createdProvider = new this.providerModel(providerData)
    const savedProvider = await createdProvider.save()

    this.logger.debug(
      `Proveedor creado exitosamente: ${JSON.stringify(savedProvider)}`
    )

    return this.toIProvider(savedProvider)
  }

  async update(
    id: string,
    updateProviderDto: UpdateProviderDTO
  ): Promise<IProvider> {
    if (updateProviderDto.password) {
      updateProviderDto.password = await this.bcryptService.hash(
        updateProviderDto.password
      )
    }
    const updatedProvider = await this.providerModel
      .findByIdAndUpdate(id, updateProviderDto, { new: true })
      .exec()
    return this.toIProvider(updatedProvider)
  }

  async findById(id: string): Promise<IProvider> {
    const provider = await this.providerModel.findById(id).exec()
    return provider ? this.toIProvider(provider) : null
  }

  async findByCompanyId(companyId: string): Promise<IProvider[]> {
    this.logger.debug(
      `findByCompanyId - Searching for providers with companyId: ${companyId}`
    )
    try {
      if (!companyId) {
        this.logger.warn('companyId es undefined o null')
        return []
      }

      const providers = await this.providerModel.find({ companyId }).exec()
      this.logger.debug(`findByCompanyId - Found ${providers.length} providers`)
      this.logger.debug(
        `findByCompanyId - Providers: ${JSON.stringify(providers)}`
      )
      return providers.map(provider => this.toIProvider(provider))
    } catch (error) {
      this.logger.error(
        `Error in findByCompanyId: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findByEmail(email: string): Promise<IProvider> {
    const provider = await this.providerModel.findOne({ email }).exec()
    return provider ? this.toIProvider(provider) : null
  }

  async findByTaxId(taxId: string): Promise<IProvider> {
    const provider = await this.providerModel.findOne({ taxId }).exec()
    return provider ? this.toIProvider(provider) : null
  }

  async findAll(): Promise<IProvider[]> {
    const providers = await this.providerModel.find().exec()
    return providers.map(provider => this.toIProvider(provider))
  }

  async remove(id: string): Promise<void> {
    await this.providerModel.findByIdAndDelete(id).exec()
  }
}
