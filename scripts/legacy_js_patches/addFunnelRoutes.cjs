const fs = require('fs');

let crmContent = fs.readFileSync('src/server/crmModule.ts', 'utf8');

const routes = `
  // ==========================================
  // CRM FUNNELS (Dynamic stages)
  // ==========================================
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

  app.post('/api/crm/funnels', async (req, res) => {
    try {
      const { id, name, description, accentColor, icon, stages } = req.body;
      if (isDbConfigured()) {
        await db.insert(schema.crmFunnels).values({ id, name, description, accentColor, icon }).onConflictDoNothing();
        if (stages && stages.length > 0) {
          const stageValues = stages.map((s, idx) => ({
            id: s.id,
            funnelId: id,
            label: s.label,
            shortLabel: s.shortLabel,
            winRate: s.winRate,
            color: s.color,
            isWon: s.isWon || false,
            isLost: s.isLost || false,
            orderIndex: idx
          }));
          await db.insert(schema.crmFunnelStages).values(stageValues).onConflictDoNothing();
        }
      }
      res.status(201).json({ success: true });
    } catch (e) {
      console.error('Failed to save funnel', e);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
`;

crmContent = crmContent.replace('// ==========================================\n  // PROPOSALS', routes + '\n  // ==========================================\n  // PROPOSALS');

fs.writeFileSync('src/server/crmModule.ts', crmContent);
console.log('Added funnel routes');
