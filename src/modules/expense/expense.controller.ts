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

@Controller('expense')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  private readonly logger = new Logger(ExpenseController.name)

  constructor(private readonly expenseService: ExpenseService) {}

  @Post('analyze-image')
  analyzeImage(@Body() body: CreateExpenseDto) {
    return this.expenseService.analyzeImageWithUrl(body)
  }

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(createExpenseDto)
  }

  @Get()
  findAll() {
    return this.expenseService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expenseService.update(id, updateExpenseDto)
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

    return this.expenseService.approveInvoice(id, approvalDto)
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

    return this.expenseService.rejectInvoice(id, approvalDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseService.remove(id)
  }
}
