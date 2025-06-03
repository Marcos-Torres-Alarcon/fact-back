import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Logger,
  Query,
} from '@nestjs/common'
import { ExpenseService } from './expense.service'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { UpdateExpenseDto } from './dto/update-expense.dto'
import { ApprovalDto } from './dto/approval.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../auth/enums/user-role.enum'
import { RolesGuard } from '../auth/guards/roles.guard'

@Controller('expense')
export class ExpenseController {
  private readonly logger = new Logger(ExpenseController.name)

  constructor(private readonly expenseService: ExpenseService) {}

  @Post('analyze-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COLABORADOR)
  analyzeImage(@Body() body: CreateExpenseDto, @Request() req) {
    // Debug: ver qué contiene req.user
    this.logger.debug('req.user:', JSON.stringify(req.user, null, 2))
    this.logger.debug('body.companyId:', body.companyId)

    // Usar el companyId del body si está disponible, sino intentar del token
    const companyId = body.companyId || req.user?.companyId
    if (!companyId) {
      throw new Error('No se pudo obtener la empresa del usuario ni del body')
    }

    // Asegurar que el body tenga el companyId y userId correctos
    body.companyId = companyId
    body.userId = req.user?.sub || req.user?._id || body.userId

    return this.expenseService.analyzeImageWithUrl(body)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    const companyId = req.user.companyId
    return this.expenseService.create(createExpenseDto, companyId)
  }

  @Get(':companyId')
  findAll(@Param('companyId') companyId: string, @Query() query: any) {
    return this.expenseService.findAll(companyId, query)
  }

  @Get(':id/:companyId')
  findOne(@Param('id') id: string, @Param('companyId') companyId: string) {
    return this.expenseService.findOne(id, companyId)
  }

  @Patch(':id/:companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COLABORADOR)
  update(
    @Param('id') id: string,
    @Param('companyId') companyId: string,
    @Body() updateExpenseDto: UpdateExpenseDto
  ) {
    return this.expenseService.update(id, updateExpenseDto, companyId)
  }

  @Patch(':id/:companyId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  approveInvoice(
    @Param('id') id: string,
    @Body() approvalDto: ApprovalDto,
    @Request() req
  ) {
    this.logger.debug(
      `Contenido de req.user: ${JSON.stringify(req.user || 'No disponible')}`
    )

    if (req.user && req.user._id) {
      this.logger.debug(`Usando ID de usuario del JWT: ${req.user._id}`)
      approvalDto.userId = req.user._id
    } else if (req.user && req.user.sub) {
      this.logger.debug(
        `Usando ID de usuario del campo sub del JWT: ${req.user.sub}`
      )
      approvalDto.userId = req.user.sub
    } else {
      this.logger.warn(
        `No se encontró ID de usuario en el JWT, se usará el proporcionado: ${approvalDto.userId || 'ninguno'}`
      )
    }
    const companyId = req.user.companyId
    return this.expenseService.approveInvoice(id, approvalDto, companyId)
  }

  @Patch(':id/:companyId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADMIN2)
  rejectInvoice(
    @Param('id') id: string,
    @Body() approvalDto: ApprovalDto,
    @Request() req
  ) {
    this.logger.debug(
      `Contenido de req.user: ${JSON.stringify(req.user || 'No disponible')}`
    )

    if (req.user && req.user._id) {
      this.logger.debug(`Usando ID de usuario del JWT: ${req.user._id}`)
      approvalDto.userId = req.user._id
    } else if (req.user && req.user.sub) {
      this.logger.debug(
        `Usando ID de usuario del campo sub del JWT: ${req.user.sub}`
      )
      approvalDto.userId = req.user.sub
    } else {
      this.logger.warn(
        `No se encontró ID de usuario en el JWT, se usará el proporcionado: ${approvalDto.userId || 'ninguno'}`
      )
    }
    const companyId = req.user.companyId
    return this.expenseService.rejectInvoice(id, approvalDto, companyId)
  }

  @Delete(':id/:companyId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COLABORADOR)
  remove(@Param('id') id: string, @Param('companyId') companyId: string) {
    return this.expenseService.remove(id, companyId)
  }
}
