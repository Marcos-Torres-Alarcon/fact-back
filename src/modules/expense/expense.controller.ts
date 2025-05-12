import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

@Controller('expense')
export class ExpenseController {

  private readonly logger = new Logger(ExpenseController.name)

  constructor(
    private readonly expenseService: ExpenseService,
  ) {
  }


  @Post('upload')
  @UseInterceptors(
    FileInterceptor('invoice', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/xml',
          'text/xml',
        ]
        if (allowedMimeTypes.includes(file.mimetype)) {
          callback(null, true)
        } else {
          callback(new Error('Tipo de archivo no soportado'), false)
        }
      },
    })
  )
  async uploadInvoice(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    this.logger.log(`Received file: ${file?.originalname}, size: ${file?.size}`)

    if (!file || !file.buffer) {
      this.logger.error('No file uploaded or file buffer is missing')
      throw new HttpException(
        'No se recibió ningún archivo o el archivo está corrupto.',
        HttpStatus.BAD_REQUEST
      )
    }

    try {
      const result = await this.expenseService.uploadInvoice(
        file.buffer,
        file.mimetype,
        body
      )
      return result
    } catch (error) {
      this.logger.error(
        `Error processing file ${file.originalname}: ${error.message}`,
        error.stack
      )
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Error procesando el archivo o validando la factura.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  findAll() {
    return this.expenseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expenseService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expenseService.remove(id);
  }
}
