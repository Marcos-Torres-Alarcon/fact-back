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
import { ApprovalDto } from './dto/approval.dto'
import { UserRole } from '../auth/enums/user-role.enum'
import { ProjectService } from '../project/project.service'
import { UsersService } from '../users/services/users.service'
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
    private readonly projectService: ProjectService,
    private readonly usersService: UsersService
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured.')
    }
    this.openai = new OpenAI({ apiKey })
  }

  async analyzeImageWithUrl(body: CreateExpenseDto): Promise<Expense> {
    console.log('body', body)
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
      })

      const jsonStringLimpio = response.choices[0]?.message?.content
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .trim()
      const jsonObject = JSON.parse(jsonStringLimpio)

      if (jsonObject.serie && jsonObject.correlativo) {
        this.logger.debug(
          `Validando duplicados para serie: ${jsonObject.serie}, correlativo: ${jsonObject.correlativo}, companyId: ${body.companyId}`
        )

        const existingInvoice = await this.findBySeriAndCorrelativo(
          jsonObject.serie,
          jsonObject.correlativo,
          body.companyId
        )

        this.logger.debug(
          `Resultado de búsqueda de duplicados: ${existingInvoice ? 'ENCONTRADO' : 'NO ENCONTRADO'}`
        )

        if (existingInvoice) {
          this.logger.warn(
            `Factura duplicada detectada: ${jsonObject.serie}-${jsonObject.correlativo}`
          )
          throw new HttpException(
            `Ya existe una factura/boleta con el número ${jsonObject.serie}-${jsonObject.correlativo}`,
            HttpStatus.CONFLICT
          )
        }
      } else {
        this.logger.warn(
          `No se pudieron extraer serie y/o correlativo. Serie: ${jsonObject.serie}, Correlativo: ${jsonObject.correlativo}`
        )
      }

      const categoryObject = Types.ObjectId.createFromHexString(body.categoryId)
      const projectObject = Types.ObjectId.createFromHexString(body.proyectId)

      const expense = await this.expenseRepository.create({
        ...body,
        categoryId: categoryObject,
        proyectId: projectObject,
        total: jsonObject.montoTotal,
        data: JSON.stringify(jsonObject),
        file: body.imageUrl,
        status: 'pending',
        createdBy: body.userId,
        fechaEmision: jsonObject.fechaEmision
          ? parseFechaEmision(jsonObject.fechaEmision)
          : undefined,
      })

      const project = await this.projectService.findOne2(body.proyectId)
      try {
        const admins = (await this.usersService.findAll(body.companyId)).filter(
          u => u.role === UserRole.ADMIN2 && u.isActive
        )

        if (admins && admins.length > 0) {
          const creatorId = body.userId
          let creatorName = 'Usuario del sistema'

          if (creatorId) {
            try {
              const creator = await this.usersService.findOne(creatorId)
              if (creator) {
                creatorName =
                  creator.firstName && creator.lastName
                    ? `${creator.firstName} ${creator.lastName}`
                    : creator.email || 'Usuario del sistema'
              }
            } catch (error) {
              this.logger.warn(
                'No se pudo obtener información del usuario creador'
              )
            }
          }

          for (const admin of admins) {
            if (admin.email) {
              await this.emailService.sendInvoiceUploadedExpenseNotification(
                admin.email,
                {
                  providerName: creatorName,
                  invoiceNumber: `${jsonObject.serie || ''}-${
                    jsonObject.correlativo || ''
                  }`,
                  date:
                    jsonObject.fechaEmision ||
                    new Date().toISOString().split('T')[0],
                  type: jsonObject.tipoComprobante || 'Factura',
                  status: 'PENDIENTE',
                  montoTotal: jsonObject.montoTotal || 0,
                  moneda: jsonObject.moneda || 'PEN',
                  createdBy: creatorName,
                  category: body.categoryId || 'No especificada',
                  projectName: project.name || 'No especificado',
                  razonSocial: jsonObject.razonSocial || 'No especificada',
                  direccionEmisor: jsonObject.direccionEmisor,
                }
              )
            }
          }
        } else {
          this.logger.warn('No se encontraron usuarios con rol ADMIN2 activos')

          if (body.userId) {
            try {
              const creator = await this.usersService.findOne(body.userId)
              if (creator && creator.email) {
                const creatorFullName =
                  creator.firstName && creator.lastName
                    ? `${creator.firstName} ${creator.lastName}`
                    : creator.email

                await this.emailService.sendInvoiceUploadedExpenseNotification(
                  creator.email,
                  {
                    providerName: creatorFullName,
                    invoiceNumber: `${jsonObject.serie || ''}-${
                      jsonObject.correlativo || ''
                    }`,
                    date:
                      jsonObject.fechaEmision ||
                      new Date().toISOString().split('T')[0],
                    type: jsonObject.tipoComprobante || 'Factura',
                    status: 'PENDIENTE',
                    montoTotal: jsonObject.montoTotal || 0,
                    moneda: jsonObject.moneda || 'PEN',
                    createdBy: creatorFullName,
                    category: body.categoryId || 'No especificada',
                    projectName: project.name || 'No especificado',
                    razonSocial: jsonObject.razonSocial || 'No especificada',
                    direccionEmisor: jsonObject.direccionEmisor,
                  }
                )
              }
            } catch (error) {
              this.logger.warn(
                'No se pudo enviar notificación al creador:',
                error
              )
            }
          }
        }

        try {
          const colaboradores = await this.usersService.findAll(body.companyId)

          if (colaboradores && colaboradores.length > 0) {
            this.logger.debug(
              `Encontrados ${colaboradores.length} colaboradores activos para notificar`
            )

            const creatorId = body.userId
            let creatorName = 'Usuario del sistema'

            if (creatorId) {
              try {
                const creator = await this.usersService.findOne(creatorId)
                if (creator) {
                  creatorName =
                    creator.firstName && creator.lastName
                      ? `${creator.firstName} ${creator.lastName}`
                      : creator.email || 'Usuario del sistema'
                }
              } catch (error) {
                this.logger.warn(
                  'No se pudo obtener información del usuario creador'
                )
              }
            }

            for (const colaborador of colaboradores) {
              if (colaborador.email) {
                try {
                  await this.emailService.sendInvoiceUploadedExpenseNotification(
                    colaborador.email,
                    {
                      providerName: creatorName,
                      invoiceNumber: `${jsonObject.serie || ''}-${
                        jsonObject.correlativo || ''
                      }`,
                      date:
                        jsonObject.fechaEmision ||
                        new Date().toISOString().split('T')[0],
                      type: jsonObject.tipoComprobante || 'Factura',
                      status: 'PENDIENTE',
                      montoTotal: jsonObject.montoTotal || 0,
                      moneda: jsonObject.moneda || 'PEN',
                      createdBy: creatorName,
                      category: body.categoryId || 'No especificada',
                      projectName: project.name || 'No especificado',
                      razonSocial: jsonObject.razonSocial || 'No especificada',
                      direccionEmisor: jsonObject.direccionEmisor,
                    }
                  )
                  this.logger.debug(
                    `Notificación enviada al colaborador: ${colaborador.email}`
                  )
                } catch (error) {
                  this.logger.warn(
                    `Error al enviar notificación al colaborador ${colaborador.email}:`,
                    error
                  )
                }
              }
            }
          } else {
            this.logger.debug(
              'No se encontraron usuarios con rol COLABORADOR activos'
            )
          }
        } catch (error) {
          this.logger.error(
            'Error al enviar notificaciones a colaboradores:',
            error
          )
        }
      } catch (error) {
        this.logger.error('Error al enviar notificaciones de correo:', error)
      }

      return expense
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      this.logger.error('OpenAI API Error Response:', error)
      throw new HttpException(
        'Error al analizar la imagen desde la URL con OpenAI.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async create(
    createExpenseDto: CreateExpenseDto,
    companyId: string
  ): Promise<Expense> {
    let fechaEmisionDate: Date | undefined = undefined
    if ('fechaEmision' in createExpenseDto && createExpenseDto.fechaEmision) {
      fechaEmisionDate = new Date(createExpenseDto.fechaEmision as any)
    } else if ((createExpenseDto as any).data) {
      let dataObj: any = (createExpenseDto as any).data
      if (typeof dataObj === 'string') {
        try {
          dataObj = JSON.parse(dataObj)
        } catch {}
      }
      if (dataObj && dataObj.fechaEmision) {
        fechaEmisionDate = parseFechaEmision(dataObj.fechaEmision)
      }
    }
    const createdExpense = new this.expenseRepository({
      ...createExpenseDto,
      companyId,
      fechaEmision: fechaEmisionDate,
    })
    return createdExpense.save()
  }

  async findAll(companyId: string, filters: any = {}): Promise<Expense[]> {
    const query: any = { companyId }

    const isValidObjectId = (id: string): boolean => {
      return /^[0-9a-fA-F]{24}$/.test(id)
    }

    if (filters.createdBy) {
      if (isValidObjectId(filters.createdBy)) {
        query.createdBy = filters.createdBy
      }
    }

    if (filters.projectId) {
      if (isValidObjectId(filters.projectId)) {
        query.$or = [
          { proyectId: filters.projectId },
          { proyectId: Types.ObjectId.createFromHexString(filters.projectId) },
        ]
      }
    }

    if (filters.proyectId) {
      if (isValidObjectId(filters.proyectId)) {
        query.$or = [
          { proyectId: filters.proyectId },
          { proyectId: Types.ObjectId.createFromHexString(filters.proyectId) },
        ]
      }
    }

    if (filters.categoryId) {
      if (isValidObjectId(filters.categoryId)) {
        if (query.$or) {
          const projectConditions = query.$or
          delete query.$or
          query.$and = [
            { $or: projectConditions },
            {
              $or: [
                { categoryId: filters.categoryId },
                {
                  categoryId: Types.ObjectId.createFromHexString(
                    filters.categoryId
                  ),
                },
              ],
            },
          ]
        } else {
          query.$or = [
            { categoryId: filters.categoryId },
            {
              categoryId: Types.ObjectId.createFromHexString(
                filters.categoryId
              ),
            },
          ]
        }
      }
    }

    if (filters.status) query.status = filters.status

    if (filters.dateFrom || filters.dateTo) {
      query.fechaEmision = {}
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom)
        dateFrom.setUTCHours(0, 0, 0, 0)
        query.fechaEmision.$gte = dateFrom
      }
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo)
        dateTo.setUTCHours(23, 59, 59, 999)
        query.fechaEmision.$lte = dateTo
      }
    }
    if (filters.amountMin || filters.amountMax) {
      query.total = {}
      if (filters.amountMin) query.total.$gte = Number(filters.amountMin)
      if (filters.amountMax) query.total.$lte = Number(filters.amountMax)
    }

    if (filters.serie && filters.correlativo) {
      const expense = await this.findBySeriAndCorrelativo(
        filters.serie,
        filters.correlativo,
        companyId
      )
      return expense ? [expense] : []
    }

    const sortBy = filters.sortBy || 'fechaEmision'
    const sortOrder = filters.sortOrder || 'desc'

    let sortField = sortBy
    if (sortBy === 'fechaEmision') {
      sortField = 'fechaEmision'
    } else if (sortBy === 'createdAt') {
      sortField = 'createdAt'
    }

    const sortOptions: any = {}
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1

    if (sortBy === 'fechaEmision') {
      sortOptions['createdAt'] = sortOrder === 'desc' ? -1 : 1
    }

    const result = await this.expenseRepository
      .find(query)
      .populate('proyectId')
      .populate('categoryId')
      .sort(sortOptions)
      .exec()

    return result
  }

  async findOne(id: string, companyId: string): Promise<Expense> {
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new Error(`ID de expense inválido: ${id}`)
    }
    if (!/^[0-9a-fA-F]{24}$/.test(companyId)) {
      throw new Error(`ID de company inválido: ${companyId}`)
    }

    const companyIdObject = Types.ObjectId.createFromHexString(companyId)
    const expenseIdObject = Types.ObjectId.createFromHexString(id)

    return this.expenseRepository
      .findOne({ _id: expenseIdObject, companyId: companyIdObject })
      .populate('proyectId')
      .populate('categoryId')
      .exec()
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    companyId: string
  ): Promise<Expense> {
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new Error(`ID de expense inválido: ${id}`)
    }
    if (!/^[0-9a-fA-F]{24}$/.test(companyId)) {
      throw new Error(`ID de company inválido: ${companyId}`)
    }

    const companyIdObject = Types.ObjectId.createFromHexString(companyId)
    const expenseIdObject = Types.ObjectId.createFromHexString(id)

    if (updateExpenseDto.categoryId) {
      const expense = await this.findOne(id, companyId)
      if (!expense) {
        throw new NotFoundException(`Gasto con ID ${id} no encontrado`)
      }
    }

    return this.expenseRepository
      .findOneAndUpdate(
        { _id: expenseIdObject, companyId: companyIdObject },
        updateExpenseDto,
        { new: true }
      )
      .populate('companyId')
      .populate('categoryId')
      .exec()
  }

  async approveInvoice(
    id: string,
    approvalDto: ApprovalDto,
    companyId: string
  ) {
    const expense = await this.findOne(id, companyId)
    if (!expense) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`)
    }

    if (expense.status !== 'pending') {
      throw new HttpException(
        `La factura ya ha sido ${expense.status === 'approved' ? 'aprobada' : 'rechazada'}`,
        HttpStatus.BAD_REQUEST
      )
    }

    let validUserId = null
    let userEmail = null
    let userName = null
    let userLastName = null

    if (approvalDto.userId) {
      if (/^[0-9a-fA-F]{24}$/.test(approvalDto.userId)) {
        validUserId = approvalDto.userId
      } else {
        this.logger.warn(
          `ID de usuario inválido para aprobar: ${approvalDto.userId}. Se intentará buscar por email.`
        )

        try {
          const userByEmail = await this.usersService.findByEmail(
            approvalDto.userId
          )
          if (userByEmail) {
            validUserId = userByEmail._id
            userEmail = userByEmail.email
            userName = userByEmail.firstName
            userLastName = userByEmail.lastName

            this.logger.debug(`Usuario encontrado por email: ${userEmail}`)
          }
        } catch (error) {
          this.logger.warn(
            `No se pudo encontrar usuario por otros medios: ${error.message}`
          )
        }
      }
    }

    const updatedExpense = await this.expenseRepository
      .findByIdAndUpdate(
        id,
        {
          status: 'approved',
          statusDate: new Date(),
          approvedBy: validUserId,
        },
        { new: true }
      )
      .exec()

    setImmediate(() => {
      this.sendApprovalEmails(
        expense,
        validUserId,
        companyId,
        userName,
        userLastName
      ).catch(error => {
        this.logger.error('Error al enviar correos de aprobación:', error)
      })
    })

    this.logger.log(`Factura ${id} aprobada exitosamente`)
    return updatedExpense
  }

  private async sendApprovalEmails(
    expense: any,
    validUserId: string,
    companyId: string,
    userName?: string,
    userLastName?: string
  ) {
    try {
      let approverName = 'Administrador del Sistema'

      if (userName && userLastName) {
        approverName = `${userName} ${userLastName}`
        this.logger.debug(
          `Usando información de aprobador encontrada previamente: ${approverName}`
        )
      } else if (validUserId) {
        try {
          const approver = await this.usersService.findOne(validUserId)
          if (approver) {
            approverName =
              approver.firstName && approver.lastName
                ? `${approver.firstName} ${approver.lastName}`
                : approver.email || 'Administrador del Sistema'

            this.logger.debug(
              `Información de aprobador obtenida de la BD: ${approverName}`
            )
          }
        } catch (error) {
          this.logger.warn('No se pudo obtener información del aprobador')
        }
      } else {
        this.logger.warn(
          'Usando valor predeterminado para el aprobador: Administrador del Sistema'
        )
      }

      const invoiceData = expense.data ? JSON.parse(expense.data) : {}

      if (expense.createdBy) {
        try {
          if (!/^[0-9a-fA-F]{24}$/.test(expense.createdBy)) {
            this.logger.warn(`ID del creador inválido: ${expense.createdBy}`)
            return
          }

          const creator = await this.usersService.findOne(expense.createdBy)

          if (creator && creator.email) {
            const creatorFullName =
              creator.firstName && creator.lastName
                ? `${creator.firstName} ${creator.lastName}`
                : creator.email || 'Usuario'

            this.logger.debug(
              `Enviando notificación de aprobación a ${creator.email}, rol: ${creator.role}`
            )

            if (creator.role === UserRole.COLABORADOR) {
              await this.emailService.sendInvoiceApprovedToColaborador(
                creator.email,
                {
                  providerName: creatorFullName,
                  invoiceNumber: `${invoiceData.serie || ''}-${
                    invoiceData.correlativo || ''
                  }`,
                  date:
                    invoiceData.fechaEmision ||
                    new Date().toISOString().split('T')[0],
                  type: invoiceData.tipoComprobante || 'Factura',
                  approvedBy: approverName,
                }
              )
              this.logger.debug(
                `Notificación de aprobación enviada a colaborador ${creator.email}`
              )
            } else {
              await this.emailService.sendInvoiceApprovedNotification(
                creator.email,
                {
                  providerName: creatorFullName,
                  invoiceNumber: `${invoiceData.serie || ''}-${
                    invoiceData.correlativo || ''
                  }`,
                  date:
                    invoiceData.fechaEmision ||
                    new Date().toISOString().split('T')[0],
                  type: invoiceData.tipoComprobante || 'Factura',
                  approvedBy: approverName,
                }
              )
              this.logger.debug(
                `Notificación de aprobación enviada a usuario ${creator.email} con rol ${creator.role}`
              )
            }
          } else {
            this.logger.warn(
              'No se encontró email para el creador de la factura'
            )
          }
        } catch (error) {
          this.logger.warn(
            'No se pudo encontrar al creador de la factura:',
            error
          )
        }
      } else {
        this.logger.warn(
          'La factura no tiene un creador asignado (createdBy es null)'
        )
      }

      try {
        const colaboradores = await this.usersService.findAll(companyId)

        if (colaboradores && colaboradores.length > 0) {
          this.logger.debug(
            `Notificando a ${colaboradores.length} colaboradores sobre factura aprobada`
          )

          const creadorId = expense.createdBy || ''

          for (const colaborador of colaboradores) {
            if (colaborador.email && colaborador._id.toString() !== creadorId) {
              try {
                await this.emailService.sendInvoiceApprovedToColaborador(
                  colaborador.email,
                  {
                    providerName:
                      colaborador.firstName && colaborador.lastName
                        ? `${colaborador.firstName} ${colaborador.lastName}`
                        : colaborador.email,
                    invoiceNumber: `${invoiceData.serie || ''}-${
                      invoiceData.correlativo || ''
                    }`,
                    date:
                      invoiceData.fechaEmision ||
                      new Date().toISOString().split('T')[0],
                    type: invoiceData.tipoComprobante || 'Factura',
                    approvedBy: approverName,
                  }
                )
                this.logger.debug(
                  `Notificación de aprobación enviada a colaborador ${colaborador.email}`
                )
              } catch (error) {
                this.logger.warn(
                  `Error al enviar notificación de aprobación al colaborador ${colaborador.email}:`,
                  error
                )
              }
            }
          }
        } else {
          this.logger.debug(
            'No hay colaboradores activos para notificar sobre la factura aprobada'
          )
        }
      } catch (error) {
        this.logger.error(
          'Error al notificar a colaboradores sobre factura aprobada:',
          error
        )
      }
    } catch (error) {
      this.logger.error('Error al enviar notificación de aprobación:', error)
    }
  }

  async rejectInvoice(id: string, approvalDto: ApprovalDto, companyId: string) {
    const expense = await this.findOne(id, companyId)
    if (!expense) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`)
    }

    if (expense.status !== 'pending') {
      throw new HttpException(
        `La factura ya ha sido ${expense.status === 'approved' ? 'aprobada' : 'rechazada'}`,
        HttpStatus.BAD_REQUEST
      )
    }

    if (!approvalDto.reason) {
      throw new HttpException(
        'Se requiere un motivo para rechazar la factura',
        HttpStatus.BAD_REQUEST
      )
    }

    let validUserId = null
    let userEmail = null
    let userName = null
    let userLastName = null

    if (approvalDto.userId) {
      if (/^[0-9a-fA-F]{24}$/.test(approvalDto.userId)) {
        validUserId = approvalDto.userId
      } else {
        this.logger.warn(
          `ID de usuario inválido para rechazar: ${approvalDto.userId}. Se intentará buscar por email.`
        )

        try {
          const userByEmail = await this.usersService.findByEmail(
            approvalDto.userId
          )
          if (userByEmail) {
            validUserId = userByEmail._id
            userEmail = userByEmail.email
            userName = userByEmail.firstName
            userLastName = userByEmail.lastName

            this.logger.debug(`Usuario encontrado por email: ${userEmail}`)
          }
        } catch (error) {
          this.logger.warn(
            `No se pudo encontrar usuario por otros medios: ${error.message}`
          )
        }
      }
    }

    const updatedExpense = await this.expenseRepository
      .findByIdAndUpdate(
        id,
        {
          status: 'rejected',
          statusDate: new Date(),
          rejectedBy: validUserId,
          rejectionReason: approvalDto.reason,
        },
        { new: true }
      )
      .exec()

    setImmediate(() => {
      this.sendRejectionEmails(
        expense,
        validUserId,
        companyId,
        userName,
        userLastName,
        approvalDto.reason
      ).catch(error => {
        this.logger.error('Error al enviar correos de rechazo:', error)
      })
    })

    this.logger.log(`Factura ${id} rechazada exitosamente`)
    return updatedExpense
  }

  private async sendRejectionEmails(
    expense: any,
    validUserId: string,
    companyId: string,
    userName?: string,
    userLastName?: string,
    rejectionReason?: string
  ) {
    try {
      let rejectorName = 'Administrador del Sistema'

      if (userName && userLastName) {
        rejectorName = `${userName} ${userLastName}`
        this.logger.debug(
          `Usando información de rechazador encontrada previamente: ${rejectorName}`
        )
      } else if (validUserId) {
        try {
          const rejector = await this.usersService.findOne(validUserId)
          if (rejector) {
            rejectorName =
              rejector.firstName && rejector.lastName
                ? `${rejector.firstName} ${rejector.lastName}`
                : rejector.email || 'Administrador del Sistema'

            this.logger.debug(
              `Información de rechazador obtenida de la BD: ${rejectorName}`
            )
          }
        } catch (error) {
          this.logger.warn(
            'No se pudo obtener información del administrador que rechazó'
          )
        }
      } else {
        this.logger.warn(
          'Usando valor predeterminado para el rechazador: Administrador del Sistema'
        )
      }

      const invoiceData = expense.data ? JSON.parse(expense.data) : {}

      if (expense.createdBy) {
        try {
          if (!/^[0-9a-fA-F]{24}$/.test(expense.createdBy)) {
            this.logger.warn(`ID del creador inválido: ${expense.createdBy}`)
            return
          }

          const creator = await this.usersService.findOne(expense.createdBy)

          if (creator && creator.email) {
            const creatorFullName =
              creator.firstName && creator.lastName
                ? `${creator.firstName} ${creator.lastName}`
                : creator.email || 'Usuario'

            this.logger.debug(
              `Enviando notificación de rechazo a ${creator.email}, rol: ${creator.role}`
            )

            if (creator.role === UserRole.COLABORADOR) {
              await this.emailService.sendInvoiceRejectedToColaborador(
                creator.email,
                {
                  providerName: creatorFullName,
                  invoiceNumber: `${invoiceData.serie || ''}-${
                    invoiceData.correlativo || ''
                  }`,
                  date:
                    invoiceData.fechaEmision ||
                    new Date().toISOString().split('T')[0],
                  type: invoiceData.tipoComprobante || 'Factura',
                  rejectionReason: rejectionReason || 'No especificado',
                  rejectedBy: rejectorName,
                }
              )
              this.logger.debug(
                `Notificación de rechazo enviada a colaborador ${creator.email}`
              )
            } else {
              await this.emailService.sendInvoiceRejectedNotification(
                creator.email,
                {
                  providerName: creatorFullName,
                  invoiceNumber: `${invoiceData.serie || ''}-${
                    invoiceData.correlativo || ''
                  }`,
                  date:
                    invoiceData.fechaEmision ||
                    new Date().toISOString().split('T')[0],
                  type: invoiceData.tipoComprobante || 'Factura',
                  rejectionReason: rejectionReason || 'No especificado',
                  rejectedBy: rejectorName,
                }
              )
              this.logger.debug(
                `Notificación de rechazo enviada a usuario ${creator.email} con rol ${creator.role}`
              )
            }
          } else {
            this.logger.warn(
              'No se encontró email para el creador de la factura'
            )
          }
        } catch (error) {
          this.logger.warn(
            'No se pudo encontrar al creador de la factura:',
            error
          )
        }
      } else {
        this.logger.warn(
          'La factura no tiene un creador asignado (createdBy es null)'
        )
      }

      try {
        const colaboradores = await this.usersService.findAll(companyId)

        if (colaboradores && colaboradores.length > 0) {
          this.logger.debug(
            `Notificando a ${colaboradores.length} colaboradores sobre factura rechazada`
          )

          const creadorId = expense.createdBy || ''

          for (const colaborador of colaboradores) {
            if (colaborador.email && colaborador._id.toString() !== creadorId) {
              try {
                await this.emailService.sendInvoiceRejectedToColaborador(
                  colaborador.email,
                  {
                    providerName:
                      colaborador.firstName && colaborador.lastName
                        ? `${colaborador.firstName} ${colaborador.lastName}`
                        : colaborador.email,
                    invoiceNumber: `${invoiceData.serie || ''}-${
                      invoiceData.correlativo || ''
                    }`,
                    date:
                      invoiceData.fechaEmision ||
                      new Date().toISOString().split('T')[0],
                    type: invoiceData.tipoComprobante || 'Factura',
                    rejectionReason: rejectionReason || 'No especificado',
                    rejectedBy: rejectorName,
                  }
                )
                this.logger.debug(
                  `Notificación de rechazo enviada a colaborador ${colaborador.email}`
                )
              } catch (error) {
                this.logger.warn(
                  `Error al enviar notificación de rechazo al colaborador ${colaborador.email}:`,
                  error
                )
              }
            }
          }
        } else {
          this.logger.debug(
            'No hay colaboradores activos para notificar sobre la factura rechazada'
          )
        }
      } catch (error) {
        this.logger.error(
          'Error al notificar a colaboradores sobre factura rechazada:',
          error
        )
      }
    } catch (error) {
      this.logger.error('Error al enviar notificación de rechazo:', error)
    }
  }

  async remove(id: string, companyId: string): Promise<void> {
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new Error(`ID de expense inválido: ${id}`)
    }
    if (!/^[0-9a-fA-F]{24}$/.test(companyId)) {
      throw new Error(`ID de company inválido: ${companyId}`)
    }

    const companyIdObject = Types.ObjectId.createFromHexString(companyId)
    const expenseIdObject = Types.ObjectId.createFromHexString(id)

    await this.expenseRepository
      .findOneAndDelete({ _id: expenseIdObject, companyId: companyIdObject })
      .exec()
  }

  async findBySeriAndCorrelativo(
    serie: string,
    correlativo: string,
    companyId?: string
  ): Promise<Expense | null> {
    try {
      this.logger.debug(
        `Buscando duplicados - Serie: ${serie}, Correlativo: ${correlativo}, CompanyId: ${companyId}`
      )

      const query: any = {}

      if (companyId) {
        query.companyId = companyId
      }

      this.logger.debug(`Query de búsqueda: ${JSON.stringify(query)}`)

      const expenses = await this.expenseRepository.find(query).exec()

      this.logger.debug(`Encontradas ${expenses.length} facturas para revisar`)

      for (const expense of expenses) {
        if (expense.data) {
          try {
            let dataObj: any = expense.data
            if (typeof dataObj === 'string') {
              dataObj = JSON.parse(dataObj)
            }

            this.logger.debug(
              `Revisando factura ${expense._id}: Serie: ${dataObj?.serie}, Correlativo: ${dataObj?.correlativo}`
            )

            if (
              dataObj &&
              dataObj.serie === serie &&
              dataObj.correlativo === correlativo
            ) {
              this.logger.debug(`DUPLICADO ENCONTRADO: Factura ${expense._id}`)
              return expense
            }
          } catch (error) {
            this.logger.warn(
              `Error parseando data de factura ${expense._id}:`,
              error
            )
            continue
          }
        }
      }

      this.logger.debug(`No se encontraron duplicados`)
      return null
    } catch (error) {
      this.logger.error(
        'Error al buscar factura por serie y correlativo:',
        error
      )
      throw new HttpException(
        'Error al validar duplicados',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}

function parseFechaEmision(fecha: string): Date | undefined {
  const parts = fecha.split(/[\/\-]/)
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
  }
  return undefined
}
