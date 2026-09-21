import emailjs from '@emailjs/browser';
import { ContactFormSubmission, EmailNotificationResult } from '../types';
import { apiService } from './apiService';

// Default EmailJS configuration from Vite Environment or fallback
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export class EmailNotificationService {
  private static instance: EmailNotificationService;
  private isEmailJsInitialized = false;

  private constructor() {
    if (EMAILJS_PUBLIC_KEY) {
      try {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        this.isEmailJsInitialized = true;
      } catch (err) {
        console.warn('[EmailNotificationService] Failed to initialize EmailJS SDK:', err);
      }
    }
  }

  public static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  /**
   * Submit contact form with automated email notification to engineering team
   */
  public async submitContactForm(data: ContactFormSubmission): Promise<EmailNotificationResult> {
    try {
      // 1. Primary path: Server-side mailer and CRM registration
      const serverResponse = await apiService.submitContactForm(data);

      // 2. Client-side EmailJS secondary dispatch if configured
      let emailJsSent = false;
      if (this.isEmailJsInitialized && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
        try {
          const templateParams = {
            to_name: 'Инженерная группа «ДС‑Инжиниринг»',
            from_name: data.name,
            from_phone: data.phone,
            from_email: data.email || 'Не указан',
            company: data.company || 'Частное лицо',
            department: data.department || 'Общие вопросы',
            message: data.message || 'Запрос консультации',
            request_id: serverResponse.id || `CNT-${Date.now()}`,
            timestamp: new Date().toLocaleString('ru-RU'),
            source_page: data.sourcePage || window.location.pathname
          };

          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
          );
          emailJsSent = true;
        } catch (emailJsErr) {
          console.warn('[EmailNotificationService] EmailJS direct dispatch skipped/failed:', emailJsErr);
        }
      }

      return {
        success: serverResponse.success,
        id: serverResponse.id,
        message: serverResponse.message || 'Сообщение успешно отправлено! Инженерная группа получила уведомление.',
        emailSent: true,
        emailSimulated: Boolean(serverResponse.emailSimulated),
        recipients: serverResponse.recipients || ['info@ds-enginering.ru', 'alekskobelev2025@gmail.com', 'a.skobelev@ds-enginering.ru']
      };
    } catch (error: any) {
      console.error('[EmailNotificationService] Submission error:', error);
      return {
        success: false,
        message: error?.message || 'Ошибка отправки формы. Пожалуйста, свяжитесь с нами по телефону +7 (846) 954-02-92.',
        error: error?.message
      };
    }
  }
}

export const emailNotificationService = EmailNotificationService.getInstance();
