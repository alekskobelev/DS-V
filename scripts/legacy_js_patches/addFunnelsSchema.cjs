const fs = require('fs');

const content = `
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
`;

let schemaContent = fs.readFileSync('src/db/schema.ts', 'utf8');
schemaContent += '\n' + content;
fs.writeFileSync('src/db/schema.ts', schemaContent);

console.log('Added funnels schema');
