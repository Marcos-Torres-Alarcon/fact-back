import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { UpdateExpenseDto } from './dto/update-expense.dto'
import { ConfigService } from '@nestjs/config'
import { Model } from 'mongoose'
import { Expense } from './entities/expense.entity'
import { InjectModel } from '@nestjs/mongoose'
import { EmailService } from '../email/email.service'
import { PROMPT1 } from './constants/prompt1'
import OpenAI from 'openai';


@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name)
  private readonly openai: OpenAI;
  private readonly visionModel = 'gpt-4-turbo';

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Expense.name)
    private expenseRepository: Model<Expense>,
    private readonly emailService: EmailService
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured.');
    }
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeImageWithUrl(
    body: CreateExpenseDto
  ): Promise<Expense> {
    console.log(body)
    const prompt = PROMPT1
    try {
      const response = await this.openai.chat.completions.create({
        model: this.visionModel,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: body.imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      });

      const jsonStringLimpio = response.choices[0]?.message?.content
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .trim()
      const jsonObject = JSON.parse(jsonStringLimpio)

      console.log(jsonObject)

      const expense = await this.expenseRepository.create({
        ...body,
        total: jsonObject.montoTotal,
        data: JSON.stringify(jsonObject),
        file: body.imageUrl,
      })
      // Enviar correo de notificación de gasto
      // await this.emailService.sendInvoiceUploadedExpenseNotification({
      //   providerName: jsonObject.rucEmisor || 'Desconocido',
      //   invoiceNumber: `${jsonObject.serie || ''}-${jsonObject.correlativo || ''}`,
      //   date: jsonObject.fechaEmision || '',
      //   type: jsonObject.tipoComprobante || '',
      //   status: 'PENDIENTE',
      //   montoTotal: jsonObject.montoTotal || 0,
      //   moneda: jsonObject.moneda || '',
      // })
      return expense;
    } catch (error) {
      this.logger.error('OpenAI API Error Response:', error);
      throw new HttpException(
        'Error al analizar la imagen desde la URL con OpenAI.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  create(createExpenseDto: CreateExpenseDto) {
    return this.expenseRepository.create(createExpenseDto)
  }

  findAll() {
    return this.expenseRepository.find().exec()
  }

  findOne(id: string) {
    return this.expenseRepository.findById(id).exec()
  }

  update(id: string, updateExpenseDto: UpdateExpenseDto) {
    return this.expenseRepository
      .findByIdAndUpdate(id, updateExpenseDto, { new: true })
      .exec()
  }

  remove(id: string) {
    return this.expenseRepository.findByIdAndDelete(id).exec()
  }
}
