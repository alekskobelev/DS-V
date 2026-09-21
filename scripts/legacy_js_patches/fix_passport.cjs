const fs = require('fs');
let content = fs.readFileSync('docs/SITE_PASSPORT.md', 'utf8');

content = content.replace(
  '| **База данных** | PostgreSQL + Drizzle ORM (или Prisma) | Надежное реляционное хранение данных CMS, аналитики, тикетов и заявок |',
  '| **База данных** | Local PostgreSQL 15 + Drizzle ORM | Локальное/Self-Hosted хранение данных на собственном сервере (Docker) |'
);

content = content.replace(
  '* **База данных:** PostgreSQL 15+.',
  '* **База данных:** PostgreSQL 15+ (Local / Docker).'
);

fs.writeFileSync('docs/SITE_PASSPORT.md', content);
console.log('SITE_PASSPORT.md updated');
