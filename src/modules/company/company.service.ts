import { Injectable } from '@nestjs/common'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Company, CompanyDocument } from './entities/company.entity'

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: Model<CompanyDocument>
  ) {}

  create(createCompanyDto: CreateCompanyDto) {
    const createdCompany = new this.companyModel(createCompanyDto)
    return createdCompany.save()
  }

  findAll() {
    return this.companyModel.find().exec()
  }

  findOne(id: string) {
    return this.companyModel.findById(id).exec()
  }

  update(id: string, updateCompanyDto: UpdateCompanyDto) {
    return this.companyModel
      .findByIdAndUpdate(id, updateCompanyDto, { new: true })
      .exec()
  }

  remove(id: string) {
    return this.companyModel.findByIdAndDelete(id).exec()
  }

  // Métodos para configuración de empresa
  async getCompanyConfig(companyId: string) {
    const company = await this.companyModel.findById(companyId).exec()
    if (!company) {
      throw new Error('Company not found')
    }

    return {
      _id: company._id,
      companyId: company._id,
      name: company.comercialName,
      logo: company.logo || null,
    }
  }

  async updateCompanyConfig(
    companyId: string,
    config: { name?: string; logo?: string }
  ) {
    const updateData: any = {}

    if (config.name) {
      updateData.comercialName = config.name
    }

    if (config.logo) {
      updateData.logo = config.logo
    }

    const company = await this.companyModel
      .findByIdAndUpdate(companyId, updateData, { new: true })
      .exec()

    if (!company) {
      throw new Error('Company not found')
    }

    return {
      _id: company._id,
      companyId: company._id,
      name: company.comercialName,
      logo: company.logo || null,
    }
  }
}
