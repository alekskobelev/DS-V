import { relations } from 'drizzle-orm';
import { 
  integer, 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  real, 
  jsonb, 
  boolean,
  pgEnum,
  index,
  varchar
} from 'drizzle-orm/pg-core';

// === ЭНУМЕРАТОРЫ (ENUMS) ===
// Роли пользователей
export const userRoleEnum = pgEnum('user_role', ['superadmin', 'admin', 'moderator', 'manager', 'engineer', 'client']);
// Статусы тикетов
export const ticketStatusEnum = pgEnum('ticket_status', ['new', 'in_progress', 'resolved', 'closed']);
// Статусы заявок
export const requestStatusEnum = pgEnum('request_status', ['pending', 'reviewed', 'quoted', 'rejected', 'completed']);

// === 1. ПОЛЬЗОВАТЕЛИ (Users & Roles) ===
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or internal ID (e.g. adm-01, cli-01)
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  organization: text('organization'),
  position: text('position'),
  phone: text('phone'),
  role: userRoleEnum('role').default('client').notNull(),
  permissions: jsonb('permissions').default('{}'), // Granular RBAC permissions
  password: text('password'),
  contractNumber: text('contract_number'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 2. КАТАЛОГ ОБОРУДОВАНИЯ (Equipment Catalog) ===
export const equipmentCatalog = pgTable('equipment_catalog', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  manufacturer: text('manufacturer').notNull(),
  category: text('category').notNull(),
  specifications: jsonb('specifications').default('{}'), // { accuracy: "0.02mm", range: "150m" }
  description: text('description'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 3. ЗАЯВКИ С КАЛЬКУЛЯТОРА (Service Requests / RFQ) ===
export const serviceRequests = pgTable('service_requests', {
  id: text('id').primaryKey(), // Формат: RFQ-2026-001
  userId: integer('user_id').references(() => users.id), // Null, если отправил гость
  customerName: text('customer_name').notNull(),
  companyName: text('company_name'),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  serviceType: text('service_type').notNull(),
  details: text('details'),
  estimatedPrice: real('estimated_price'),
  cadFormat: text('cad_format'),
  metadata: jsonb('metadata').default('{}'), // Доп. параметры калькулятора (допуски, габариты)
  status: text('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 4. B2B СЕРВИСНЫЕ ТИКЕТЫ (Tickets) ===
export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(), // Формат: TCK-2026-001
  userId: integer('user_id').references(() => users.id),
  organizationId: text('organization_id').notNull(), // Идентификатор компании
  title: text('title').notNull(),
  category: text('category').notNull(),
  status: text('status').default('new').notNull(),
  urgency: text('urgency').default('medium').notNull(),
  equipmentModel: text('equipment_model'),
  equipmentId: integer('equipment_id').references(() => equipmentCatalog.id),
  equipmentSerial: text('equipment_serial'),
  description: text('description').notNull(),
  attachments: jsonb('attachments').default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 5. ДИНАМИЧЕСКИЕ СТРАНИЦЫ CMS (CMS Dynamic Pages) ===
export const cmsPages = pgTable('cms_pages', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(), // Например: "/services/3d-scanning"
  title: text('title').notNull(),
  seoMetadata: jsonb('seo_metadata').default('{}'), // { title, description, keywords }
  layoutConfig: jsonb('layout_config').default('[]'), // Структура блоков страницы
  isPublished: boolean('is_published').default(false).notNull(),
  authorId: integer('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 6. БАЗА ЗНАНИЙ И СТАТЬИ (Knowledge Base) ===
export const knowledgeBase = pgTable('knowledge_base', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(), // Markdown или HTML
  categoryId: text('category_id').notNull(), // 'metrology', 'reverse-engineering' и т.д.
  tags: jsonb('tags').default('[]'), // Массив тегов
  isPublished: boolean('is_published').default(false).notNull(),
  authorId: integer('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 7. АУДИТ И ЛОГИРОВАНИЕ (Audit Logs) ===
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id), // Кто выполнил действие
  action: text('action').notNull(), // Например: 'CREATE_TICKET', 'UPDATE_CMS_PAGE'
  entityType: text('entity_type').notNull(), // 'ticket', 'cms_page', 'user'
  entityId: text('entity_id').notNull(), // ID затронутого объекта
  details: jsonb('details').default('{}'), // Детальное состояние (payload)
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// === 8. ДИАЛОГИ И ЛИДЫ «ОНЛАЙН-ИНЖЕНЕР» (Engineer Chat Sessions & Leads) ===
export const engineerChatSessions = pgTable('engineer_chat_sessions', {
  id: text('id').primaryKey(), // Формат: CHAT-2026-001
  visitorId: text('visitor_id').notNull(),
  visitorName: text('visitor_name'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  companyName: text('company_name'),
  currentPage: text('current_page'),
  currentPath: text('current_path'),
  status: text('status').default('active').notNull(), // 'active', 'handover_requested', 'manager_connected', 'resolved'
  messages: jsonb('messages').default('[]').notNull(),
  lastMessageText: text('last_message_text'),
  unreadByManager: boolean('unread_by_manager').default(true).notNull(),
  urgentAlert: boolean('urgent_alert').default(false).notNull(),
  leadId: text('lead_id'), // Привязка к созданной заявке в service_requests (RFQ)
  assignedManagerId: text('assigned_manager_id'),
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === СВЯЗИ ДЛЯ УДОБНЫХ ЗАПРОСОВ (Relations) ===
export const usersRelations = relations(users, ({ many }) => ({
  tickets: many(tickets),
  serviceRequests: many(serviceRequests),
  cmsPages: many(cmsPages),
  knowledgeBaseArticles: many(knowledgeBase),
  auditLogs: many(auditLogs),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  author: one(users, { fields: [tickets.userId], references: [users.id] }),
  equipment: one(equipmentCatalog, { fields: [tickets.equipmentId], references: [equipmentCatalog.id] }),
}));

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  author: one(users, { fields: [serviceRequests.userId], references: [users.id] }),
}));

export const cmsPagesRelations = relations(cmsPages, ({ one }) => ({
  author: one(users, { fields: [cmsPages.authorId], references: [users.id] }),
}));

export const knowledgeBaseRelations = relations(knowledgeBase, ({ one }) => ({
  author: one(users, { fields: [knowledgeBase.authorId], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const engineerChatSessionsRelations = relations(engineerChatSessions, ({ one }) => ({
  lead: one(serviceRequests, { fields: [engineerChatSessions.leadId], references: [serviceRequests.id] }),
}));

export const rfqSubmissions = serviceRequests;

// === 9. КОМПАНИИ КОНТРАГЕНТЫ (Companies) ===
export const companies = pgTable('companies', {
  id: text('id').primaryKey(), // e.g. 'comp-001' or UUID
  name: text('name').notNull(),
  inn: text('inn').notNull(),
  kpp: text('kpp'),
  industry: text('industry').notNull(), // 'Авиастроение', 'Двигателестроение', 'Тяжелое машиностроение', etc.
  city: text('city').notNull(),
  address: text('address'),
  status: text('status').default('active').notNull(), // 'active', 'potential', 'key_partner', 'in_progress', 'archive'
  assignedEquipment: jsonb('assigned_equipment').default('[]'), // [{ name: "Mitutoyo CRYSTA-Apex", serial: "...", type: "КИМ" }]
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  contactPerson: text('contact_person'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('companies_name_idx').on(table.name),
  index('companies_inn_idx').on(table.inn),
  index('companies_industry_idx').on(table.industry),
  index('companies_city_idx').on(table.city),
]);

// === 10. КОНТАКТНЫЕ ЛИЦА КЛИЕНТОВ (Customer Contacts) ===
export const contacts = pgTable('contacts', {
  id: text('id').primaryKey(), // e.g. 'cont-001'
  companyId: text('company_id').references(() => companies.id),
  companyName: text('company_name').notNull(),
  fullName: text('full_name').notNull(),
  position: text('position').notNull(), // 'Главный метролог', 'Главный технолог', 'Директор по качеству', etc.
  department: text('department'),
  workPhone: text('work_phone'),
  mobilePhone: text('mobile_phone'),
  email: text('email').notNull(),
  isDecisionMaker: boolean('is_decision_maker').default(false).notNull(), // Лицо, принимающее решения (ЛПР)
  notes: text('notes'),
  interactionHistory: jsonb('interaction_history').default('[]'), // [{ id, date, type, comment, author }]
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('contacts_company_idx').on(table.companyId),
  index('contacts_name_idx').on(table.fullName),
  index('contacts_lpr_idx').on(table.isDecisionMaker),
]);

// === 11. ЛИЧНЫЕ ЗАДАЧИ МЕНЕДЖЕРА (User / Manager Tasks) ===
export const userTasks = pgTable('user_tasks', {
  id: text('id').primaryKey(), // e.g. 'task-001'
  title: text('title').notNull(),
  description: text('description'),
  dueDate: text('due_date').notNull(), // 'YYYY-MM-DD'
  dueTime: text('due_time').notNull(), // 'HH:mm'
  dueDateTime: timestamp('due_date_time').notNull(),
  priority: text('priority').default('medium').notNull(), // 'low' | 'medium' | 'urgent'
  status: text('status').default('new').notNull(), // 'new' | 'in_progress' | 'completed' | 'postponed'
  checklist: jsonb('checklist').default('[]').notNull(), // [{ id: 'sub-1', text: 'Запросить чертеж', completed: false }]
  targetType: text('target_type').default('personal').notNull(), // 'personal' | 'deal' | 'company' | 'contact'
  targetId: text('target_id'),
  targetTitle: text('target_title'),
  dealId: text('deal_id'),
  companyId: text('company_id').references(() => companies.id),
  contactId: text('contact_id').references(() => contacts.id),
  managerId: text('manager_id').notNull(), // e.g. 'adm-01' or email
  managerName: text('manager_name').notNull(),
  reminder: text('reminder').default('15_min_before').notNull(), // 'none' | 'at_due' | '15_min_before' | '1_hour_before'
  reminderTriggered: boolean('reminder_triggered').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('user_tasks_manager_idx').on(table.managerId),
  index('user_tasks_due_idx').on(table.dueDateTime),
  index('user_tasks_status_idx').on(table.status),
]);

// === 12. СОБЫТИЯ КАЛЕНДАРЯ CRM (Calendar Events) ===
export const calendarEvents = pgTable('calendar_events', {
  id: text('id').primaryKey(), // e.g. 'evt-001'
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').default('meeting').notNull(), // 'call' | 'meeting' | 'demo' | 'audit' | 'maintenance'
  startDateTime: timestamp('start_date_time').notNull(),
  endDateTime: timestamp('end_date_time').notNull(),
  location: text('location'),
  companyId: text('company_id').references(() => companies.id),
  companyName: text('company_name'),
  contactId: text('contact_id').references(() => contacts.id),
  contactName: text('contact_name'),
  dealId: text('deal_id'),
  dealTitle: text('deal_title'),
  managerId: text('manager_id').notNull(),
  managerName: text('manager_name').notNull(),
  status: text('status').default('scheduled').notNull(), // 'scheduled' | 'completed' | 'cancelled'
  color: text('color'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('calendar_events_manager_idx').on(table.managerId),
  index('calendar_events_start_idx').on(table.startDateTime),
]);

// === 13. СЕГМЕНТИРОВАННЫЕ СПИСКИ КЛИЕНТОВ (Client Lists / Segments) ===
export const clientLists = pgTable('client_lists', {
  id: text('id').primaryKey(), // e.g. 'list-001'
  name: text('name').notNull(),
  description: text('description'),
  filters: jsonb('filters').default('{}'), // { industries: [], cities: [], equipmentTypes: [] }
  companyIds: jsonb('company_ids').default('[]').notNull(), // ['comp-001', 'comp-002']
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('client_lists_name_idx').on(table.name),
]);

// === 14. СДЕЛКИ CRM (Deals) ===
export const deals = pgTable('deals', {
  id: text('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  companyName: text('company_name').notNull(),
  inn: text('inn'),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  funnel: text('funnel').notNull(),
  stage: text('stage').notNull(),
  serviceType: text('service_type').notNull(),
  details: text('details'),
  estimatedPrice: real('estimated_price'),
  cadFormat: text('cad_format'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lossReason: text('loss_reason'),
  returnReason: text('return_reason'),
  clientEquipment: jsonb('client_equipment'),
  utm: jsonb('utm'),
  items: jsonb('items').default('[]'),
  timeline: jsonb('timeline').default('[]'),
  documents: jsonb('documents').default('[]'),
  createdByManager: text('created_by_manager'),
  responsibleManager: text('responsible_manager'),
});

// === 15. КОММЕРЧЕСКИЕ ПРЕДЛОЖЕНИЯ (Proposals) ===
export const proposals = pgTable('proposals', {
  id: text('id').primaryKey(),
  outgoingNumber: text('outgoing_number').notNull(),
  date: timestamp('date').notNull(),
  toCompany: text('to_company').notNull(),
  content: text('content').notNull(),
  preparedBy: text('prepared_by').notNull(),
  note: text('note'),
  internalNotes: text('internal_notes'),
  contactPerson: text('contact_person'),
  contactPhone: text('contact_phone'),
  dealId: text('deal_id').references(() => deals.id),
  dealTitle: text('deal_title'),
  dealStage: text('deal_stage'),
  dealFunnel: text('deal_funnel'),
  amount: real('amount'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 16. ДОГОВОРЫ И ПРОЕКТЫ (Contracts) ===
export const contracts = pgTable('contracts', {
  id: text('id').primaryKey(),
  number: text('number').notNull(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  date: timestamp('date').notNull(),
  status: text('status').notNull(),
  statusColor: text('status_color'),
  supportUntil: timestamp('support_until'),
  curator: text('curator').notNull(),
  curatorPhone: text('curator_phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 17. СВИДЕТЕЛЬСТВА ОБ ОБУЧЕНИИ (Certificates) ===
export const certificates = pgTable('certificates', {
  id: text('id').primaryKey(),
  certificateNumber: text('certificate_number').notNull(),
  date: timestamp('date').notNull(),
  traineeName: text('trainee_name').notNull(),
  customer: text('customer').notNull(),
  instructor: text('instructor').notNull(),
  files: jsonb('files').default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const metrologyReports = pgTable('metrology_reports', {
  id: text('id').primaryKey(),
  reportNumber: text('report_number').notNull(),
  date: timestamp('date').notNull(),
  objectName: text('object_name').notNull(),
  customer: text('customer').notNull(),
  engineer: text('engineer').notNull(),
  equipment: text('equipment').notNull(),
  fleetDeviceId: text('fleet_device_id'),
  equipmentSerial: text('equipment_serial'),
  inventoryNumber: text('inventory_number'),
  verificationCertificate: text('verification_certificate'),
  verificationValidUntil: text('verification_valid_until'),
  isVerificationExpired: boolean('is_verification_expired').default(false),
  status: text('status').default('issued'),
  contactPerson: text('contact_person'),
  files: jsonb('files').default('[]'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 18. ПАРК ОБОРУДОВАНИЯ КОМПАНИИ (Company Equipment Fleet) ===
export const crmFleetDevices = pgTable('crm_fleet_devices', {
  id: varchar('id', { length: 100 }).primaryKey(),
  catalogProductId: text('catalog_product_id'),
  modelName: text('model_name').notNull(),
  brand: text('brand').notNull(),
  category: text('category').notNull(),
  serialNumber: text('serial_number').notNull(),
  inventoryNumber: text('inventory_number').notNull(),
  status: text('status').default('in_office').notNull(), // 'in_office' | 'on_site' | 'in_verification' | 'maintenance'
  verificationNumber: text('verification_number').notNull(),
  verificationDate: text('verification_date'),
  verificationValidUntil: text('verification_valid_until').notNull(),
  verificationDocUrl: text('verification_doc_url'),
  currentLocation: text('current_location'),
  responsiblePerson: text('responsible_person'),
  notes: text('notes'),
  photoUrl: text('photo_url'),
  accuracy: text('accuracy'),
  measuringRange: text('measuring_range'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === СВЯЗИ ДЛЯ НОВЫХ ТАБЛИЦ ===
export const companiesRelations = relations(companies, ({ many }) => ({
  contacts: many(contacts),
  tasks: many(userTasks),
  events: many(calendarEvents),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  company: one(companies, { fields: [contacts.companyId], references: [companies.id] }),
  tasks: many(userTasks),
  events: many(calendarEvents),
}));

export const userTasksRelations = relations(userTasks, ({ one }) => ({
  company: one(companies, { fields: [userTasks.companyId], references: [companies.id] }),
  contact: one(contacts, { fields: [userTasks.contactId], references: [contacts.id] }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  company: one(companies, { fields: [calendarEvents.companyId], references: [companies.id] }),
  contact: one(contacts, { fields: [calendarEvents.contactId], references: [contacts.id] }),
}));



export const licenses = pgTable('licenses', {
  id: varchar('id', { length: 100 }).primaryKey(),
  title: text('title').notNull(),
  productName: text('product_name').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  company: text('company').notNull(),
  haspId: text('hasp_id'),
  seatsCount: text('seats_count'),
  licenseServer: text('license_server'),
  hardwareModel: text('hardware_model'),
  version: text('version'),
  issueDate: timestamp('issue_date'),
  expiryDate: timestamp('expiry_date'),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const supportTicketsV2 = pgTable('support_tickets_v2', {
  id: varchar('id', { length: 100 }).primaryKey(),
  subject: text('subject').notNull(),
  product: text('product').notNull(),
  clientCompany: text('client_company').notNull(),
  clientName: text('client_name').notNull(),
  date: timestamp('date').notNull(),
  status: text('status').notNull(),
  priority: text('priority').notNull(),
  description: text('description').notNull(),
  assignedEngineer: text('assigned_engineer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


export const crmFunnels = pgTable('crm_funnels', {
  id: varchar('id', { length: 100 }).primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  accentColor: text('accent_color'),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const crmFunnelStages = pgTable('crm_funnel_stages', {
  id: varchar('id', { length: 100 }).primaryKey(),
  funnelId: varchar('funnel_id', { length: 100 }).notNull(),
  label: text('label').notNull(),
  shortLabel: text('short_label').notNull(),
  winRate: integer('win_rate').notNull(),
  color: text('color').notNull(),
  isWon: boolean('is_won').default(false),
  isLost: boolean('is_lost').default(false),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 18. ХРАНИЛИЩЕ КОНТЕНТА CMS (CMS Store) ===
// Заменяет localStorage на стороне сервера, чтобы контент был доступен всем пользователям.
export const cmsStore = pgTable('cms_store', {
  key: varchar('key', { length: 255 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 19. ТАБЛИЦА ТЕКСТОВЫХ КОНСТАНТ (Text Constants) ===
// Хранение ключевых текстовых полей сайта (телефон, адрес, слоганы, заголовки услуг и т.д.)
export const textConstants = pgTable('text_constants', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 150 }).notNull().unique(), // e.g. 'contacts.phoneMain', 'home.mainHeading'
  category: varchar('category', { length: 80 }).notNull(), // 'contacts', 'home', 'about', 'services', 'catalogs', 'footer'
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === 20. ПРАЙС-ЛИСТ И НОМЕНКЛАТУРНЫЙ СПРАВОЧНИК CRM (Price Items Catalog & Price History Engine) ===

// 20.1. КАТЕГОРИИ И ПОДКАТЕГОРИИ НОМЕНКЛАТУРЫ (Price Categories)
export const priceCategories = pgTable('price_categories', {
  id: varchar('id', { length: 100 }).primaryKey(),
  parentId: varchar('parent_id', { length: 100 }), // Иерархическая привязка к родительской категории
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon').default('Tag'), // Имя иконки Lucide (Cpu, Package, Wrench, Tag, Truck)
  colorTheme: text('color_theme').default('blue'),
  orderIndex: integer('order_index').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('price_categories_parent_idx').on(table.parentId),
  index('price_categories_slug_idx').on(table.slug),
  index('price_categories_active_idx').on(table.isActive),
]);

// 20.2. НОМЕНКЛАТУРНЫЕ ПОЗИЦИИ: ТОВАРЫ, ПО, УСЛУГИ, ОСНАСТКА (Price Items)
export const priceItems = pgTable('price_items', {
  id: varchar('id', { length: 100 }).primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  itemType: varchar('item_type', { length: 50 }).default('product').notNull(), // 'product' | 'software_license' | 'engineering_service' | 'accessory' | 'non_core_service'
  categoryId: varchar('category_id', { length: 100 }).references(() => priceCategories.id),
  category: text('category').notNull(), // 'software' | 'hardware' | 'services' | 'accessories' | 'non_core_services'
  categoryLabel: text('category_label').notNull(),
  subCategory: text('sub_category'),
  manufacturer: text('manufacturer').notNull(),
  description: text('description').notNull(),
  unit: text('unit').notNull().default('шт.'),
  currency: varchar('currency', { length: 10 }).default('RUB').notNull(),
  costPriceRub: real('cost_price_rub').default(0).notNull(), // Закупочная себестоимость
  priceRub: real('price_rub').notNull(), // Базовая розничная / продажная цена без НДС
  partnerPriceRub: real('partner_price_rub'), // Оптовая / партнерская цена для интеграторов
  priceUsd: real('price_usd'),
  priceEur: real('price_eur'),
  vatRate: real('vat_rate').default(22).notNull(), // Базовая ставка НДС 22%
  maxDiscountPercent: real('max_discount_percent').default(15).notNull(), // Предел скидки менеджера
  marginPercent: real('margin_percent'), // Авторасчет маржинальности %
  markupPercent: real('markup_percent'), // Авторасчет наценки %
  inStock: boolean('in_stock').default(true).notNull(),
  leadTimeDays: integer('lead_time_days').default(3).notNull(),
  warrantyMonths: integer('warranty_months').default(12),
  supplierName: text('supplier_name'),
  supplierContact: text('supplier_contact'),
  minOrderQty: integer('min_order_qty').default(1),
  specifications: jsonb('specifications').default('{}'),
  notes: text('notes'),
  tags: jsonb('tags').default('[]'),
  isPopular: boolean('is_popular').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  currentVersion: integer('current_version').default(1).notNull(), // Текущая версия цены
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('price_items_sku_idx').on(table.sku),
  index('price_items_category_idx').on(table.category),
  index('price_items_cat_id_idx').on(table.categoryId),
  index('price_items_name_idx').on(table.name),
  index('price_items_active_idx').on(table.isActive),
]);

// 20.3. ИСТОРИЯ И ВЕРСИОНИРОВАНИЕ ЦЕН (Price History & Versioning Audit Log)
export const priceHistory = pgTable('price_history', {
  id: varchar('id', { length: 100 }).primaryKey(), // UUID или 'phist-001'
  itemId: varchar('item_id', { length: 100 }).references(() => priceItems.id, { onDelete: 'cascade' }).notNull(),
  versionNumber: integer('version_number').notNull(),
  costPriceRub: real('cost_price_rub').notNull(), // Закупочная себестоимость в этой версии
  priceRub: real('price_rub').notNull(), // Розничная / продажная цена в этой версии
  partnerPriceRub: real('partner_price_rub'),
  priceUsd: real('price_usd'),
  vatRate: real('vat_rate').default(22).notNull(),
  marginPercent: real('margin_percent'),
  markupPercent: real('markup_percent'),
  maxDiscountPercent: real('max_discount_percent').default(15),
  validFrom: timestamp('valid_from').defaultNow().notNull(),
  validTo: timestamp('valid_to'), // null если версия активна в текущий момент
  changeReason: text('change_reason').notNull(), // Причина: 'Индексация прайса вендора', 'Курсовая корректировка', etc.
  changedByUserId: text('changed_by_user_id'),
  changedByManagerName: text('changed_by_manager_name').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('price_history_item_idx').on(table.itemId),
  index('price_history_valid_idx').on(table.validFrom),
  index('price_history_version_idx').on(table.versionNumber),
]);

// 20.4. ТИПЫ ЦЕН И ПРАВИЛА СКИДОК ДЛЯ СЕГМЕНТОВ (Price Tiers & Customer Rules)
export const priceTierRules = pgTable('price_tier_rules', {
  id: varchar('id', { length: 100 }).primaryKey(), // 'retail' | 'partner' | 'vip' | 'tender'
  name: text('name').notNull(),
  description: text('description'),
  discountPercent: real('discount_percent').default(0).notNull(),
  minMarginThresholdPercent: real('min_margin_threshold_percent').default(15).notNull(), // Защитный порог маржи
  isDefault: boolean('is_default').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// === СВЯЗИ ДЛЯ ПРАЙС-ЛИСТОВ И ИСТОРИИ ЦЕН (Price Lists Relations) ===
export const priceCategoriesRelations = relations(priceCategories, ({ one, many }) => ({
  parent: one(priceCategories, { fields: [priceCategories.parentId], references: [priceCategories.id] }),
  children: many(priceCategories),
  items: many(priceItems),
}));

export const priceItemsRelations = relations(priceItems, ({ one, many }) => ({
  categoryObj: one(priceCategories, { fields: [priceItems.categoryId], references: [priceCategories.id] }),
  history: many(priceHistory),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  item: one(priceItems, { fields: [priceHistory.itemId], references: [priceItems.id] }),
}));

export type PriceCategoryRecord = typeof priceCategories.$inferSelect;
export type PriceItemRecord = typeof priceItems.$inferSelect;
export type PriceHistoryRecord = typeof priceHistory.$inferSelect;
export type PriceTierRuleRecord = typeof priceTierRules.$inferSelect;


