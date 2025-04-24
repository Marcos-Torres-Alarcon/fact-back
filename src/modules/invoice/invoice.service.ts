import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateInvoiceDto, InvoiceStatus } from './dto/create-invoice.dto'
import { UpdateInvoiceDto } from './dto/update-invoice.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Invoice, InvoiceDocument } from './entities/invoice.entity'
import { HttpService } from '@nestjs/axios'
import * as Tesseract from 'tesseract.js'
import * as pdfParse from 'pdf-parse'
import * as fs from 'fs'
import * as path from 'path'
import { firstValueFrom } from 'rxjs'

interface InvoiceData {
  rucEmisor?: string
  tipoComprobante?: string // Ej: '01' para Factura, '03' para Boleta
  serie?: string
  correlativo?: string
  fechaEmision?: string // Formato YYYY-MM-DD
  montoTotal?: number
  // Otros campos si son necesarios para la API de SUNAT
}

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name)
  private readonly tempDir = path.join(process.cwd(), 'temp')

  constructor(
    @InjectModel(Invoice.name)
    private invoiceModel: Model<InvoiceDocument>,
    private readonly httpService: HttpService
  ) {
    // Asegurarse de que el directorio temporal existe y tiene permisos
    try {
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir, { recursive: true })
      }
      // Verificar permisos de escritura
      const testFile = path.join(this.tempDir, 'test.txt')
      fs.writeFileSync(testFile, 'test')
      fs.unlinkSync(testFile)
    } catch (error) {
      this.logger.error(
        `Error al configurar directorio temporal: ${error.message}`
      )
      throw new HttpException(
        'Error al configurar el directorio temporal. Verifique los permisos.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

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

  ////SUNAT

  async generateTokenSunat() {
    const api = `https://api-seguridad.sunat.gob.pe/v1/clientesextranet/${process.env.ID_SUNAT}/oauth2/token/`
    //x-www-form-urlencoded
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    const grant_type = 'client_credentials'
    const scope = 'https://api.sunat.gob.pe/v1/contribuyente/contribuyentes'
    const client_id = process.env.ID_SUNAT
    const client_secret = process.env.KEY_SUNAT

    const data = {
      grant_type: grant_type,
      scope: scope,
      client_id: client_id,
      client_secret: client_secret,
    }
    try {
      const response = await firstValueFrom(
        this.httpService.post(api, data, { headers })
      )
      console.log(response.data)
      return response.data
    } catch (error) {
      console.log(error)
    }
  }

  async validateInvoiceFromImage(
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<any> {
    this.logger.log('Starting file processing...')
    let extractedData: any

    try {
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new HttpException(
          'El archivo está vacío o no se pudo leer correctamente',
          HttpStatus.BAD_REQUEST
        )
      }

      if (mimeType.startsWith('image/') || mimeType === 'application/pdf') {
        this.logger.log(
          `Processing ${mimeType === 'application/pdf' ? 'PDF' : 'image'} with OCR...`
        )

        this.logger.debug(`File buffer length: ${fileBuffer.length}`)

        try {
          let text: string

          if (mimeType === 'application/pdf') {
            try {
              this.logger.debug('Extrayendo texto del PDF...')
              const pdfData = await pdfParse(fileBuffer)
              text = pdfData.text
              this.logger.debug(
                `Texto extraído del PDF: ${text.length} caracteres`
              )

              if (!text || text.trim().length === 0) {
                throw new Error('No se pudo extraer texto del PDF')
              }
            } catch (error) {
              this.logger.error(
                `Error al extraer texto del PDF: ${error.message}`
              )
              throw new HttpException(
                'Error al leer el PDF. Verifique que el archivo sea válido y contenga texto.',
                HttpStatus.BAD_REQUEST
              )
            }
          } else {
            // Para imágenes, usamos Tesseract como antes
            const worker = await Tesseract.createWorker('spa')
            const result = await worker.recognize(fileBuffer)
            await worker.terminate()
            text = result.data.text
          }

          if (!text || text.trim().length === 0) {
            this.logger.error('No se pudo extraer texto del archivo')
            throw new HttpException(
              'No se pudo extraer texto del archivo. Verifique que el archivo sea legible.',
              HttpStatus.BAD_REQUEST
            )
          }

          this.logger.debug(`Extracted text length: ${text.length}`)
          extractedData = this.extractDataFromText(text)

          if (!this.areEssentialDataPresent(extractedData)) {
            this.logger.warn('Essential data missing after extraction.')
            throw new HttpException(
              'No se pudieron extraer los datos necesarios del archivo. Verifique el formato.',
              HttpStatus.BAD_REQUEST
            )
          }
        } catch (error) {
          this.logger.error(`Error during processing: ${error.message}`)
          throw new HttpException(
            'Error al procesar el archivo. Verifique que el archivo sea legible.',
            HttpStatus.BAD_REQUEST
          )
        }
      } else if (mimeType === 'application/xml' || mimeType === 'text/xml') {
        // Procesamiento de XML
        this.logger.log('Processing XML file...')
        throw new HttpException(
          'Procesamiento de XML aún no implementado.',
          HttpStatus.NOT_IMPLEMENTED
        )
      }

      // Llamada al API de SUNAT solo si tenemos datos extraídos
      if (extractedData) {
        this.logger.log('Calling SUNAT validation service...')
        const sunatApiUrl =
          process.env.SUNAT_API_URL || 'URL_DEL_SERVICIO_SUNAT'
        const sunatApiKey = process.env.SUNAT_API_KEY

        if (!sunatApiUrl || !sunatApiKey) {
          this.logger.error('SUNAT API configuration missing')
          throw new HttpException(
            'Configuración de SUNAT incompleta. Contacte al administrador.',
            HttpStatus.INTERNAL_SERVER_ERROR
          )
        }

        const params = {
          numRuc: extractedData.rucEmisor,
          codComp: extractedData.tipoComprobante,
          numeroSerie: extractedData.serie,
          numero: extractedData.correlativo,
          fechaEmision: extractedData.fechaEmision,
          monto: extractedData.montoTotal?.toFixed(2),
        }

        const headers = {
          ApiKey: sunatApiKey,
          'Content-Type': 'application/json',
        }

        this.logger.debug(
          `Requesting SUNAT: URL=${sunatApiUrl}, Params=${JSON.stringify(params)}`
        )

        try {
          const response = await firstValueFrom(
            this.httpService.get(sunatApiUrl, { params, headers })
          )

          this.logger.log(`SUNAT response status: ${response.status}`)
          this.logger.debug(
            `SUNAT response data: ${JSON.stringify(response.data)}`
          )

          const validationResult = this.interpretSunatResponse(response.data)

          return {
            message: 'Validación completada.',
            status: validationResult.status,
            details: validationResult.details,
            extractedData: extractedData,
          }
        } catch (error) {
          this.logger.error(`SUNAT API Error: ${error.message}`, error.stack)
          throw new HttpException(
            'Error en la comunicación con SUNAT. Por favor, intente nuevamente más tarde.',
            HttpStatus.SERVICE_UNAVAILABLE
          )
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      this.logger.error(`Processing failed: ${error.message}`, error.stack)
      throw new HttpException(
        'Error procesando el archivo. Por favor, intente nuevamente.',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  // --- Funciones Auxiliares ---

  private extractDataFromText(text: string): InvoiceData {
    this.logger.log('Attempting data extraction using RegEx...')
    const data: InvoiceData = {}

    // RUC Emisor (Busca "RUC:" seguido de 11 dígitos)
    let match = text.match(/R\.?U\.?C\.?\s*:?\s*(\d{11})/i)
    if (match) data.rucEmisor = match[1]
    // Si no, intenta buscar solo 11 dígitos (menos preciso)
    if (!data.rucEmisor) {
      match = text.match(/(\b\d{11}\b)/)
      if (match) data.rucEmisor = match[1]
    }

    // Tipo de Comprobante, Serie y Correlativo
    // Intenta buscar diferentes formatos de serie y correlativo
    // Formato 1: E001-19220608417061
    match = text.match(/\b([A-Z]\d{3})\s*[-–—]\s*(\d{1,20})\b/i)
    if (match) {
      data.serie = match[1].toUpperCase()
      data.correlativo = match[2]
      // Determinar tipo basado en la letra inicial de la serie
      if (data.serie.startsWith('F'))
        data.tipoComprobante = '01' // Factura
      else if (data.serie.startsWith('B'))
        data.tipoComprobante = '03' // Boleta
      else if (data.serie.startsWith('E')) data.tipoComprobante = '01' // Factura Electrónica
    }

    // Fecha Emisión (Busca DD/MM/YYYY o DD-MM-YYYY)
    match = text.match(
      /Fecha\s*(?:de\s*)?Emisi[oó]n\s*:?\s*(\d{1,2})[\s\/-](\d{1,2})[\s\/-](\d{4})/i
    )
    if (!match) {
      // Intenta buscar la fecha sin el texto "Fecha Emisión" cerca
      match = text.match(/(\d{1,2})[\s\/-](\d{1,2})[\s\/-](\d{4})/)
    }
    if (match) {
      // Asegura formato YYYY-MM-DD para consistencia
      const day = match[1].padStart(2, '0')
      const month = match[2].padStart(2, '0')
      const year = match[3]
      if (
        parseInt(year) > 1990 &&
        parseInt(month) >= 1 &&
        parseInt(month) <= 12 &&
        parseInt(day) >= 1 &&
        parseInt(day) <= 31
      ) {
        data.fechaEmision = `${year}-${month}-${day}`
      }
    }

    // Monto Total (Busca "TOTAL", "IMPORTE TOTAL", etc., seguido de un número con decimales)
    match = text.match(
      /(?:TOTAL|IMPORTE\s*TOTAL)\s*(?:(?:S\/?\.?|PEN)\s*)?[:\s]*([\d,]+\.\d{2})\b/i
    )
    if (!match) {
      // Intenta buscar sólo un número flotante al final o cerca de palabras clave
      match = text.match(/([\d,]+\.\d{2})\b/i)
    }
    if (match) {
      // Limpia comas de miles y convierte a número
      const amountString = match[1].replace(/,/g, '')
      data.montoTotal = parseFloat(amountString)
    }

    this.logger.debug(`Extraction Results: ${JSON.stringify(data)}`)
    return data
  }

  private areEssentialDataPresent(data: InvoiceData): boolean {
    const requiredFields: (keyof InvoiceData)[] = [
      'rucEmisor',
      'tipoComprobante',
      'serie',
      'correlativo',
      'fechaEmision',
      'montoTotal',
    ]
    const missing = requiredFields.filter(
      field =>
        data[field] === undefined || data[field] === null || data[field] === ''
    )
    if (missing.length > 0) {
      this.logger.warn(`Missing essential fields: ${missing.join(', ')}`)
      return false
    }
    // Validación adicional simple (ej: RUC longitud)
    if (data.rucEmisor?.length !== 11) {
      this.logger.warn(`Invalid RUC length: ${data.rucEmisor}`)
      return false
    }
    return true
  }

  // Función para interpretar la respuesta específica de SUNAT
  private interpretSunatResponse(sunatData: any): {
    status: string
    details: any
  } {
    this.logger.log('Interpreting SUNAT response...')
    // --- ¡ESTO DEPENDE TOTALMENTE DE LA API DE SUNAT! ---
    // Analiza la estructura de 'sunatData' y determina el estado.
    // Ejemplo hipotético:
    if (sunatData.success === true && sunatData.data?.estadoCp === '1') {
      // '1' podría ser ACEPTADO
      return { status: 'VALIDO_ACEPTADO', details: sunatData.data }
    } else if (sunatData.success === true && sunatData.data?.estadoCp === '0') {
      // '0' podría ser RECHAZADO o ANULADO
      return { status: 'VALIDO_RECHAZADO_ANULADO', details: sunatData.data }
    } else if (sunatData.cod === '98') {
      // Código hipotético para "no encontrado"
      return {
        status: 'NO_ENCONTRADO',
        details: sunatData.msg || 'El comprobante no existe en SUNAT.',
      }
    } else {
      // Otros errores o casos
      this.logger.warn(
        `Uninterpretable SUNAT response: ${JSON.stringify(sunatData)}`
      )
      return { status: 'ERROR_SUNAT', details: sunatData }
    }
  }
}
