const fs = require('fs');
const file = 'src/db/schema.ts';
let content = fs.readFileSync(file, 'utf8');

const newTables = `

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
`;

content += newTables;
fs.writeFileSync(file, content);
console.log('Successfully added licenses and supportTicketsV2 to schema');
