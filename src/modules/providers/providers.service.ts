import {
  Injectable,
  Logger,
  ConflictException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
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
  ) { }

  private toIProvider(doc: Provider & Document): IProvider {
    const provider = doc.toObject()
    return {
      ...provider,
      _id: provider._id.toString(),
      companyId: provider.companyId ? provider.companyId.toString() : null,
    }
  }

  async create(
    createProviderDto: CreateProviderDTO,
    companyId: string
  ): Promise<IProvider> {
    const companyIdObject = new Types.ObjectId(companyId)
    this.logger.debug(
      `Creando proveedor con datos: ${JSON.stringify(createProviderDto)}`
    )

    const existingProvider = await this.providerModel
      .findOne({ email: createProviderDto.email, companyId: companyIdObject })
      .exec()
    if (existingProvider) {
      this.logger.warn(
        `Ya existe un proveedor con el email: ${createProviderDto.email}`
      )
      throw new ConflictException('Ya existe un proveedor con este email')
    }

    const hashedPassword = await this.bcryptService.hash(
      createProviderDto.password
    )
    const providerData = {
      ...createProviderDto,
      password: hashedPassword,
      companyId,
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
    updateProviderDto: UpdateProviderDTO,
    companyId: string
  ): Promise<IProvider> {
    if (updateProviderDto.password) {
      updateProviderDto.password = await this.bcryptService.hash(
        updateProviderDto.password
      )
    }
    const updatedProvider = await this.providerModel
      .findOneAndUpdate({ _id: id, companyId }, updateProviderDto, {
        new: true,
      })
      .populate('companyId')
      .exec()
    return this.toIProvider(updatedProvider)
  }

  async findById(id: string, companyId: string): Promise<IProvider> {
    const provider = await this.providerModel
      .findOne({ _id: id, companyId })
      .populate('companyId')
      .exec()
    return provider ? this.toIProvider(provider) : null
  }

  async findByCompanyId(companyId: string): Promise<IProvider[]> {
    const companyIdObject = new Types.ObjectId(companyId)
    this.logger.debug(
      `findByCompanyId - Searching for providers with companyId: ${companyId}`
    )
    try {
      if (!companyId) {
        this.logger.warn('companyId es undefined o null')
        return []
      }

      const providers = await this.providerModel
        .find({ companyId: companyIdObject })
        .populate('companyId')
        .exec()
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

  async findByEmail(email: string, companyId: string): Promise<IProvider> {
    const companyIdObject = new Types.ObjectId(companyId)
    const provider = await this.providerModel.findOne({ email, companyId: companyIdObject }).exec()
    return provider ? this.toIProvider(provider) : null
  }

  async findByTaxId(taxId: string, companyId: string): Promise<IProvider> {
    const companyIdObject = new Types.ObjectId(companyId)
    const provider = await this.providerModel.findOne({ taxId, companyId: companyIdObject }).exec()
    return provider ? this.toIProvider(provider) : null
  }

  async findAll(companyId: string): Promise<IProvider[]> {
    const companyIdObject = new Types.ObjectId(companyId)
    const providers = await this.providerModel
      .find({ companyId: companyIdObject })
      .populate('companyId')
      .exec()
    return providers.map(provider => this.toIProvider(provider))
  }

  async remove(id: string): Promise<void> {
    await this.providerModel.findOneAndDelete({ _id: id }).exec()
  }
}
