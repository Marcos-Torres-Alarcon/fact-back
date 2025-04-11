import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common'
import { CreatePaymentDto, PaymentStatus } from './dto/create-payment.dto'
import { UpdatePaymentDto } from './dto/update-payment.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Payment } from './entities/payment.entity'

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<Payment>
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const createdPayment = new this.paymentModel({
      ...createPaymentDto,
      status: createPaymentDto.status || PaymentStatus.PENDING,
    })
    return createdPayment.save()
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentModel.find().populate('invoiceId').exec()
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel
      .findById(id)
      .populate('invoiceId')
      .exec()
    if (!payment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`)
    }
    return payment
  }

  async findByInvoice(invoiceId: string): Promise<Payment[]> {
    const payments = await this.paymentModel
      .find({ invoiceId })
      .populate('invoiceId')
      .exec()
    if (!payments.length) {
      throw new NotFoundException(
        `No se encontraron pagos para la factura con ID ${invoiceId}`
      )
    }
    return payments
  }

  async findByClient(clientId: string): Promise<Payment[]> {
    const payments = await this.paymentModel
      .find({ clientId })
      .populate('invoiceId')
      .populate('clientId')
      .exec()
    if (!payments.length) {
      throw new NotFoundException(
        `No se encontraron pagos para el cliente con ID ${clientId}`
      )
    }
    return payments
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.paymentModel.find({ status }).populate('invoiceId').exec()
  }

  async findByProject(project: string): Promise<Payment[]> {
    const payments = await this.paymentModel.find({ project })
    if (!payments.length) {
      throw new NotFoundException('No se encontraron pagos para el proyecto especificado')
    }
    return payments
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto
  ): Promise<Payment> {
    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(id, updatePaymentDto, { new: true })
      .populate('invoiceId')
      .exec()

    if (!updatedPayment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`)
    }
    return updatedPayment
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<Payment> {
    const updatedPayment = await this.paymentModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('invoiceId')
      .exec()

    if (!updatedPayment) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`)
    }
    return updatedPayment
  }

  async remove(id: string): Promise<void> {
    const result = await this.paymentModel.findByIdAndDelete(id).exec()
    if (!result) {
      throw new NotFoundException(`Pago con ID ${id} no encontrado`)
    }
  }
}
