const fs = require('fs');
const file = 'src/server/crmModule.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports for Deals, Proposals, Contracts
const importsToAdd = `
import { 
  ExtendedDeal, 
  CommercialProposal, 
  ProjectContract, 
  TrainingCertificate 
} from '../types';
import { 
  INITIAL_CRM_DEALS, 
  INITIAL_PROPOSALS, 
  INITIAL_CONTRACTS 
} from '../data/mockCrmData';
`;

content = content.replace("import { db } from '../db/db';", importsToAdd + "\nimport { db } from '../db/db';");

// 2. Add stores
const storesToAdd = `
let dealsStore: ExtendedDeal[] = [...INITIAL_CRM_DEALS];
let proposalsStore: CommercialProposal[] = [...INITIAL_PROPOSALS];
let contractsStore: ProjectContract[] = [...INITIAL_CONTRACTS];
let certificatesStore: TrainingCertificate[] = [
  {
    id: 'cert-1',
    certificateNumber: '2026-000142',
    date: '2026-05-29T00:00:00.000Z',
    traineeName: 'Захарова Светлана Николаевна',
    customer: 'ООО «АВТОСВЕТ»',
    instructor: 'С.Ю. Некрасов',
    files: []
  }
];
`;
content = content.replace("let clientListsStore: ClientSegmentList[] = [...INITIAL_CLIENT_LISTS];", "let clientListsStore: ClientSegmentList[] = [...INITIAL_CLIENT_LISTS];\n" + storesToAdd);

// 3. Add endpoints at the end before the last closing brace
const newEndpoints = `
  // ==========================================
  // DEALS
  // ==========================================
  app.get('/api/crm/deals', async (_req, res) => {
    try {
      res.json({ success: true, data: dealsStore });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post('/api/crm/deals', async (req, res) => {
    try {
      const deal = req.body;
      dealsStore.unshift(deal);
      if (isDbConfigured()) {
        await db.insert(schema.deals).values({
          ...deal,
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
      }
      res.status(201).json({ success: true, data: deal });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/deals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = dealsStore.findIndex(d => d.id === id);
      if (idx !== -1) dealsStore[idx] = { ...dealsStore[idx], ...updates, updatedAt: new Date().toISOString() };
      if (isDbConfigured()) {
        await db.update(schema.deals).set({ ...updates, updatedAt: new Date() }).where(eq(schema.deals.id, id));
      }
      res.json({ success: true, data: dealsStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/deals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      dealsStore = dealsStore.filter(d => d.id !== id);
      if (isDbConfigured()) await db.delete(schema.deals).where(eq(schema.deals.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // ==========================================
  // PROPOSALS
  // ==========================================
  app.get('/api/crm/proposals', async (_req, res) => {
    try {
      res.json({ success: true, data: proposalsStore });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post('/api/crm/proposals', async (req, res) => {
    try {
      const prop = req.body;
      proposalsStore.unshift(prop);
      if (isDbConfigured()) {
        await db.insert(schema.proposals).values({
          ...prop,
          date: new Date(prop.date),
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
      }
      res.status(201).json({ success: true, data: prop });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/proposals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = proposalsStore.findIndex(d => d.id === id);
      if (idx !== -1) proposalsStore[idx] = { ...proposalsStore[idx], ...updates };
      if (isDbConfigured()) {
        await db.update(schema.proposals).set({ ...updates, updatedAt: new Date() }).where(eq(schema.proposals.id, id));
      }
      res.json({ success: true, data: proposalsStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/proposals/:id', async (req, res) => {
    try {
      const { id } = req.params;
      proposalsStore = proposalsStore.filter(d => d.id !== id);
      if (isDbConfigured()) await db.delete(schema.proposals).where(eq(schema.proposals.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // ==========================================
  // CONTRACTS
  // ==========================================
  app.get('/api/crm/contracts', async (_req, res) => {
    try {
      res.json({ success: true, data: contractsStore });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post('/api/crm/contracts', async (req, res) => {
    try {
      const doc = req.body;
      contractsStore.unshift(doc);
      if (isDbConfigured()) {
        await db.insert(schema.contracts).values({
          ...doc,
          date: new Date(doc.date),
          supportUntil: doc.supportUntil ? new Date(doc.supportUntil) : null,
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
      }
      res.status(201).json({ success: true, data: doc });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/contracts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = contractsStore.findIndex(d => d.id === id);
      if (idx !== -1) contractsStore[idx] = { ...contractsStore[idx], ...updates };
      if (isDbConfigured()) {
        await db.update(schema.contracts).set({ ...updates, updatedAt: new Date() }).where(eq(schema.contracts.id, id));
      }
      res.json({ success: true, data: contractsStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/contracts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      contractsStore = contractsStore.filter(d => d.id !== id);
      if (isDbConfigured()) await db.delete(schema.contracts).where(eq(schema.contracts.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // ==========================================
  // CERTIFICATES
  // ==========================================
  app.get('/api/crm/certificates', async (_req, res) => {
    try {
      res.json({ success: true, data: certificatesStore });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.post('/api/crm/certificates', async (req, res) => {
    try {
      const cert = req.body;
      certificatesStore.unshift(cert);
      if (isDbConfigured()) {
        await db.insert(schema.certificates).values({
          ...cert,
          date: new Date(cert.date),
          createdAt: new Date(),
          updatedAt: new Date()
        }).onConflictDoNothing();
      }
      res.status(201).json({ success: true, data: cert });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.patch('/api/crm/certificates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = certificatesStore.findIndex(d => d.id === id);
      if (idx !== -1) certificatesStore[idx] = { ...certificatesStore[idx], ...updates };
      if (isDbConfigured()) {
        await db.update(schema.certificates).set({ ...updates, updatedAt: new Date() }).where(eq(schema.certificates.id, id));
      }
      res.json({ success: true, data: certificatesStore[idx] });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
  app.delete('/api/crm/certificates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      certificatesStore = certificatesStore.filter(d => d.id !== id);
      if (isDbConfigured()) await db.delete(schema.certificates).where(eq(schema.certificates.id, id));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });
}
`;

content = content.replace(/}\s*$/, newEndpoints + "\n}");

fs.writeFileSync(file, content);
console.log('Successfully patched crmModule.ts');
