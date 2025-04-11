import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common'
import { CreateInvoiceDto, InvoiceStatus } from './dto/create-invoice.dto'
import { UpdateInvoiceDto } from './dto/update-invoice.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Invoice, InvoiceDocument } from './entities/invoice.entity'

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name)
    private invoiceModel: Model<InvoiceDocument>
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const createdInvoice = new this.invoiceModel({
      ...createInvoiceDto,
      status: createInvoiceDto.status || InvoiceStatus.DRAFT,
    })
    return createdInvoice.save()
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceModel
      .find()
      .populate('clientId')
      .populate('projectId')
      .exec()
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate('clientId')
      .populate('projectId')
      .exec()
    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`)
    }
    return invoice
  }

  async findByClient(clientId: string): Promise<Invoice[]> {
    const invoices = await this.invoiceModel
      .find({ clientId })
      .populate('clientId')
      .populate('projectId')
      .exec()
    if (!invoices.length) {
      throw new NotFoundException(
        `No se encontraron facturas para el cliente con ID ${clientId}`
      )
    }
    return invoices
  }

  async findByProject(projectId: string): Promise<Invoice[]> {
    const invoices = await this.invoiceModel
      .find({ projectId })
      .populate('clientId')
      .populate('projectId')
      .exec()
    if (!invoices.length) {
      throw new NotFoundException(
        `No se encontraron facturas para el proyecto con ID ${projectId}`
      )
    }
    return invoices
  }

  async findByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    return this.invoiceModel
      .find({ status })
      .populate('clientId')
      .populate('projectId')
      .exec()
  }

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto
  ): Promise<Invoice> {
    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateInvoiceDto, { new: true })
      .populate('clientId')
      .populate('projectId')
      .exec()

    if (!updatedInvoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`)
    }
    return updatedInvoice
  }

  async updateStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('clientId')
      .populate('projectId')
      .exec()

    if (!updatedInvoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`)
    }
    return updatedInvoice
  }

  async remove(id: string): Promise<void> {
    const result = await this.invoiceModel.findByIdAndDelete(id).exec()
    if (!result) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`)
    }
  }
}
