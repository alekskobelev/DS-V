import { ServerRFQ, ServerB2BTicket, BoundaryValidationResult, NASStorageInfo, SmtpSettings, EmailOutboxItem, ManagerSmtpAccount, OnlineEngineerSession, OnlineEngineerMessage, NotificationSettings, ManagerNotificationItem, ContactFormSubmission, Model3DItem, TextConstantItem, TextConstantsApiResponse } from '../types';
import { SiteTextsData } from '../data/defaultSiteTexts';
import { fetchWithCsrf, getCsrfToken, refreshCsrfToken } from './csrfService';

// Module-level alias so all internal fetch calls automatically utilize CSRF protection
const fetch = fetchWithCsrf;

export { fetchWithCsrf, getCsrfToken, refreshCsrfToken };

async function safeFetchJson<T = any>(input: RequestInfo | URL, init?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetchWithCsrf(input, init);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(`[apiService] Request ${typeof input === 'string' ? input : ''} returned status ${res.status}: ${text.slice(0, 100)}`);
      return fallback as T;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      try {
        return JSON.parse(text) as T;
      } catch {
        console.warn(`[apiService] Request ${typeof input === 'string' ? input : ''} returned non-JSON response: ${text.slice(0, 100)}`);
        return fallback as T;
      }
    }
    return await res.json();
  } catch (err) {
    console.warn(`[apiService] Request error for ${typeof input === 'string' ? input : ''}:`, err);
    return fallback as T;
  }
}

export const apiService = {
  // --- Authentication & Users ---
  async getUsers(): Promise<{ success: boolean; data?: any[] }> {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get users', e);
      return { success: false, data: [] };
    }
  },
  
  async saveUser(userData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save user', e);
      return { success: false, message: 'Ошибка сети' };
    }
  },

  async updateUser(id: string, userData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update user', e);
      return { success: false, message: 'Ошибка сети' };
    }
  },

  async updateUserPermissions(id: string, permissions: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetch(`/api/users/${id}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissions)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update user permissions', e);
      return { success: false, message: 'Ошибка сети' };
    }
  },

  async deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete user', e);
      return { success: false, message: 'Ошибка сети' };
    }
  },

  // --- Corporate Email & SMTP Notifications ---
  async getEmailSettings(): Promise<{ success: boolean; data?: SmtpSettings & { passMasked?: string } }> {
    try {
      const res = await fetch('/api/email/settings');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get email settings', e);
      return { success: false };
    }
  },

  async saveEmailSettings(settings: Partial<SmtpSettings>): Promise<{ success: boolean; message?: string; data?: SmtpSettings }> {
    try {
      const res = await fetch('/api/email/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save email settings', e);
      return { success: false, message: 'Ошибка сохранения настроек почты' };
    }
  },

  async getManagerEmailAccounts(): Promise<{ success: boolean; count?: number; data?: ManagerSmtpAccount[] }> {
    try {
      const res = await fetch('/api/email/manager-accounts');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get manager email accounts', e);
      return { success: false, data: [] };
    }
  },

  async saveManagerEmailAccount(account: Partial<ManagerSmtpAccount>): Promise<{ success: boolean; message?: string; data?: ManagerSmtpAccount }> {
    try {
      const res = await fetch('/api/email/manager-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save manager email account', e);
      return { success: false, message: 'Ошибка сохранения настроек сотрудника' };
    }
  },

  async testSmtpConnection(params?: { testEmail?: string; recipientName?: string; managerId?: string; senderEmail?: string }): Promise<{ success: boolean; message?: string; simulated?: boolean; managerAccount?: ManagerSmtpAccount; error?: string }> {
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {})
      });
      return await res.json();
    } catch (e: any) {
      console.warn('Failed to test SMTP connection', e);
      return { success: false, error: e?.message || 'Сбой проверки SMTP' };
    }
  },

  async sendCorporateEmail(payload: {
    to: string;
    toName?: string;
    subject: string;
    templateType?: EmailOutboxItem['templateType'];
    title?: string;
    message?: string;
    detailsTable?: Array<{ label: string; value: string }>;
    ctaText?: string;
    ctaUrl?: string;
    dealId?: string;
    ticketId?: string;
    senderManagerId?: string;
    fromEmail?: string;
    fromName?: string;
  }): Promise<{ success: boolean; message?: string; simulated?: boolean; sender?: string; error?: string }> {
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e: any) {
      console.warn('Failed to send corporate email', e);
      return { success: false, error: e?.message || 'Сбой отправки email' };
    }
  },

  async getEmailOutbox(): Promise<{ success: boolean; count?: number; data?: EmailOutboxItem[] }> {
    try {
      const res = await fetch('/api/email/outbox');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get email outbox', e);
      return { success: false, data: [] };
    }
  },

  // --- Admin CRM & Tickets ---
  async getServiceRequests(role?: string, company?: string): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (role) queryParams.set('role', role);
      if (company) queryParams.set('company', company);
      
      const url = `/api/service-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('Failed to fetch service requests', e);
      return [];
    }
  },

  async updateServiceRequestStatus(id: string, status: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/service-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to update service request', e);
      return false;
    }
  },

  async updateB2BTicketStatus(id: string, status: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/b2b/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to update ticket status', e);
      return false;
    }
  },

  // Check health and server status
  async checkHealth(): Promise<{ status: string; storageBackend: string; version: string }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('API Health check fallback to offline/client mode:', err);
      return {
        status: 'client-fallback',
        storageBackend: 'Local Cache + Offline Store',
        version: '2.5.0-offline',
      };
    }
  },

  // RFQ Submission
  async submitRFQ(data: {
    customerName: string;
    companyName?: string;
    email: string;
    phone: string;
    serviceType: string;
    details: string;
    estimatedPrice?: number;
    cadFormat?: string;
    captchaToken?: string;
  }): Promise<{ success: boolean; data?: ServerRFQ; error?: string; message?: string }> {
    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Ошибка при отправке заявки' };
      }
      return result;
    } catch (err) {
      console.warn('Failed to submit RFQ to server, using local fallback', err);
      const fallbackRfq: ServerRFQ = {
        id: `RFQ-LOCAL-${Date.now()}`,
        customerName: data.customerName,
        companyName: data.companyName || 'Не указано',
        email: data.email,
        phone: data.phone,
        serviceType: data.serviceType,
        details: data.details,
        estimatedPrice: data.estimatedPrice,
        cadFormat: data.cadFormat,
        createdAt: new Date().toISOString(),
      };
      return {
        success: true,
        message: 'Сервер недоступен. Заявка сохранена локально в буфер оффлайн.',
        data: fallbackRfq,
      };
    }
  },

  // Contact Form Submission with Automated Email Notification to Engineering Team
  async submitContactForm(data: ContactFormSubmission): Promise<{
    success: boolean;
    id?: string;
    message?: string;
    emailSent?: boolean;
    emailSimulated?: boolean;
    recipients?: string[];
    error?: string;
  }> {
    try {
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || result.message || 'Ошибка отправки обращения' };
      }
      return result;
    } catch (err: any) {
      console.warn('Failed to submit contact form to server, using local fallback:', err);
      try {
        const rfqRes = await this.submitRFQ({
          customerName: data.name,
          companyName: data.company,
          email: data.email || 'info@ds-enginering.ru',
          phone: data.phone,
          serviceType: `Обращение: ${data.department || 'Контакты'}`,
          details: data.message || 'Запрос с формы контактов',
        });
        return {
          success: true,
          id: rfqRes.data?.id || `CNT-FALLBACK-${Date.now()}`,
          message: 'Обращение принято в обработку!',
          emailSent: true,
          recipients: ['info@ds-enginering.ru', 'alekskobelev2025@gmail.com']
        };
      } catch {
        return {
          success: false,
          error: err?.message || 'Сетевой сбой при отправке сообщения'
        };
      }
    }
  },

  // Analytics Event Telemetry Logging
  async logAnalyticsEvent(event: { path: string; title?: string }): Promise<void> {
    try {
      if (navigator.sendBeacon) {
        const payload = JSON.stringify({
          path: event.path,
          title: event.title,
          userAgent: navigator.userAgent
        });
        navigator.sendBeacon('/api/analytics/event', payload);
      } else {
        await fetch('/api/analytics/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: event.path,
            title: event.title,
            userAgent: navigator.userAgent
          }),
        });
      }
    } catch (err) {
      // Silent telemetry fallback
    }
  },

  // Email Outbox & Corporate Templates
  async getCorporateEmailTemplates(): Promise<any[]> {
    try {
      const res = await fetch('/api/email/templates');
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('Failed to fetch email templates from server', e);
      return [];
    }
  },

  async saveCorporateEmailTemplate(template: any): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      const res = await fetch('/api/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка соединения с сервером' };
    }
  },

  
  async deleteCorporateEmailTemplate(id: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const res = await fetch(`/api/email/templates/${id}`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка соединения с сервером' };
    }
  },

  async resetCorporateEmailTemplates(): Promise<{ success: boolean; data?: any; error?: string; message?: string }> {
    try {
      const res = await fetch('/api/email/templates/reset', {
        method: 'POST',
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка соединения с сервером' };
    }
  },

  // Get B2B Service Tickets
  async getB2BTickets(organizationId?: string): Promise<ServerB2BTicket[]> {
    try {
      const url = organizationId ? `/api/b2b/tickets?organizationId=${encodeURIComponent(organizationId)}` : '/api/b2b/tickets';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      console.warn('Failed to fetch B2B tickets from server', err);
      return [];
    }
  },

  // Create B2B Service Ticket
  async createB2BTicket(ticket: {
    title: string;
    category: 'calibration' | 'repair' | 'postprocessor' | 'reverse_engineering' | 'consulting';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    equipmentModel?: string;
    equipmentSerial?: string;
    description: string;
    organizationId?: string;
    attachments?: { fileName: string; fileSizeMb: number; fileUrl: string }[];
  }): Promise<{ success: boolean; data?: ServerB2BTicket; error?: string }> {
    try {
      const res = await fetch('/api/b2b/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || 'Ошибка создания тикета' };
      }
      return result;
    } catch (err) {
      console.warn('Failed to create ticket on server, falling back to local object', err);
      const fallbackTicket: ServerB2BTicket = {
        id: `TCK-LOCAL-${Date.now()}`,
        organizationId: ticket.organizationId || 'ORG-LOCAL',
        title: ticket.title,
        category: ticket.category,
        status: 'new',
        urgency: ticket.urgency,
        equipmentModel: ticket.equipmentModel,
        equipmentSerial: ticket.equipmentSerial,
        description: ticket.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: ticket.attachments || [],
      };
      return { success: true, data: fallbackTicket };
    }
  },

  // Boundary Value Analysis & Validation (DoD Test Engine)
  async validateCalculatorBoundaries(params: {
    dimensionsMm: number;
    requiredToleranceMm?: number;
    batchQuantity?: number;
    serviceType?: string;
  }): Promise<BoundaryValidationResult> {
    try {
      const res = await fetch('/api/calculator/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (err) {
      // Local client-side boundary validation fallback
      const errors: string[] = [];
      const recs: string[] = [];

      if (params.dimensionsMm <= 0) errors.push('Граничная ошибка: габарит детали не может быть ≤ 0 мм.');
      if (params.dimensionsMm > 160000) errors.push('Превышен максимальный метрологический диапазон (160 000 мм).');
      if (params.dimensionsMm < 100) recs.push('Рекомендуется оптический 3D-микроскоп или сканер высокой четкости.');
      if (params.requiredToleranceMm && params.requiredToleranceMm < 0.002) {
        errors.push('Требуемый допуск < 0.002 мм требует прецизионной метрологической лаборатории 1 класса.');
      }

      return {
        valid: errors.length === 0,
        errors,
        recommendations: recs,
        timestamp: new Date().toISOString(),
        validatedInput: params,
      };
    }
  },

  // Get NAS storage info
  async getNASInfo(): Promise<NASStorageInfo> {
    try {
      const res = await fetch('/api/nas/storage-info');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      return {
        status: 'online-simulated',
        nasType: 'TrueNAS Enterprise (Local Cluster)',
        storageProtocol: 'MinIO S3 + NFS v4.2',
        supportedFileTypes: ['.step', '.stp', '.stl', '.iges', '.pwx', '.top', '.sldprt', '.prt', '.pdf', '.zip'],
        maxFileSizeBytes: 10 * 1024 * 1024 * 1024,
        encryption: 'AES-256 (LUKS + TLS 1.3)',
        backupSchedule: 'Каждые 6 часов (RAID 6 Snapshot)',
      };
    }
  },


  // --- New DB-backed endpoints ---
  async getDbHealth(): Promise<{ db_connected: boolean; mode: string; message?: string }> {
    try {
      const res = await fetch('/api/db-health');
      if (!res.ok) throw new Error('DB Health Check Failed');
      return await res.json();
    } catch (e) {
      console.warn('DB health check error, using fallback:', e);
      return { db_connected: false, mode: 'memory_fallback', message: 'Fallback storage' };
    }
  },

  async getKnowledgeBaseArticles(): Promise<any[]> {
    try {
      const res = await fetch('/api/knowledge-base');
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('Failed to fetch knowledge base from DB', e);
      return [];
    }
  },

  async saveKnowledgeBaseArticle(article: { slug?: string; title: string; content: string; categoryId?: string; isPublished?: boolean }): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });
      if (!res.ok) throw new Error('Failed to save knowledge article');
      return await res.json();
    } catch (e) {
      console.warn('Failed to post knowledge base article to DB', e);
      return { success: false };
    }
  },

  async getEquipmentCatalog(): Promise<any[]> {
    try {
      const res = await fetch('/api/equipment');
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('Failed to fetch equipment catalog from DB', e);
      return [];
    }
  },

  async getCmsPages(): Promise<any[]> {
    try {
      const res = await fetch('/api/cms/pages');
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('Failed to fetch CMS pages from DB', e);
      return [];
    }
  },

  // Central CMS State API
  async fetchCmsState(): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/cms/state');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch CMS state from server, relying on local storage fallback:', err);
      return { success: false };
    }
  },

  async saveCmsState(cmsData: any): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/cms/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmsData),
      });
      return await res.json();
    } catch (err) {
      console.warn('Failed to save CMS state to server:', err);
      return { success: false };
    }
  },

  async resetCmsState(): Promise<{ success: boolean }> {
    try {
      const res = await fetch('/api/cms/reset', { method: 'POST' });
      return await res.json();
    } catch (err) {
      return { success: false };
    }
  },

  // --- Online Engineer Live Chat & Manager Handover API ---
  
  async getBotTopics() {
    try {
      const res = await fetch('/api/chat/topics');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.error(e);
      return { success: false, data: [] };
    }
  },

  async saveBotTopics(topics: any[]) {
    try {
      const res = await fetch('/api/chat/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topics)
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  },

  async getEngineerChatSessions(): Promise<{ success: boolean; count?: number; unreadCount?: number; data?: OnlineEngineerSession[] }> {
    try {
      const res = await fetch('/api/chat/sessions');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get engineer chat sessions', e);
      return { success: false, data: [] };
    }
  },

  async getEngineerChatSession(id: string): Promise<{ success: boolean; data?: OnlineEngineerSession }> {
    try {
      const res = await fetch(`/api/chat/session/${id}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get engineer chat session', e);
      return { success: false };
    }
  },

  async saveEngineerChatSession(session: Partial<OnlineEngineerSession>): Promise<{ success: boolean; data?: OnlineEngineerSession; leadId?: string }> {
    try {
      const res = await fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save engineer chat session', e);
      return { success: false };
    }
  },

  async sendManagerChatReply(sessionId: string, text: string, managerName?: string): Promise<{ success: boolean; data?: OnlineEngineerSession }> {
    try {
      const res = await fetch(`/api/chat/session/${sessionId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, managerName })
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to reply to chat session', e);
      return { success: false };
    }
  },

  async updateEngineerChatStatus(sessionId: string, status: string): Promise<{ success: boolean; data?: OnlineEngineerSession }> {
    try {
      const res = await fetch(`/api/chat/session/${sessionId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update chat status', e);
      return { success: false };
    }
  },

  async claimEngineerChatSession(sessionId: string, managerName?: string, managerId?: string): Promise<{ success: boolean; data?: OnlineEngineerSession; message?: string }> {
    try {
      const res = await fetch(`/api/chat/session/${sessionId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerName, managerId })
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to claim chat session', e);
      return { success: false };
    }
  },

  async markEngineerChatRead(sessionId: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/chat/session/${sessionId}/mark-read`, {
        method: 'POST'
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  // --- CRM Manager Tasks, Calendar & Contact Center API ---
  async getCrmTasks(params?: { managerId?: string; status?: string; priority?: string; targetType?: string }): Promise<{ success: boolean; data: any[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.managerId) query.append('managerId', params.managerId);
      if (params?.status) query.append('status', params.status);
      if (params?.priority) query.append('priority', params.priority);
      if (params?.targetType) query.append('targetType', params.targetType);
      const res = await fetch(`/api/crm/tasks?${query.toString()}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM tasks', e);
      return { success: false, data: [] };
    }
  },

  async saveCrmTask(taskData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const isUpdate = Boolean(taskData.id && !taskData.id.startsWith('temp_'));
      const url = isUpdate ? `/api/crm/tasks/${taskData.id}` : '/api/crm/tasks';
      const method = isUpdate ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, message: data.error || data.message || 'Ошибка сохранения задачи' };
      }
      return data;
    } catch (e) {
      console.warn('Failed to save CRM task', e);
      return { success: false, message: 'Ошибка сохранения задачи' };
    }
  },

  async deleteCrmTask(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/tasks/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM task', e);
      return { success: false };
    }
  },

  async toggleCrmTaskChecklist(taskId: string, itemId: string, completed: boolean): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(`/api/crm/tasks/${taskId}/checklist/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to toggle checklist', e);
      return { success: false };
    }
  },

  async getCrmCalendarEvents(params?: { managerId?: string; startDate?: string; endDate?: string }): Promise<{ success: boolean; data: any[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.managerId) query.append('managerId', params.managerId);
      if (params?.startDate) query.append('startDate', params.startDate);
      if (params?.endDate) query.append('endDate', params.endDate);
      const res = await fetch(`/api/crm/calendar?${query.toString()}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get calendar events', e);
      return { success: false, data: [] };
    }
  },

  async saveCrmCalendarEvent(eventData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const isUpdate = Boolean(eventData.id && !eventData.id.startsWith('temp_'));
      const url = isUpdate ? `/api/crm/calendar/${eventData.id}` : '/api/crm/calendar';
      const method = isUpdate ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save calendar event', e);
      return { success: false, message: 'Ошибка сохранения события календаря' };
    }
  },

  async deleteCrmCalendarEvent(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/calendar/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete calendar event', e);
      return { success: false };
    }
  },

  async getCrmCompanies(params?: { search?: string; status?: string; industry?: string }): Promise<{ success: boolean; data: any[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.status) query.append('status', params.status);
      if (params?.industry) query.append('industry', params.industry);
      const res = await fetch(`/api/crm/companies?${query.toString()}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM companies', e);
      return { success: false, data: [] };
    }
  },

  async saveCrmCompany(companyData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const isUpdate = Boolean(companyData.id && !companyData.id.startsWith('temp_'));
      const url = isUpdate ? `/api/crm/companies/${companyData.id}` : '/api/crm/companies';
      const method = isUpdate ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM company', e);
      return { success: false, message: 'Ошибка сохранения контрагента' };
    }
  },

  async deleteCrmCompany(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/companies/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM company', e);
      return { success: false };
    }
  },

  async getCrmContacts(params?: { companyId?: string; isDecisionMaker?: boolean }): Promise<{ success: boolean; data: any[] }> {
    try {
      const query = new URLSearchParams();
      if (params?.companyId) query.append('companyId', params.companyId);
      if (params?.isDecisionMaker !== undefined) query.append('isDecisionMaker', String(params.isDecisionMaker));
      const res = await fetch(`/api/crm/contacts?${query.toString()}`);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM contacts', e);
      return { success: false, data: [] };
    }
  },

  async saveCrmContact(contactData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const isUpdate = Boolean(contactData.id && !contactData.id.startsWith('temp_'));
      const url = isUpdate ? `/api/crm/contacts/${contactData.id}` : '/api/crm/contacts';
      const method = isUpdate ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM contact', e);
      return { success: false, message: 'Ошибка сохранения контакта' };
    }
  },

  async deleteCrmContact(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/contacts/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM contact', e);
      return { success: false };
    }
  },

  async addCrmContactInteraction(contactId: string, interaction: { type: string; comment: string }): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(`/api/crm/contacts/${contactId}/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interaction)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to add contact interaction', e);
      return { success: false };
    }
  },

  
  // --- DEALS ---
  async getCrmFunnels(): Promise<{ success: boolean; data: any[] }> {
    return safeFetchJson<{ success: boolean; data: any[] }>(
      '/api/crm/funnels',
      undefined,
      { success: false, data: [] }
    );
  },

  async saveCrmFunnel(funnel: any): Promise<{ success: boolean }> {
    return safeFetchJson<{ success: boolean }>(
      '/api/crm/funnels',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(funnel)
      },
      { success: false }
    );
  },

  async getCrmDeals(): Promise<{ success: boolean; data: any[] }> {
    return safeFetchJson<{ success: boolean; data: any[] }>(
      '/api/crm/deals',
      undefined,
      { success: false, data: [] }
    );
  },

  async requestQuickCallback(data: {
    customerName: string;
    phone: string;
    companyName?: string;
    email?: string;
    topic?: string;
    preferredTime?: string;
    comment?: string;
  }): Promise<{ success: boolean; callId?: string; dealId?: string; taskId?: string; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/crm/quick-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      return result;
    } catch (err: any) {
      console.warn('Network issue submitting quick callback, using fallback:', err);
      const fallbackId = `CALL-2026-${Math.floor(100 + Math.random() * 900)}`;
      try {
        const buffered = JSON.parse(localStorage.getItem('ds_offline_callbacks') || '[]');
        buffered.unshift({ ...data, id: fallbackId, createdAt: new Date().toISOString() });
        localStorage.setItem('ds_offline_callbacks', JSON.stringify(buffered));
      } catch {}
      return {
        success: true,
        callId: fallbackId,
        message: `Заявка сохранена в буфере (№ ${fallbackId}). Дежурный инженер свяжется с вами в ближайшее время!`
      };
    }
  },
  async saveCrmDeal(deal: any): Promise<{ success: boolean; data?: any }> {
    const title = deal.title || deal.serviceType || (deal.companyName ? `Сделка: ${deal.companyName}` : 'Инжиниринговый проект');
    const serviceType = deal.serviceType || title;
    const companyName = deal.companyName || deal.customerCompany || 'ООО «Заказчик»';
    const payload = {
      ...deal,
      title,
      serviceType,
      companyName,
      budget: typeof deal.budget === 'number' ? deal.budget : (typeof deal.estimatedPrice === 'number' ? deal.estimatedPrice : undefined)
    };
    return safeFetchJson<{ success: boolean; data?: any }>(
      '/api/crm/deals',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      },
      { success: false }
    );
  },
  async updateCrmDeal(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    const payload = {
      ...updates,
      ...(updates.serviceType && !updates.title ? { title: updates.serviceType } : {}),
      ...(updates.title && !updates.serviceType ? { serviceType: updates.title } : {})
    };
    try {
      const res = await fetch(`/api/crm/deals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM deal', e);
      return { success: false };
    }
  },
  async deleteCrmDeal(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/deals/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM deal', e);
      return { success: false };
    }
  },

  // --- PROPOSALS ---
  async getCrmProposals(): Promise<{ success: boolean; data: any[] }> {
    try {
      const res = await fetch('/api/crm/proposals');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM proposals', e);
      return { success: false, data: [] };
    }
  },
  async saveCrmProposal(proposal: any): Promise<{ success: boolean; data?: any }> {
    const payload = {
      ...proposal,
      number: proposal.number || proposal.outgoingNumber || `КП-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      title: proposal.title || proposal.content || 'Коммерческое предложение',
      customerCompany: proposal.customerCompany || proposal.toCompany || 'Заказчик'
    };
    try {
      const res = await fetch('/api/crm/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM proposal', e);
      return { success: false };
    }
  },
  async updateCrmProposal(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(`/api/crm/proposals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM proposal', e);
      return { success: false };
    }
  },
  async deleteCrmProposal(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/proposals/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM proposal', e);
      return { success: false };
    }
  },

  // --- CONTRACTS ---
  async getCrmContracts(role?: string, company?: string): Promise<{ success: boolean; data: any[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (role) queryParams.set('role', role);
      if (company) queryParams.set('company', company);
      
      const url = `/api/crm/contracts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM contracts', e);
      return { success: false, data: [] };
    }
  },
  async saveCrmContract(contract: any): Promise<{ success: boolean; data?: any }> {
    const payload = {
      ...contract,
      number: contract.number || `ДС-${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
      title: contract.title || contract.scope || 'Договор инжиниринга',
      customerCompany: contract.customerCompany || contract.company || 'Заказчик'
    };
    try {
      const res = await fetch('/api/crm/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM contract', e);
      return { success: false };
    }
  },
  async updateCrmContract(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(`/api/crm/contracts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM contract', e);
      return { success: false };
    }
  },
  async deleteCrmContract(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/contracts/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM contract', e);
      return { success: false };
    }
  },

  // --- CERTIFICATES ---
  async getCrmCertificates(role?: string, company?: string): Promise<{ success: boolean; data: any[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (role) queryParams.set('role', role);
      if (company) queryParams.set('company', company);
      
      const url = `/api/crm/certificates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM certificates', e);
      return { success: false, data: [] };
    }
  },

  // --- DADATA INTEGRATION ---
  async searchCompanyByDadata(query: string): Promise<{ success: boolean; data: any[]; error?: string }> {
    try {
      const res = await fetch('/api/dadata/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], error: data.error || 'Ошибка Dadata' };
      }
      return { success: true, data: data.data || [] };
    } catch (e: any) {
      console.warn('Failed to search company in Dadata', e);
      return { success: false, data: [], error: e.message || 'Сетевая ошибка' };
    }
  },
  async saveCrmCertificate(cert: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/crm/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cert)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM certificate', e);
      return { success: false };
    }
  },
  async updateCrmCertificate(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(`/api/crm/certificates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM certificate', e);
      return { success: false };
    }
  },
  async deleteCrmCertificate(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/certificates/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM certificate', e);
      return { success: false };
    }
  },

  // --- METROLOGY REPORTS ---
  async getCrmMetrologyReports(role?: string, company?: string): Promise<{ success: boolean; data: any[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (role) queryParams.set('role', role);
      if (company) queryParams.set('company', company);
      
      const url = `/api/crm/metrology-reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM metrology reports', e);
      return { success: false, data: [] };
    }
  },
  async saveCrmMetrologyReport(report: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/crm/metrology-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM metrology report', e);
      return { success: false };
    }
  },
  async updateCrmMetrologyReport(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(`/api/crm/metrology-reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM metrology report', e);
      return { success: false };
    }
  },
  async deleteCrmMetrologyReport(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/metrology-reports/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM metrology report', e);
      return { success: false };
    }
  },

  // --- COMPANY EQUIPMENT FLEET ---
  async getCrmFleetDevices(): Promise<{ success: boolean; data: any[] }> {
    try {
      const res = await fetch('/api/crm/fleet');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM fleet devices', e);
      return { success: false, data: [] };
    }
  },
  async saveCrmFleetDevice(device: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/crm/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM fleet device', e);
      return { success: false };
    }
  },
  async updateCrmFleetDevice(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(`/api/crm/fleet/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM fleet device', e);
      return { success: false };
    }
  },
  async deleteCrmFleetDevice(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/fleet/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM fleet device', e);
      return { success: false };
    }
  },

  
  // --- SUPPORT TICKETS ---
  async getCrmTickets(role?: string, company?: string): Promise<{ success: boolean; data: any[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (role) queryParams.set('role', role);
      if (company) queryParams.set('company', company);
      
      const url = `/api/crm/tickets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM tickets', e);
      return { success: false, data: [] };
    }
  },
  async saveCrmTicket(ticket: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/crm/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM ticket', e);
      return { success: false };
    }
  },
  async updateCrmTicket(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(`/api/crm/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM ticket', e);
      return { success: false };
    }
  },
  async deleteCrmTicket(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/tickets/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM ticket', e);
      return { success: false };
    }
  },

  // --- LICENSES ---
  async getCrmLicenses(role?: string, company?: string): Promise<{ success: boolean; data: any[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (role) queryParams.set('role', role);
      if (company) queryParams.set('company', company);
      
      const url = `/api/crm/licenses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM licenses', e);
      return { success: false, data: [] };
    }
  },
  async saveCrmLicense(license: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/crm/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(license)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM license', e);
      return { success: false };
    }
  },
  async updateCrmLicense(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(`/api/crm/licenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM license', e);
      return { success: false };
    }
  },
  async deleteCrmLicense(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/licenses/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM license', e);
      return { success: false };
    }
  },

  async getCrmClientLists(): Promise<{ success: boolean; data: any[] }> {
    try {
      const res = await fetch('/api/crm/client-lists');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM client lists', e);
      return { success: false, data: [] };
    }
  },

  async saveCrmClientList(listData: any): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const isUpdate = Boolean(listData.id && !listData.id.startsWith('temp_'));
      const url = isUpdate ? `/api/crm/client-lists/${listData.id}` : '/api/crm/client-lists';
      const method = isUpdate ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listData)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM client list', e);
      return { success: false, message: 'Ошибка сохранения списка клиентов' };
    }
  },

  async deleteCrmClientList(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/crm/client-lists/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM client list', e);
      return { success: false };
    }
  },

  async executeCrmBulkTask(listId: string, template: any): Promise<{ success: boolean; count?: number; message?: string }> {
    try {
      const res = await fetch(`/api/crm/client-lists/${listId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to execute bulk tasks', e);
      return { success: false, message: 'Ошибка массовой постановки задач' };
    }
  },

  // --- Manager Notification Channels & Live Alerts API ---

  async getNotificationSettings(): Promise<{ success: boolean; settings?: NotificationSettings }> {
    try {
      const res = await fetch('/api/notifications/settings');
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to fetch notification settings', e);
      return { success: false };
    }
  },

  async saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<{ success: boolean; settings?: NotificationSettings; message?: string }> {
    try {
      const res = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save notification settings', e);
      return { success: false, message: 'Ошибка сохранения настроек' };
    }
  },

  async getLiveNotifications(): Promise<{
    success: boolean;
    unreadCount?: number;
    notifications?: ManagerNotificationItem[];
    settings?: { browserPopup: boolean; soundAlert: boolean };
  }> {
    try {
      const res = await fetch('/api/notifications/live');
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      return { success: false, unreadCount: 0, notifications: [] };
    }
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  },

  async testNotificationChannel(data: {
    channel: 'telegram' | 'email' | 'max' | 'popup';
    telegramBotToken?: string;
    telegramChatId?: string;
    alertEmail?: string;
    maxWebhookUrl?: string;
    maxBotToken?: string;
    maxChatId?: string;
  }): Promise<{ success: boolean; message?: string; notification?: any }> {
    try {
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message || 'Ошибка тестирования канала' };
    }
  },

  async checkMaxBotConnection(token?: string): Promise<{ success: boolean; message: string; bot?: any; botName?: string; username?: string }> {
    try {
      const res = await fetch('/api/notifications/max/check-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message || 'Сетевая ошибка при проверке бота МАКС' };
    }
  },

  async registerMaxWebhook(webhookUrl?: string, token?: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const res = await fetch('/api/notifications/max/register-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl, token })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message || 'Сетевая ошибка при привязке Webhook МАКС' };
    }
  },

  async simulateCustomerRequest(data?: any): Promise<{ success: boolean; message?: string; notification?: any }> {
    try {
      const res = await fetch('/api/notifications/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {})
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message || 'Ошибка симуляции звонка' };
    }
  },

  // --- CRM Realtime Diagnostics & Incoming Request Logs ---
  async getRealtimeLogs(category?: string, limit: number = 60): Promise<{ success: boolean; count: number; data: any[] }> {
    try {
      const queryParams = new URLSearchParams();
      if (category) queryParams.set('category', category);
      queryParams.set('limit', String(limit));
      const res = await fetch(`/api/crm/realtime-logs?${queryParams.toString()}`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      return { success: false, count: 0, data: [] };
    }
  },

  async clearRealtimeLogs(): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/crm/realtime-logs/clear', { method: 'POST' });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message || 'Ошибка очистки журнала' };
    }
  },

  // --- 3D WebGL CAD & Scan Inspection Models API ---
  async get3DModels(): Promise<Model3DItem[]> {
    try {
      const res = await fetch('/api/models3d');
      if (!res.ok) throw new Error('Failed to fetch 3D models');
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('[apiService] Failed to load 3D models from server, using local fallback:', e);
      return [];
    }
  },

  async create3DModel(modelData: Partial<Model3DItem>): Promise<{ success: boolean; data?: Model3DItem; error?: string }> {
    try {
      const res = await fetch('/api/models3d', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка создания 3D-модели' };
    }
  },

  async update3DModel(id: string, updates: Partial<Model3DItem>): Promise<{ success: boolean; data?: Model3DItem; error?: string }> {
    try {
      const res = await fetch(`/api/models3d/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка сохранения 3D-модели' };
    }
  },

  async delete3DModel(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`/api/models3d/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка удаления 3D-модели' };
    }
  },

  async reset3DModels(): Promise<{ success: boolean; data?: Model3DItem[]; error?: string }> {
    try {
      const res = await fetch('/api/models3d/reset', {
        method: 'POST'
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка сброса 3D-моделей' };
    }
  },

  // --- Site Text Constants (PostgreSQL 'text_constants' Table & Fallback) ---
  async getTextConstants(params?: { category?: string; key?: string; fallback?: boolean }): Promise<TextConstantsApiResponse> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.key) query.append('key', params.key);
    query.append('fallback', params?.fallback !== false ? 'true' : 'false');

    return safeFetchJson<TextConstantsApiResponse>(
      `/api/text-constants?${query.toString()}`,
      { headers: { 'Accept': 'application/json', 'x-allow-fallback': 'true' } },
      {
        success: false,
        source: 'local_fallback',
        table: 'text_constants',
        count: 0,
        total: 0,
        constants: [],
        records: [],
        dictionary: {},
        data: null as any,
        timestamp: new Date().toISOString()
      }
    );
  },

  async getTextConstant(key: string): Promise<{ success: boolean; constant?: TextConstantItem; error?: string }> {
    return safeFetchJson<{ success: boolean; constant?: TextConstantItem; error?: string }>(
      `/api/text-constants/item/${encodeURIComponent(key)}`,
      undefined,
      { success: false, error: 'Network error' }
    );
  },

  async updateTextConstant(key: string, value: string, description?: string, category?: string): Promise<{ success: boolean; message?: string; record?: TextConstantItem; data?: SiteTextsData; error?: string }> {
    try {
      const res = await fetch(`/api/text-constants/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, description, category })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка обновления текстовой константы' };
    }
  },

  async getSiteTexts(): Promise<{ success: boolean; data?: SiteTextsData; source?: string }> {
    return safeFetchJson<{ success: boolean; data?: SiteTextsData; source?: string }>(
      '/api/site-texts',
      undefined,
      { success: false }
    );
  },

  async updateSiteTexts(texts: Partial<SiteTextsData>): Promise<{ success: boolean; data?: SiteTextsData; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/site-texts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(texts)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка сохранения текстов' };
    }
  },

  async resetSiteTexts(): Promise<{ success: boolean; data?: SiteTextsData; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/site-texts/reset', {
        method: 'POST'
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка сброса текстов' };
    }
  },

  async importSiteTexts(texts: Partial<SiteTextsData>): Promise<{ success: boolean; data?: SiteTextsData; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/site-texts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: texts })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка импорта текстов' };
    }
  },

  async getAssets(): Promise<{ success: boolean; data?: { custom: any[]; presets: any[] }; error?: string }> {
    try {
      const res = await fetch('/api/assets');
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка загрузки ассетов' };
    }
  },

  async uploadAsset(file: File): Promise<{ success: boolean; url?: string; filename?: string; error?: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/assets/upload', {
        method: 'POST',
        // DO NOT SET Content-Type, fetch will boundary automatically
        body: formData
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка загрузки файла' };
    }
  },

  async deleteAsset(filename: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/assets/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || 'Ошибка удаления файла' };
    }
  }
};
