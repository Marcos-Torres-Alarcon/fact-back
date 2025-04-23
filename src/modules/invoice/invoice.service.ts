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
interface InvoiceData {
  rucEmisor?: string;
  tipoComprobante?: string; // Ej: '01' para Factura, '03' para Boleta
  serie?: string;
  correlativo?: string;
  fechaEmision?: string; // Formato YYYY-MM-DD
  montoTotal?: number;
  // Otros campos si son necesarios para la API de SUNAT
}

import * as Tesseract from 'tesseract.js';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);
  constructor(
    @InjectModel(Invoice.name)
    private invoiceModel: Model<InvoiceDocument>,
    private readonly httpService: HttpService,
  ) { }

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
      'Content-Type': 'application/x-www-form-urlencoded'
    }

    const grant_type = 'client_credentials'
    const scope = 'https://api.sunat.gob.pe/v1/contribuyente/contribuyentes'
    const client_id = process.env.ID_SUNAT
    const client_secret = process.env.KEY_SUNAT

    const data = {
      grant_type: grant_type,
      scope: scope,
      client_id: client_id,
      client_secret: client_secret
    }
    try {
      const response = await firstValueFrom(this.httpService.post(api, data, { headers }))
      console.log(response.data)
      return response.data
    } catch (error) {
      console.log(error)
    }
  }


  async validateInvoiceFromImage(imageBuffer: Buffer): Promise<any> {
    this.logger.log('Starting OCR process...');
    let ocrText: string;
    try {
      // 1. Procesamiento OCR
      const result = await Tesseract.recognize(imageBuffer, 'spa', { // 'spa' para español
        logger: m => this.logger.debug(`Tesseract: <span class="math-inline">\{m\.status\} \(</span>{(m.progress * 100).toFixed(2)}%)`), // Loguear progreso
      });
      ocrText = result.data.text;
      this.logger.log('OCR process completed.');
      this.logger.debug(`OCR Raw Text: \n${ocrText}`); // Cuidado con datos sensibles en logs de producción
    } catch (error) {
      this.logger.error(`OCR failed: ${error.message}`, error.stack);
      throw new HttpException('Error al procesar la imagen con OCR.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 2. Extracción de Datos (¡La parte más compleja y variable!)
    this.logger.log('Extracting data from OCR text...');
    const extractedData = this.extractDataFromText(ocrText);
    this.logger.log(`Data extracted: ${JSON.stringify(extractedData)}`);

    if (!this.areEssentialDataPresent(extractedData)) {
      this.logger.warn('Essential data missing after extraction.');
      throw new HttpException(
        'No se pudieron extraer los datos necesarios de la imagen (RUC, Serie, Número, Fecha, Monto). Verifique la calidad de la imagen.',
        HttpStatus.BAD_REQUEST,
      );
    }


    // 3. Llamada al API de SUNAT (Ejemplo conceptual con REST - ¡ADAPTAR!)
    this.logger.log('Calling SUNAT validation service...');
    try {
      // --- ¡IMPORTANTE! ---
      // Debes investigar cuál es el endpoint EXACTO y los parámetros requeridos
      // por el servicio de validación de SUNAT que quieres usar.
      // Históricamente, ha habido servicios SOAP como 'billService' con métodos
      // como 'getStatus' o 'getStatusCdr'. Puede que existan APIs REST más nuevas.
      // Consulta la documentación oficial de SUNAT o plataformas de proveedores de API.
      // El siguiente es un EJEMPLO HIPOTÉTICO de cómo sería con REST.

      const sunatApiUrl = process.env.SUNAT_API_URL || 'URL_DEL_SERVICIO_SUNAT'; // Usa variables de entorno
      const sunatApiKey = process.env.SUNAT_API_KEY; // Si requiere autenticación

      const params = {
        numRuc: extractedData.rucEmisor,
        codComp: extractedData.tipoComprobante, // Ej: '01'
        numeroSerie: extractedData.serie, // Ej: 'F001'
        numero: extractedData.correlativo, // Ej: '12345'
        fechaEmision: extractedData.fechaEmision, // Formato requerido por SUNAT (puede ser DD/MM/YYYY)
        monto: extractedData.montoTotal?.toFixed(2), // Formato requerido por SUNAT
      };

      const headers = {};
      if (sunatApiKey) {
        // headers['Authorization'] = `Bearer ${sunatApiKey}`; // O el método que use SUNAT
        headers['ApiKey'] = sunatApiKey;
      }

      this.logger.debug(`Requesting SUNAT: URL=<span class="math-inline">\{sunatApiUrl\}, Params\=</span>{JSON.stringify(params)}`);

      // Usando HttpService (@nestjs/axios)
      const response = await firstValueFrom(
        this.httpService.get(sunatApiUrl, { params, headers })
        // O post si es un POST: this.httpService.post(sunatApiUrl, params, { headers })
      );

      this.logger.log(`SUNAT response status: ${response.status}`);
      this.logger.debug(`SUNAT response data: ${JSON.stringify(response.data)}`);

      // 4. Interpretar la respuesta de SUNAT
      // La estructura de response.data dependerá TOTALMENTE del API de SUNAT.
      // Necesitas mapear su respuesta a un formato útil para tu frontend.
      // Ejemplo: SUNAT podría devolver un código de estado (0 = existe, 1 = no existe, etc.)
      // y quizás detalles adicionales como el estado del comprobante (Aceptado, Rechazado, Baja).

      const validationResult = this.interpretSunatResponse(response.data);

      return {
        message: 'Validación completada.',
        status: validationResult.status, // 'VALIDO', 'INVALIDO', 'ERROR_SUNAT', etc.
        details: validationResult.details, // Mensajes o datos adicionales de SUNAT
        extractedData: extractedData, // Opcional: devolver los datos extraídos
      };

    } catch (error) {
      if (error.response) { // Error desde Axios (respuesta de SUNAT con error HTTP)
        this.logger.error(`SUNAT API Error: Status ${error.response.status} - ${JSON.stringify(error.response.data)}`, error.stack);
        throw new HttpException(`Error en la comunicación con SUNAT: ${error.response.status}`, HttpStatus.SERVICE_UNAVAILABLE);
      } else { // Error de red, timeout, etc.
        this.logger.error(`SUNAT communication failed: ${error.message}`, error.stack);
        throw new HttpException('No se pudo conectar con el servicio de SUNAT.', HttpStatus.SERVICE_UNAVAILABLE);
      }
    }
  }

  // --- Funciones Auxiliares ---

  private extractDataFromText(text: string): InvoiceData {
    this.logger.log('Attempting data extraction using RegEx...');
    const data: InvoiceData = {};

    // --- ¡ESTA ES LA PARTE MÁS FRÁGIL! ---
    // Las expresiones regulares dependen MUCHO del formato de la factura
    // y de la calidad del OCR. Necesitarás ajustarlas probando con imágenes reales.

    // RUC Emisor (Busca "RUC:" seguido de 11 dígitos)
    let match = text.match(/R\.?U\.?C\.?\s*:?\s*(\d{11})/i);
    if (match) data.rucEmisor = match[1];
    // Si no, intenta buscar solo 11 dígitos (menos preciso)
    // if (!data.rucEmisor) {
    //     match = text.match(/(\b\d{11}\b)/);
    //     // Podrías necesitar lógica adicional para diferenciar emisor/receptor
    // }

    // Tipo de Comprobante, Serie y Correlativo (Ej: F001-0012345, E001-123, B002-54321)
    // Intenta buscar patrones comunes de Factura (F), Boleta (B), Nota Crédito (F/B), Nota Débito (F/B) Electrónicas
    match = text.match(/\b([FB][A-Z0-9]{3})\s*[-–—]\s*(\d{1,8})\b/i); // F001-12345 o B001-123
    if (match) {
      data.serie = match[1].toUpperCase();
      data.correlativo = match[2].padStart(8, '0'); // SUNAT a veces espera 8 dígitos
      // Determinar tipo basado en la letra inicial de la serie
      if (data.serie.startsWith('F')) data.tipoComprobante = '01'; // Factura
      else if (data.serie.startsWith('B')) data.tipoComprobante = '03'; // Boleta
      // Añadir lógica para Notas de Crédito (07) / Débito (08) si es necesario (pueden empezar con F/B también)
    } else {
      // Intenta buscar el formato de Ticket (T) si aplica TXXX-12345678
      match = text.match(/\b(T[A-Z0-9]{3})\s*[-–—]\s*(\d{1,8})\b/i);
      if (match) {
        data.serie = match[1].toUpperCase();
        data.correlativo = match[2].padStart(8, '0');
        data.tipoComprobante = '12'; // Ticket o Cinta emitido por máquina registradora
        // O '00' Otros, o el código específico si lo sabes.
      }
      // Podrías necesitar más patrones para otros tipos o formatos físicos.
    }


    // Fecha Emisión (Busca DD/MM/YYYY o DD-MM-YYYY)
    match = text.match(/Fecha\s*(?:de\s*)?Emisi[oó]n\s*:?\s*(\d{1,2})[\s\/-](\d{1,2})[\s\/-](\d{4})/i);
    if (!match) { // Intenta buscar la fecha sin el texto "Fecha Emisión" cerca
      match = text.match(/(\d{1,2})[\s\/-](\d{1,2})[\s\/-](\d{4})/);
    }
    if (match) {
      // Asegura formato YYYY-MM-DD para consistencia
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      if (parseInt(year) > 1990 && parseInt(month) >= 1 && parseInt(month) <= 12 && parseInt(day) >= 1 && parseInt(day) <= 31) {
        data.fechaEmision = `<span class="math-inline">\{year\}\-</span>{month}-${day}`;
        // Podrías querer devolver también el formato DD/MM/YYYY si la API de SUNAT lo prefiere
        // data.fechaEmisionSunatFormat = `<span class="math-inline">\{day\}/</span>{month}/${year}`;
      }
    }

    // Monto Total (Busca "TOTAL", "IMPORTE TOTAL", etc., seguido de un número con decimales)
    // Esto es MUY propenso a errores por formatos, símbolos de moneda (S/, PEN), separadores (, .)
    match = text.match(/(?:TOTAL|IMPORTE\s*TOTAL)\s*(?:(?:S\/?\.?|PEN)\s*)?[:\s]*([\d,]+\.\d{2})\b/i);
    if (!match) { // Intenta buscar sólo un número flotante al final o cerca de palabras clave
      match = text.match(/([\d,]+\.\d{2})\b/i); // Puede capturar otros números
      // Podrías necesitar lógica para buscar el número más grande o el último
    }
    if (match) {
      // Limpia comas de miles y convierte a número
      const amountString = match[1].replace(/,/g, '');
      data.montoTotal = parseFloat(amountString);
    }

    this.logger.debug(`Extraction Results: ${JSON.stringify(data)}`);
    return data;
  }

  private areEssentialDataPresent(data: InvoiceData): boolean {
    const requiredFields: (keyof InvoiceData)[] = [
      'rucEmisor',
      'tipoComprobante',
      'serie',
      'correlativo',
      'fechaEmision',
      'montoTotal'
    ];
    const missing = requiredFields.filter(field => data[field] === undefined || data[field] === null || data[field] === '');
    if (missing.length > 0) {
      this.logger.warn(`Missing essential fields: ${missing.join(', ')}`);
      return false;
    }
    // Validación adicional simple (ej: RUC longitud)
    if (data.rucEmisor?.length !== 11) {
      this.logger.warn(`Invalid RUC length: ${data.rucEmisor}`);
      return false;
    }
    return true;
  }


  // Función para interpretar la respuesta específica de SUNAT
  private interpretSunatResponse(sunatData: any): { status: string; details: any } {
    this.logger.log('Interpreting SUNAT response...');
    // --- ¡ESTO DEPENDE TOTALMENTE DE LA API DE SUNAT! ---
    // Analiza la estructura de 'sunatData' y determina el estado.
    // Ejemplo hipotético:
    if (sunatData.success === true && sunatData.data?.estadoCp === '1') { // '1' podría ser ACEPTADO
      return { status: 'VALIDO_ACEPTADO', details: sunatData.data };
    } else if (sunatData.success === true && sunatData.data?.estadoCp === '0') { // '0' podría ser RECHAZADO o ANULADO
      return { status: 'VALIDO_RECHAZADO_ANULADO', details: sunatData.data };
    } else if (sunatData.cod === '98') { // Código hipotético para "no encontrado"
      return { status: 'NO_ENCONTRADO', details: sunatData.msg || 'El comprobante no existe en SUNAT.' };
    } else { // Otros errores o casos
      this.logger.warn(`Uninterpretable SUNAT response: ${JSON.stringify(sunatData)}`);
      return { status: 'ERROR_SUNAT', details: sunatData };
    }
  }
}



