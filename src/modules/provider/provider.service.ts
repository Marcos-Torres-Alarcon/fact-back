import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateProviderDto } from './dto/create-provider.dto'
import { UpdateProviderDto } from './dto/update-provider.dto'
import {
  Provider,
  ProviderDocument,
  GetProviderDocument,
} from './entities/provider.entity'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'

@Injectable()
export class ProviderService {
  constructor(
    @InjectModel(Provider.name) private providerModel: Model<ProviderDocument>
  ) {}

  async create(
    createProviderDto: CreateProviderDto
  ): Promise<GetProviderDocument> {
    const createdProvider = new this.providerModel(createProviderDto)
    return createdProvider.save()
  }

  async findAll(): Promise<GetProviderDocument[]> {
    return this.providerModel.find().populate('userId').exec()
  }

  async findOne(id: string): Promise<GetProviderDocument> {
    const provider = await this.providerModel
      .findById(id)
      .populate('userId')
      .exec()
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`)
    }
    return provider
  }

  async update(
    id: string,
    updateProviderDto: UpdateProviderDto
  ): Promise<GetProviderDocument> {
    const updatedProvider = await this.providerModel
      .findByIdAndUpdate(id, updateProviderDto, { new: true })
      .populate('userId')
      .exec()
    if (!updatedProvider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`)
    }
    return updatedProvider
  }

  async remove(id: string): Promise<void> {
    const result = await this.providerModel.findByIdAndDelete(id).exec()
    if (!result) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`)
    }
  }
}
