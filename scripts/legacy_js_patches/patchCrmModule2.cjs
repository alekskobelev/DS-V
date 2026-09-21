const fs = require('fs');
const file = 'src/server/crmModule.ts';
let content = fs.readFileSync(file, 'utf8');

const newEndpoints = `
  // --- TICKETS ---
  app.get('/api/crm/tickets', async (req: Request, res: Response) => {
    try {
      if (isDbConfigured()) {
        const data = await db.select().from(schema.supportTicketsV2);
        if (data.length > 0) ticketsStore = data as any[];
      }
      res.json({ success: true, data: ticketsStore });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post('/api/crm/tickets', async (req: Request, res: Response) => {
    try {
      const ticket = req.body;
      ticketsStore.unshift(ticket);
      if (isDbConfigured()) {
        await db.insert(schema.supportTicketsV2).values({
          ...ticket,
          date: new Date(ticket.date),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      res.json({ success: true, data: ticket });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/tickets/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = ticketsStore.findIndex(d => d.id === id);
      if (idx !== -1) {
        ticketsStore[idx] = { ...ticketsStore[idx], ...updates };
      }
      if (isDbConfigured()) {
        await db.update(schema.supportTicketsV2).set({ ...updates, updatedAt: new Date() }).where(eq(schema.supportTicketsV2.id, id));
      }
      res.json({ success: true, data: ticketsStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/tickets/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      ticketsStore = ticketsStore.filter(d => d.id !== id);
      if (isDbConfigured()) await db.delete(schema.supportTicketsV2).where(eq(schema.supportTicketsV2.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // --- LICENSES ---
  app.get('/api/crm/licenses', async (req: Request, res: Response) => {
    try {
      if (isDbConfigured()) {
        const data = await db.select().from(schema.licenses);
        if (data.length > 0) licensesStore = data as any[];
      }
      res.json({ success: true, data: licensesStore });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post('/api/crm/licenses', async (req: Request, res: Response) => {
    try {
      const license = req.body;
      licensesStore.unshift(license);
      if (isDbConfigured()) {
        await db.insert(schema.licenses).values({
          ...license,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      res.json({ success: true, data: license });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/licenses/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = licensesStore.findIndex(d => d.id === id);
      if (idx !== -1) {
        licensesStore[idx] = { ...licensesStore[idx], ...updates };
      }
      if (isDbConfigured()) {
        await db.update(schema.licenses).set({ ...updates, updatedAt: new Date() }).where(eq(schema.licenses.id, id));
      }
      res.json({ success: true, data: licensesStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/licenses/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      licensesStore = licensesStore.filter(d => d.id !== id);
      if (isDbConfigured()) await db.delete(schema.licenses).where(eq(schema.licenses.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
}
`;

content = content.replace(/let certificatesStore: TrainingCertificate\[\] = \[[\s\S]*?\n\n/m, 
(match) => {
  return match + "let ticketsStore: any[] = [...INITIAL_SUPPORT_TICKETS];\nlet licensesStore: any[] = [...INITIAL_LICENSES];\n\n";
});

content = content.replace("import {\n  INITIAL_CRM_DEALS,", "import {\n  INITIAL_SUPPORT_TICKETS,\n  INITIAL_LICENSES,\n  INITIAL_CRM_DEALS,");
content = content.replace("  TrainingCertificate\n} from '../data/mockCrmData.ts';", "  TrainingCertificate,\n  SupportTicketItem,\n  LicenseItem\n} from '../data/mockCrmData.ts';");

content = content.replace(/}\s*$/g, newEndpoints);
fs.writeFileSync(file, content);
console.log('Successfully patched crmModule.ts');
