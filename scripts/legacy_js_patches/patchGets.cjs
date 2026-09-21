const fs = require('fs');
let content = fs.readFileSync('src/server/crmModule.ts', 'utf8');

// Deals GET
content = content.replace(
  /app\.get\('\/api\/crm\/deals', async \(_req, res\) => \{\s*try \{\s*res\.json\(\{ success: true, data: dealsStore \}\);\s*\} catch \(e\) \{/g,
  `app.get('/api/crm/deals', async (_req, res) => {
    try {
      if (isDbConfigured()) {
        const data = await db.select().from(schema.deals).orderBy(desc(schema.deals.createdAt));
        if (data && data.length > 0) {
          dealsStore = data as any[];
        }
      }
      res.json({ success: true, data: dealsStore });
    } catch (e) {`
);

// Proposals GET
content = content.replace(
  /app\.get\('\/api\/crm\/proposals', async \(_req, res\) => \{\s*try \{\s*res\.json\(\{ success: true, data: proposalsStore \}\);\s*\} catch \(e\) \{/g,
  `app.get('/api/crm/proposals', async (_req, res) => {
    try {
      if (isDbConfigured()) {
        const data = await db.select().from(schema.proposals).orderBy(desc(schema.proposals.createdAt));
        if (data && data.length > 0) {
          proposalsStore = data as any[];
        }
      }
      res.json({ success: true, data: proposalsStore });
    } catch (e) {`
);

// Contracts GET
content = content.replace(
  /app\.get\('\/api\/crm\/contracts', async \(_req, res\) => \{\s*try \{\s*res\.json\(\{ success: true, data: contractsStore \}\);\s*\} catch \(e\) \{/g,
  `app.get('/api/crm/contracts', async (_req, res) => {
    try {
      if (isDbConfigured()) {
        const data = await db.select().from(schema.contracts).orderBy(desc(schema.contracts.createdAt));
        if (data && data.length > 0) {
          contractsStore = data as any[];
        }
      }
      res.json({ success: true, data: contractsStore });
    } catch (e) {`
);

// Certificates GET
content = content.replace(
  /app\.get\('\/api\/crm\/certificates', async \(_req, res\) => \{\s*try \{\s*res\.json\(\{ success: true, data: certificatesStore \}\);\s*\} catch \(e\) \{/g,
  `app.get('/api/crm/certificates', async (_req, res) => {
    try {
      if (isDbConfigured()) {
        const data = await db.select().from(schema.certificates).orderBy(desc(schema.certificates.createdAt));
        if (data && data.length > 0) {
          certificatesStore = data as any[];
        }
      }
      res.json({ success: true, data: certificatesStore });
    } catch (e) {`
);

fs.writeFileSync('src/server/crmModule.ts', content);
console.log('Patched GETs in crmModule.ts');
