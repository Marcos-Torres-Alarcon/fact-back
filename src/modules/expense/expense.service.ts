import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { Model } from 'mongoose'
import { Expense } from './entities/expense.entity';
import { InjectModel } from '@nestjs/mongoose';
@Injectable()
export class ExpenseService {

  private readonly logger = new Logger(ExpenseService.name)

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Expense.name)
    private expenseRepository: Model<Expense>
  ) {
    const googleApiKey = this.configService.get<string>('GOOGLE_AI_KEY');

    if (!googleApiKey) {
      this.logger.error('La API Key de Google AI no está configurada.');
      throw new Error('GOOGLE_AI_KEY is not defined in environment variables.');
    }

  }

  async createCompletation(imagePart: any) {
    if (!imagePart) {
      throw new HttpException(
        'El archivo de entrada está vacío',
        HttpStatus.BAD_REQUEST
      );
    }

    const llm = new ChatGoogleGenerativeAI({
      apiKey: this.configService.get<string>('GOOGLE_AI_KEY'),
      model: 'gemini-2.0-flash',
      // temperature: 0.7
    });

    const systemPrompt = `
    # Rol: Eres un experto en contabilidad y finanzas en el Perú con 10 años de experiencia, experto en facturas y boletas. .
    # Analiza el tipo de facturas y boletas que se emiten en el Perú.
    # Tareas: Debes extraer los datos de la factura y crear un objeto con los datos de la factura.
    # Entrada: Un texto con los datos de la factura.
    # Salida: Un objeto con los datos de la factura.
    # Campos del objeto:
      - rucEmisor: normalmente es un numero, por ejemplo 20503000001 siempre tiene 11 digitos
      - tipoComprobante: normalmente es una palabra, por ejemplo Factura
      - serie: normalmente es una letra con numeros, por ejemplo E001
      - correlativo: normalmente es un numero, y va seguido de la serie, por ejemplo E001-123
      - fechaEmision: normalmente es una fecha, por ejemplo 2021-01-01
      - montoTotal: normalmente es un numero, por ejemplo 1000
      - moneda: normalmente es un simbolo de moneda, por ejemplo PEN, S/ O $
    # Ejemplo de salida:
    {
      "rucEmisor": "20503000001",
      "tipoComprobante": "Factura",
      "serie": "E001",
      "correlativo": "123",
      "fechaEmision": "2021-01-01",
      "montoTotal": 1000,
      "moneda": "PEN"
    }

    # Reglas:
      - Debes extraer los datos de la factura y crear un objeto con los datos de la factura.
      - Debes usar el idioma del texto de la factura.
      - Debes usar el formato de salida especificado.
      - Debes usar la precisión y el contexto del texto de la factura para extraer los datos.
      - Si no encuentras todos los datos necesarios, responde con un objeto vacio.
      
    `;

    const message = new HumanMessage({
      content: [
        // Parte de texto (el prompt)
        {
          type: "text",
          text: systemPrompt,
        },
        // Parte de imagen (usando el Data URI)
        {
          type: "image_url",
          image_url: {
            url: imagePart
          },
        },
      ],
    });

    try {
      const response = await llm.invoke([message]);
      if (!response) {
        throw new Error('No se recibió una respuesta válida del modelo');
      }
      const content = response.content as string;
      const jsonStringLimpio = content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const jsonObject = JSON.parse(jsonStringLimpio);
      return jsonObject;
    } catch (error) {
      this.logger.error(`Error durante el procesamiento: ${error.message}`);
      throw new HttpException(
        'Error al procesar el texto. Por favor, verifique que el contenido sea legible.',
        HttpStatus.BAD_REQUEST
      );
    }
  }
  async uploadInvoice(
    fileBuffer: Buffer,
    mimeType: string,
    body: any
  ): Promise<any> {
    this.logger.log('Starting file processing...')

    try {
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new HttpException(
          'El archivo está vacío o no se pudo leer correctamente',
          HttpStatus.BAD_REQUEST
        )
      }

      this.logger.log(
        `Processing ${mimeType === 'application/pdf' ? 'PDF' : 'image'} with OCR...`
      )

      this.logger.debug(`File buffer length: ${fileBuffer.length}`)

      try {
        // let text: string
        // const worker = await Tesseract.createWorker('spa')
        // const result = await worker.recognize(fileBuffer)
        // await worker.terminate()
        // text = result.data.text


        // if (!text || text.trim().length === 0) {
        //   this.logger.error('No se pudo extraer texto del archivo')
        //   throw new HttpException(
        //     'No se pudo extraer texto del archivo. Verifique que el archivo sea legible.',
        //     HttpStatus.BAD_REQUEST
        //   )
        // }
        // this.logger.debug(`Extracted text length: ${text.length}`)

        const base64File = fileBuffer.toString('base64')
        const imageDataUri = `data:${mimeType};base64,${base64File}`;


        const response = await this.createCompletation(imageDataUri)
        const expense = await this.expenseRepository.create({
          ...body,
          total: response.montoTotal,
          data: JSON.stringify(response),
          file: `data:${mimeType};base64,${base64File}`
        })

        return expense


      } catch (error) {
        this.logger.error(`Error during processing: ${error.message}`)
        throw new HttpException(
          'Error al procesar el archivo. Verifique que el archivo sea legible.',
          HttpStatus.BAD_REQUEST
        )
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
    return this.expenseRepository.findByIdAndUpdate(id, updateExpenseDto, { new: true }).exec()
  }

  remove(id: string) {
    return this.expenseRepository.findByIdAndDelete(id).exec()
  }
}
