import { Injectable, Logger } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(private readonly mailerService: MailerService) {}

  getCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    return code
  }

  async sendCodeConfirmation(email: string) {
    try {
      this.logger.debug(`Enviando código de confirmación a ${email}`)
      await this.mailerService.sendMail({
        to: email,
        subject: 'Confirma tu correo en Nuestra App',
        template: './confirmation', // se añade automáticamente la extensión (.hbs)
        context: {
          logoUrl: 'https://eventuz.com/assets/images/logo1.svg',
          verificationCode: this.getCode(),
          year: new Date().getFullYear(),
        },
      })
      this.logger.debug(
        `Código de confirmación enviado exitosamente a ${email}`
      )
    } catch (error) {
      this.logger.error(
        `Error al enviar código de confirmación a ${email}:`,
        error
      )
      throw error
    }
  }

  async sendInvoiceNotification(
    email: string,
    data: {
      providerName: string
      invoiceNumber: string
      date: string
      type: string
    }
  ) {
    try {
      this.logger.debug(`Enviando notificación de factura a ${email}`, data)
      await this.mailerService.sendMail({
        to: email,
        subject: 'Nueva Factura Subida',
        template: './invoice-notification',
        context: {
          logoUrl: 'https://eventuz.com/assets/images/logo1.svg',
          providerName: data.providerName,
          invoiceNumber: data.invoiceNumber,
          date: data.date,
          type: data.type,
          year: new Date().getFullYear(),
        },
      })
      this.logger.debug(
        `Notificación de factura enviada exitosamente a ${email}`
      )
    } catch (error) {
      this.logger.error(
        `Error al enviar notificación de factura a ${email}:`,
        error
      )
      throw error
    }
  }

  async sendPaymentScheduledNotification(
    email: string,
    invoiceNumber: string,
    paymentDate: string
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Pago Programado',
      template: './payment-scheduled',
      context: {
        logoUrl: 'https://eventuz.com/assets/images/logo1.svg',
        invoiceNumber,
        paymentDate,
        year: new Date().getFullYear(),
      },
    })
  }

  async sendAccountingDecisionNotification(
    email: string,
    invoiceNumber: string,
    decision: 'approved' | 'rejected',
    reason?: string
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: `Factura ${decision === 'approved' ? 'Aprobada' : 'Rechazada'}`,
      template: './accounting-decision',
      context: {
        logoUrl: 'https://eventuz.com/assets/images/logo1.svg',
        invoiceNumber,
        decisionText: decision === 'approved' ? 'Aprobada' : 'Rechazada',
        reason,
        year: new Date().getFullYear(),
      },
    })
  }

  async sendActaNotification(
    email: string,
    data: {
      providerName: string
      invoiceNumber: string
      date: string
    }
  ) {
    try {
      this.logger.debug(`Enviando notificación de acta a ${email}`)
      await this.mailerService.sendMail({
        to: email,
        subject: 'Acta de Aceptación Subida',
        template: './acta-notification',
        context: {
          logoUrl: 'https://eventuz.com/assets/images/logo1.svg',
          providerName: data.providerName,
          invoiceNumber: data.invoiceNumber,
          date: data.date,
          year: new Date().getFullYear(),
        },
      })
      this.logger.debug(`Notificación de acta enviada exitosamente a ${email}`)
    } catch (error) {
      this.logger.error(
        `Error al enviar notificación de acta a ${email}:`,
        error
      )
      throw error
    }
  }

  async sendInvoiceUploadedNotification(data: {
    providerName: string
    invoiceNumber: string
    date: Date
    type: string
  }) {
    await this.mailerService.sendMail({
      to: 'contabilidad@empresa.com',
      subject: 'Nueva factura subida',
      template: 'invoice-uploaded',
      context: data,
    })
  }

  async sendActaUploadedNotification(data: {
    providerName: string
    invoiceNumber: string
    date: Date
    type: string
  }) {
    await this.mailerService.sendMail({
      to: 'contabilidad@empresa.com',
      subject: 'Acta de aprobación subida',
      template: 'acta-uploaded',
      context: data,
    })
  }

  async sendInvoiceApprovedNotification(
    email: string,
    data: {
      providerName: string
      invoiceNumber: string
      date: string
      type: string
    }
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Factura Aprobada',
        template: 'invoice-approved',
        context: {
          providerName: data.providerName,
          invoiceNumber: data.invoiceNumber,
          date: data.date,
          type: data.type,
        },
      })
    } catch (error) {
      this.logger.error(
        `Error al enviar notificación de factura aprobada: ${error.message}`
      )
      throw error
    }
  }

  async sendInvoiceRejectedNotification(
    email: string,
    data: {
      providerName: string
      invoiceNumber: string
      date: string
      type: string
      rejectionReason: string
    }
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Factura Rechazada',
        template: 'invoice-rejected',
        context: {
          providerName: data.providerName,
          invoiceNumber: data.invoiceNumber,
          date: data.date,
          type: data.type,
          rejectionReason: data.rejectionReason,
        },
      })
    } catch (error) {
      this.logger.error(
        `Error al enviar notificación de factura rechazada: ${error.message}`
      )
      throw error
    }
  }

  async sendInvoiceDecisionNotification(
    email: string,
    data: {
      providerName: string
      invoiceNumber: string
      date: string
      type: string
      status: 'APPROVED' | 'REJECTED'
      rejectionReason?: string
    }
  ) {
    try {
      this.logger.debug(
        `[DEBUG] Enviando notificación de decisión de factura a ${email}`,
        data
      )

      await this.mailerService.sendMail({
        to: email,
        subject: `Factura ${data.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}`,
        template: 'invoice-decision',
        context: {
          providerName: data.providerName,
          invoiceNumber: data.invoiceNumber,
          date: data.date,
          type: data.type,
          status: data.status,
          rejectionReason: data.rejectionReason,
          // Agregar helper para comparación de strings en el template
          eq: (a: string, b: string) => a === b,
        },
      })

      this.logger.debug(
        `[DEBUG] Notificación de decisión enviada exitosamente a ${email}`
      )
    } catch (error) {
      this.logger.error(
        `[DEBUG] Error al enviar notificación de decisión a ${email}: ${error.message}`,
        error.stack
      )
      throw error
    }
  }
}
