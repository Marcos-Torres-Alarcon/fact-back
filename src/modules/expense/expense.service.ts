import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { UpdateExpenseDto } from './dto/update-expense.dto'
import { ConfigService } from '@nestjs/config'
import { Model, Types } from 'mongoose'
import { Expense } from './entities/expense.entity'
import { InjectModel } from '@nestjs/mongoose'
import { EmailService } from '../email/email.service'
import { PROMPT1 } from './constants/prompt1'
import OpenAI from 'openai'
import { CategoryService } from '../category/category.service'
import { ProjectService } from '../project/project.service'

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name)
  private readonly openai: OpenAI
  private readonly visionModel = 'gpt-4-turbo'

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Expense.name)
    private expenseRepository: Model<Expense>,
    private readonly emailService: EmailService,
    private readonly categoryService: CategoryService,
    private readonly projectService: ProjectService
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured.')
    }
    this.openai = new OpenAI({ apiKey })
  }

  // Método para validar categoría y proyecto
  async validateCategoryAndProject(
    proyect: string,
    category: string
  ): Promise<void> {
    try {
      // Verificar si existe el proyecto
      if (proyect) {
        // Crear un usuario admin ficticio para usar en la búsqueda
        const adminUser = {
          role: 'ADMIN' as 'ADMIN',
          _id: new Types.ObjectId(),
          email: 'admin@system.com',
        }
        await this.projectService.findOne(proyect, adminUser)
      }

      // Verificar si existe la categoría (por key)
      if (category) {
        await this.categoryService.findByKey(category)
      }
    } catch (error) {
      this.logger.error(
        `Error al validar categoría o proyecto: ${error.message}`
      )
      throw new NotFoundException(
        'Categoría o proyecto no encontrado: ' + error.message
      )
    }
  }

  async analyzeImageWithUrl(body: CreateExpenseDto): Promise<Expense> {
    console.log(body)
    const prompt = PROMPT1
    try {
      // Validar que la categoría y el proyecto existan
      await this.validateCategoryAndProject(body.proyect, body.category)

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
      })

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
      return expense
    } catch (error) {
      this.logger.error('OpenAI API Error Response:', error)
      throw new HttpException(
        'Error al analizar la imagen desde la URL con OpenAI.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async create(createExpenseDto: CreateExpenseDto) {
    // Validar que la categoría y el proyecto existan
    await this.validateCategoryAndProject(
      createExpenseDto.proyect,
      createExpenseDto.category
    )
    return this.expenseRepository.create(createExpenseDto)
  }

  findAll() {
    return this.expenseRepository.find().exec()
  }

  findOne(id: string) {
    return this.expenseRepository.findById(id).exec()
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    // Si se está actualizando la categoría o el proyecto, validar que existan
    if (updateExpenseDto.category || updateExpenseDto.proyect) {
      const expense = await this.findOne(id)
      if (!expense) {
        throw new NotFoundException(`Gasto con ID ${id} no encontrado`)
      }
      await this.validateCategoryAndProject(
        updateExpenseDto.proyect || expense.proyect,
        updateExpenseDto.category || expense.category
      )
    }

    return this.expenseRepository
      .findByIdAndUpdate(id, updateExpenseDto, { new: true })
      .exec()
  }

  remove(id: string) {
    return this.expenseRepository.findByIdAndDelete(id).exec()
  }
}
