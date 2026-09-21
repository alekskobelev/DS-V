const fs = require('fs');

// Fix schema.ts
let schemaContent = fs.readFileSync('src/db/schema.ts', 'utf8');
schemaContent = schemaContent.replace(
  "  index\n} from 'drizzle-orm/pg-core';",
  "  index,\n  varchar\n} from 'drizzle-orm/pg-core';"
);
fs.writeFileSync('src/db/schema.ts', schemaContent);

// Fix crmModule.ts
let crmContent = fs.readFileSync('src/server/crmModule.ts', 'utf8');
crmContent = crmContent.replace(
  /import \{\s*INITIAL_SUPPORT_TICKETS,\s*INITIAL_LICENSES,\s*INITIAL_CRM_DEALS,\s*INITIAL_PROPOSALS,\s*INITIAL_CONTRACTS,\s*ExtendedDeal,\s*CommercialProposal,\s*ProjectContract,\s*TrainingCertificate,\s*SupportTicketItem,\s*LicenseItem\s*\}\ from '\.\.\/data\/mockCrmData\.ts';/,
  `import {
  INITIAL_SUPPORT_TICKETS,
  INITIAL_LICENSES,
  INITIAL_CRM_DEALS,
  INITIAL_PROPOSALS,
  INITIAL_CONTRACTS,
  ExtendedDeal,
  CommercialProposal,
  ProjectContract
} from '../data/mockCrmData.ts';
import {
  TrainingCertificate,
  SupportTicketItem,
  LicenseItem
} from '../types.ts';`
);
fs.writeFileSync('src/server/crmModule.ts', crmContent);

console.log('Fixed schema and lint');
