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

      const expense = await this.expenseRepository.create({
        ...body,
        projectId: Types.ObjectId.createFromHexString(body.proyectId),
        total: jsonObject.montoTotal,
        data: JSON.stringify(jsonObject),
        file: body.imageUrl,
        status: 'pending',
        createdBy: body.userId,
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
              const creator = await this.usersService.findOne(
                creatorId,
                body.companyId
              )
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
                  invoiceNumber: `${jsonObject.serie || ''}-${jsonObject.correlativo || ''
                    }`,
                  date:
                    jsonObject.fechaEmision ||
                    new Date().toISOString().split('T')[0],
                  type: jsonObject.tipoComprobante || 'Factura',
                  status: 'PENDIENTE',
                  montoTotal: jsonObject.montoTotal || 0,
                  moneda: jsonObject.moneda || 'PEN',
                  createdBy: creatorName,
                  category: body.category || 'No especificada',
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
              const creator = await this.usersService.findOne(
                body.userId,
                body.companyId
              )
              if (creator && creator.email) {
                const creatorFullName =
                  creator.firstName && creator.lastName
                    ? `${creator.firstName} ${creator.lastName}`
                    : creator.email

                await this.emailService.sendInvoiceUploadedExpenseNotification(
                  creator.email,
                  {
                    providerName: creatorFullName,
                    invoiceNumber: `${jsonObject.serie || ''}-${jsonObject.correlativo || ''
                      }`,
                    date:
                      jsonObject.fechaEmision ||
                      new Date().toISOString().split('T')[0],
                    type: jsonObject.tipoComprobante || 'Factura',
                    status: 'PENDIENTE',
                    montoTotal: jsonObject.montoTotal || 0,
                    moneda: jsonObject.moneda || 'PEN',
                    createdBy: creatorFullName,
                    category: body.category || 'No especificada',
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
                const creator = await this.usersService.findOne(
                  creatorId,
                  body.companyId
                )
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
                      invoiceNumber: `${jsonObject.serie || ''}-${jsonObject.correlativo || ''
                        }`,
                      date:
                        jsonObject.fechaEmision ||
                        new Date().toISOString().split('T')[0],
                      type: jsonObject.tipoComprobante || 'Factura',
                      status: 'PENDIENTE',
                      montoTotal: jsonObject.montoTotal || 0,
                      moneda: jsonObject.moneda || 'PEN',
                      createdBy: creatorName,
                      category: body.category || 'No especificada',
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

    return this.expenseRepository.create({
      ...createExpenseDto,
      companyId,
      status: 'pending',
    })
  }

  async findAll(companyId: string): Promise<Expense[]> {
    return this.expenseRepository
      .find({ companyId })
      .populate('companyId')
      .exec()
  }

  async findOne(id: string, companyId: string): Promise<Expense> {
    return this.expenseRepository
      .findOne({ _id: id, companyId })
      .populate('companyId')
      .exec()
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    companyId: string
  ): Promise<Expense> {
    if (updateExpenseDto.category) {
      const expense = await this.findOne(id, companyId)
      if (!expense) {
        throw new NotFoundException(`Gasto con ID ${id} no encontrado`)
      }

    }

    return this.expenseRepository
      .findOneAndUpdate({ _id: id, companyId }, updateExpenseDto, { new: true })
      .populate('companyId')
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

    try {
      let approverName = 'Administrador del Sistema'

      if (userName && userLastName) {
        approverName = `${userName} ${userLastName}`
        this.logger.debug(
          `Usando información de aprobador encontrada previamente: ${approverName}`
        )
      } else if (validUserId) {
        try {
          const approver = await this.usersService.findOne(
            validUserId,
            companyId
          )
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
            return updatedExpense
          }

          const creator = await this.usersService.findOne(
            expense.createdBy,
            companyId
          )

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
                  invoiceNumber: `${invoiceData.serie || ''}-${invoiceData.correlativo || ''
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
                  invoiceNumber: `${invoiceData.serie || ''}-${invoiceData.correlativo || ''
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
                    invoiceNumber: `${invoiceData.serie || ''}-${invoiceData.correlativo || ''
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

    return updatedExpense
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

    try {
      let rejectorName = 'Administrador del Sistema'

      if (userName && userLastName) {
        rejectorName = `${userName} ${userLastName}`
        this.logger.debug(
          `Usando información de rechazador encontrada previamente: ${rejectorName}`
        )
      } else if (validUserId) {
        try {
          const rejector = await this.usersService.findOne(
            validUserId,
            companyId
          )
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
            return updatedExpense
          }

          const creator = await this.usersService.findOne(
            expense.createdBy,
            companyId
          )

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
                  invoiceNumber: `${invoiceData.serie || ''}-${invoiceData.correlativo || ''
                    }`,
                  date:
                    invoiceData.fechaEmision ||
                    new Date().toISOString().split('T')[0],
                  type: invoiceData.tipoComprobante || 'Factura',
                  rejectionReason: approvalDto.reason,
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
                  invoiceNumber: `${invoiceData.serie || ''}-${invoiceData.correlativo || ''
                    }`,
                  date:
                    invoiceData.fechaEmision ||
                    new Date().toISOString().split('T')[0],
                  type: invoiceData.tipoComprobante || 'Factura',
                  rejectionReason: approvalDto.reason,
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
                    invoiceNumber: `${invoiceData.serie || ''}-${invoiceData.correlativo || ''
                      }`,
                    date:
                      invoiceData.fechaEmision ||
                      new Date().toISOString().split('T')[0],
                    type: invoiceData.tipoComprobante || 'Factura',
                    rejectionReason: approvalDto.reason,
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

    return updatedExpense
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.expenseRepository.findOneAndDelete({ _id: id, companyId }).exec()
  }
}
