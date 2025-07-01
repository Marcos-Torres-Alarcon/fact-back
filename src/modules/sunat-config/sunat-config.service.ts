import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  SunatConfig,
  SunatConfigDocument,
} from './entities/sunat-config.entity'
import { CreateSunatConfigDto } from './dto/create-sunat-config.dto'
import { UpdateSunatConfigDto } from './dto/update-sunat-config.dto'

@Injectable()
export class SunatConfigService {
  private readonly logger = new Logger(SunatConfigService.name)

  constructor(
    @InjectModel(SunatConfig.name)
    private sunatConfigModel: Model<SunatConfigDocument>
  ) {}

  async create(createSunatConfigDto: CreateSunatConfigDto, companyId: string) {
    try {
      this.logger.log(
        `Creando configuración SUNAT para companyId: ${companyId}`
      )

      // Verificar si ya existe configuración para esta empresa
      const existingConfig = await this.sunatConfigModel
        .findOne({ companyId })
        .exec()
      if (existingConfig) {
        this.logger.warn(
          `Ya existe configuración SUNAT para companyId: ${companyId}`
        )
        throw new Error('Ya existe configuración SUNAT para esta empresa')
      }

      const sunatConfig = new this.sunatConfigModel({
        ...createSunatConfigDto,
        companyId,
      })

      const result = await sunatConfig.save()
      this.logger.log(
        `Configuración SUNAT creada exitosamente para companyId: ${companyId}`
      )

      return result
    } catch (error) {
      this.logger.error(
        `Error al crear configuración SUNAT: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findOne(companyId: string) {
    try {
      this.logger.log(
        `Buscando configuración SUNAT para companyId: ${companyId}`
      )

      const config = await this.sunatConfigModel.findOne({ companyId }).exec()
      if (!config) {
        this.logger.warn(
          `No se encontró configuración SUNAT para companyId: ${companyId}`
        )
        throw new NotFoundException('No se encontró configuración SUNAT')
      }

      return config
    } catch (error) {
      this.logger.error(
        `Error al buscar configuración SUNAT: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async update(companyId: string, updateSunatConfigDto: UpdateSunatConfigDto) {
    try {
      this.logger.log(
        `Actualizando configuración SUNAT para companyId: ${companyId}`
      )

      const config = await this.sunatConfigModel
        .findOneAndUpdate(
          { companyId },
          { $set: updateSunatConfigDto },
          { new: true }
        )
        .exec()

      if (!config) {
        this.logger.warn(
          `No se encontró configuración SUNAT para companyId: ${companyId}`
        )
        throw new NotFoundException('No se encontró configuración SUNAT')
      }

      this.logger.log(
        `Configuración SUNAT actualizada exitosamente para companyId: ${companyId}`
      )
      return config
    } catch (error) {
      this.logger.error(
        `Error al actualizar configuración SUNAT: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async remove(companyId: string) {
    try {
      this.logger.log(
        `Eliminando configuración SUNAT para companyId: ${companyId}`
      )

      const result = await this.sunatConfigModel
        .findOneAndDelete({ companyId })
        .exec()
      if (!result) {
        this.logger.warn(
          `No se encontró configuración SUNAT para companyId: ${companyId}`
        )
        throw new NotFoundException('No se encontró configuración SUNAT')
      }

      this.logger.log(
        `Configuración SUNAT eliminada exitosamente para companyId: ${companyId}`
      )
      return result
    } catch (error) {
      this.logger.error(
        `Error al eliminar configuración SUNAT: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  // Método para obtener credenciales activas
  async getActiveCredentials(companyId: string) {
    try {
      this.logger.log(
        `Obteniendo credenciales SUNAT activas para companyId: ${companyId}`
      )

      const config = await this.sunatConfigModel
        .findOne({
          companyId,
          isActive: true,
        })
        .exec()

      if (!config) {
        this.logger.warn(
          `No se encontraron credenciales SUNAT activas para companyId: ${companyId}`
        )
        throw new NotFoundException(
          'No se encontraron credenciales SUNAT activas'
        )
      }

      return {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      }
    } catch (error) {
      this.logger.error(
        `Error al obtener credenciales SUNAT: ${error.message}`,
        error.stack
      )
      throw error
    }
  }
}
