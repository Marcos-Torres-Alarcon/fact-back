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
} from '@nestjs/common'
import { ExpenseService } from './expense.service'
import { CreateExpenseDto } from './dto/create-expense.dto'
import { UpdateExpenseDto } from './dto/update-expense.dto'
import { ApprovalDto } from './dto/approval.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../auth/enums/user-role.enum'

@Controller('expense')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  private readonly logger = new Logger(ExpenseController.name)

  constructor(private readonly expenseService: ExpenseService) { }

  @Post('analyze-image')
  analyzeImage(@Body() body: CreateExpenseDto, @Request() req) {
    return this.expenseService.analyzeImageWithUrl(body)
  }

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    const companyId = req.user.companyId
    return this.expenseService.create(createExpenseDto, companyId)
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ADMIN2, UserRole.COLABORADOR)
  findAll(@Request() req) {
    this.logger.debug(
      `Usuario autenticado en findAll: ${JSON.stringify(req.user)}`
    )
    const companyId = req.user.companyId
    this.logger.debug(
      `companyId recibido en findAll: ${companyId} (tipo: ${typeof companyId})`
    )
    return this.expenseService.findAll(companyId)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const companyId = req.user.companyId
    return this.expenseService.findOne(id, companyId)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Request() req
  ) {
    const companyId = req.user.companyId
    return this.expenseService.update(id, updateExpenseDto, companyId)
  }

  @Patch(':id/approve')
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

  @Patch(':id/reject')
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

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const companyId = req.user.companyId
    return this.expenseService.remove(id, companyId)
  }
}
