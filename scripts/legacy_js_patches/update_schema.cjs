const fs = require('fs');

const schema = `
import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, real, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  fullName: text('full_name'),
  role: text('role').default('client'), // admin or client
  createdAt: timestamp('created_at').defaultNow(),
});

export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(), // Custom TCK-2026-001 format
  organizationId: text('organization_id').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  status: text('status').default('new'),
  urgency: text('urgency').default('medium'),
  equipmentModel: text('equipment_model'),
  equipmentSerial: text('equipment_serial'),
  description: text('description').notNull(),
  attachments: jsonb('attachments').default('[]'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const rfqSubmissions = pgTable('rfq_submissions', {
  id: text('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  companyName: text('company_name'),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  serviceType: text('service_type').notNull(),
  details: text('details'),
  estimatedPrice: real('estimated_price'),
  cadFormat: text('cad_format'),
  createdAt: timestamp('created_at').defaultNow(),
});
`;

fs.writeFileSync('src/db/schema.ts', schema);
console.log('Schema updated.');
