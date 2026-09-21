const fs = require('fs');

let crmContent = fs.readFileSync('src/server/crmModule.ts', 'utf8');

const replacement = `
  app.get('/api/crm/funnels', async (_req, res) => {
    try {
      if (isDbConfigured()) {
        const funnels = await db.select().from(schema.crmFunnels).orderBy(asc(schema.crmFunnels.createdAt));
        const stages = await db.select().from(schema.crmFunnelStages).orderBy(asc(schema.crmFunnelStages.orderIndex));
        
        // Group stages by funnel
        const result = funnels.map(f => ({
          ...f,
          stages: stages.filter(s => s.funnelId === f.id)
        }));
        
        res.json({ success: true, data: result });
      } else {
        res.json({ success: true, data: [] });
      }
    } catch (e) {
      console.error('Failed to get funnels', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
`;

crmContent = crmContent.replace(replacement, replacement.replace(
  'const result = funnels.map(f => ({',
  `
        if (funnels.length === 0) {
           // We could seed it here, but instead let's just return empty array and let frontend use fallback
           return res.json({ success: true, data: [] });
        }
        
        const result = funnels.map(f => ({`
));

fs.writeFileSync('src/server/crmModule.ts', crmContent);
console.log('Funnels get logic updated');
