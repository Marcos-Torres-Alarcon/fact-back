import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Role, RoleDocument } from './entities/role.entity'

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<RoleDocument>
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleModel
      .findOne({ name: createRoleDto.name })
      .exec()
    if (existingRole) {
      throw new HttpException(
        'El nombre del rol ya está registrado',
        HttpStatus.CONFLICT
      )
    }

    const createdRole = new this.roleModel(createRoleDto)
    return createdRole.save()
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().exec()
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleModel.findById(id).exec()
    if (!role) {
      throw new HttpException(
        `Rol con ID ${id} no encontrado`,
        HttpStatus.NOT_FOUND
      )
    }
    return role
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleModel.findOne({ name }).exec()
    if (!role) {
      throw new HttpException(
        `Rol con nombre ${name} no encontrado`,
        HttpStatus.NOT_FOUND
      )
    }
    return role
  }

  findByUserId(userId: string) {
    return this.roleModel.findOne({ userId })
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    if (updateRoleDto.name) {
      const existingRole = await this.roleModel
        .findOne({ name: updateRoleDto.name, _id: { $ne: id } })
        .exec()
      if (existingRole) {
        throw new HttpException(
          'El nombre del rol ya está registrado',
          HttpStatus.CONFLICT
        )
      }
    }

    const updatedRole = await this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true })
      .exec()

    if (!updatedRole) {
      throw new HttpException(
        `Rol con ID ${id} no encontrado`,
        HttpStatus.NOT_FOUND
      )
    }
    return updatedRole
  }

  async remove(id: string): Promise<void> {
    const result = await this.roleModel.findByIdAndDelete(id).exec()
    if (!result) {
      throw new HttpException(
        `Rol con ID ${id} no encontrado`,
        HttpStatus.NOT_FOUND
      )
    }
  }
}
