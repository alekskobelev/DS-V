const fs = require('fs');
const file = 'src/services/apiService.ts';
let content = fs.readFileSync(file, 'utf8');

const newMethods = `
  // --- DEALS ---
  async getCrmDeals(): Promise<{ success: boolean; data: any[] }> {
    try {
      const res = await fetch('/api/crm/deals');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM deals', e);
      return { success: false, data: [] };
    }
  },
  async saveCrmDeal(deal: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/crm/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deal)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM deal', e);
      return { success: false };
    }
  },
  async updateCrmDeal(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(\`/api/crm/deals/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM deal', e);
      return { success: false };
    }
  },
  async deleteCrmDeal(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(\`/api/crm/deals/\${id}\`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM deal', e);
      return { success: false };
    }
  },

  // --- PROPOSALS ---
  async getCrmProposals(): Promise<{ success: boolean; data: any[] }> {
    try {
      const res = await fetch('/api/crm/proposals');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM proposals', e);
      return { success: false, data: [] };
    }
  },
  async saveCrmProposal(proposal: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/crm/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM proposal', e);
      return { success: false };
    }
  },
  async updateCrmProposal(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(\`/api/crm/proposals/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM proposal', e);
      return { success: false };
    }
  },
  async deleteCrmProposal(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(\`/api/crm/proposals/\${id}\`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM proposal', e);
      return { success: false };
    }
  },

  // --- CONTRACTS ---
  async getCrmContracts(): Promise<{ success: boolean; data: any[] }> {
    try {
      const res = await fetch('/api/crm/contracts');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM contracts', e);
      return { success: false, data: [] };
    }
  },
  async saveCrmContract(contract: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/crm/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contract)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM contract', e);
      return { success: false };
    }
  },
  async updateCrmContract(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(\`/api/crm/contracts/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM contract', e);
      return { success: false };
    }
  },
  async deleteCrmContract(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(\`/api/crm/contracts/\${id}\`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM contract', e);
      return { success: false };
    }
  },

  // --- CERTIFICATES ---
  async getCrmCertificates(): Promise<{ success: boolean; data: any[] }> {
    try {
      const res = await fetch('/api/crm/certificates');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM certificates', e);
      return { success: false, data: [] };
    }
  },
  async saveCrmCertificate(cert: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/crm/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cert)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM certificate', e);
      return { success: false };
    }
  },
  async updateCrmCertificate(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(\`/api/crm/certificates/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM certificate', e);
      return { success: false };
    }
  },
  async deleteCrmCertificate(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(\`/api/crm/certificates/\${id}\`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM certificate', e);
      return { success: false };
    }
  },
`;

content = content.replace("async getCrmClientLists", newMethods + "\n  async getCrmClientLists");

fs.writeFileSync(file, content);
console.log('Successfully patched apiService.ts');
