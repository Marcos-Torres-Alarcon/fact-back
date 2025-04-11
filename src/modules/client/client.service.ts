import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Client } from './entities/client.entity'

@Injectable()
export class ClientService {
  constructor(
    @InjectModel(Client.name)
    private clientModel: Model<Client>
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const existingClient = await this.clientModel
      .findOne({
        $or: [
          { email: createClientDto.email },
          { taxId: createClientDto.taxId },
        ],
      })
      .exec()

    if (existingClient) {
      throw new ConflictException(
        'Ya existe un cliente con el mismo correo electrónico o RFC'
      )
    }

    const createdClient = new this.clientModel(createClientDto)
    return createdClient.save()
  }

  async findAll(): Promise<Client[]> {
    return this.clientModel.find().sort({ name: 1 }).exec()
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientModel.findById(id).exec()
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`)
    }
    return client
  }

  async findByTaxId(taxId: string): Promise<Client[]> {
    return this.clientModel.find({ taxId }).exec()
  }

  async findByProject(project: string): Promise<Client[]> {
    return this.clientModel.find({ projects: project }).exec()
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    if (updateClientDto.email || updateClientDto.taxId) {
      const existingClient = await this.clientModel
        .findOne({
          _id: { $ne: id },
          $or: [
            { email: updateClientDto.email },
            { taxId: updateClientDto.taxId },
          ],
        })
        .exec()

      if (existingClient) {
        throw new ConflictException(
          'Ya existe un cliente con el mismo correo electrónico o RFC'
        )
      }
    }

    const updatedClient = await this.clientModel
      .findByIdAndUpdate(id, updateClientDto, { new: true })
      .exec()
    if (!updatedClient) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`)
    }
    return updatedClient
  }

  async remove(id: string): Promise<void> {
    const result = await this.clientModel.findByIdAndDelete(id).exec()
    if (!result) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`)
    }
  }
}
