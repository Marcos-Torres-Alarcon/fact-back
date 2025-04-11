import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Provider } from './entities/provider.entity';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectModel(Provider.name)
    private providerModel: Model<Provider>
  ) {}

  async create(createProviderDto: CreateProviderDto): Promise<Provider> {
    const createdProvider = new this.providerModel(createProviderDto);
    return createdProvider.save();
  }

  async findAll(): Promise<Provider[]> {
    return this.providerModel.find().exec();
  }

  async findOne(id: string): Promise<Provider> {
    const provider = await this.providerModel.findById(id).exec();
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return provider;
  }

  async findOneAdmin(id: string): Promise<Provider> {
    const provider = await this.providerModel.findById(id).exec();
    if (!provider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return provider;
  }

  async update(id: string, updateProviderDto: UpdateProviderDto): Promise<Provider> {
    const updatedProvider = await this.providerModel
      .findByIdAndUpdate(id, updateProviderDto, { new: true })
      .exec();
    if (!updatedProvider) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return updatedProvider;
  }

  async remove(id: string): Promise<void> {
    const result = await this.providerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
  }
} 