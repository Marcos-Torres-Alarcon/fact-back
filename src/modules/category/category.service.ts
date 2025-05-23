import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Category, CategoryDocument } from './entities/category.entity'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name)

  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto
  ): Promise<CategoryDocument> {
    try {
      if (!createCategoryDto.key && createCategoryDto.name) {
        createCategoryDto.key = this.generateKey(createCategoryDto.name)
      }

      const newCategory = new this.categoryModel(createCategoryDto)
      return await newCategory.save()
    } catch (error) {
      this.logger.error(
        `Error al crear categoría: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findAll(companyId: string): Promise<CategoryDocument[]> {
    try {
      return await this.categoryModel.find({ companyId }).exec()
    } catch (error) {
      this.logger.error(
        `Error al obtener categorías: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findOne(id: string, companyId: string): Promise<CategoryDocument> {
    try {
      const category = await this.categoryModel
        .findOne({ _id: id, companyId })
        .exec()
      if (!category) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`)
      }
      return category
    } catch (error) {
      this.logger.error(
        `Error al obtener categoría: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async findByKey(key: string, companyId: string): Promise<CategoryDocument> {
    try {
      const category = await this.categoryModel
        .findOne({ key, companyId })
        .exec()
      if (!category) {
        throw new NotFoundException(`Categoría con clave ${key} no encontrada`)
      }
      return category
    } catch (error) {
      this.logger.error(
        `Error al obtener categoría por clave: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    companyId: string
  ): Promise<CategoryDocument> {
    try {
      if (
        updateCategoryDto.name &&
        !updateCategoryDto.key &&
        updateCategoryDto.name !== (await this.findOne(id, companyId)).name
      ) {
        updateCategoryDto.key = this.generateKey(updateCategoryDto.name)
      }

      const updatedCategory = await this.categoryModel
        .findOneAndUpdate({ _id: id, companyId }, updateCategoryDto, {
          new: true,
        })
        .exec()

      if (!updatedCategory) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`)
      }

      return updatedCategory
    } catch (error) {
      this.logger.error(
        `Error al actualizar categoría: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  async remove(id: string, companyId: string): Promise<void> {
    try {
      const result = await this.categoryModel
        .findOneAndDelete({ _id: id, companyId })
        .exec()
      if (!result) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`)
      }
    } catch (error) {
      this.logger.error(
        `Error al eliminar categoría: ${error.message}`,
        error.stack
      )
      throw error
    }
  }

  private generateKey(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
  }
}
