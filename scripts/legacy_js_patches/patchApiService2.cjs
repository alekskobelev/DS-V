const fs = require('fs');
const file = 'src/services/apiService.ts';
let content = fs.readFileSync(file, 'utf8');

const newMethods = `
  // --- SUPPORT TICKETS ---
  async getCrmTickets(): Promise<{ success: boolean; data: any[] }> {
    try {
      const res = await fetch('/api/crm/tickets');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM tickets', e);
      return { success: false, data: [] };
    }
  },
  async saveCrmTicket(ticket: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/crm/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM ticket', e);
      return { success: false };
    }
  },
  async updateCrmTicket(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(\`/api/crm/tickets/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM ticket', e);
      return { success: false };
    }
  },
  async deleteCrmTicket(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(\`/api/crm/tickets/\${id}\`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM ticket', e);
      return { success: false };
    }
  },

  // --- LICENSES ---
  async getCrmLicenses(): Promise<{ success: boolean; data: any[] }> {
    try {
      const res = await fetch('/api/crm/licenses');
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch (e) {
      console.warn('Failed to get CRM licenses', e);
      return { success: false, data: [] };
    }
  },
  async saveCrmLicense(license: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch('/api/crm/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(license)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to save CRM license', e);
      return { success: false };
    }
  },
  async updateCrmLicense(id: string, updates: any): Promise<{ success: boolean; data?: any }> {
    try {
      const res = await fetch(\`/api/crm/licenses/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return await res.json();
    } catch (e) {
      console.warn('Failed to update CRM license', e);
      return { success: false };
    }
  },
  async deleteCrmLicense(id: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(\`/api/crm/licenses/\${id}\`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      console.warn('Failed to delete CRM license', e);
      return { success: false };
    }
  },
`;

content = content.replace("async getCrmClientLists", newMethods + "\n  async getCrmClientLists");
fs.writeFileSync(file, content);
console.log('Successfully patched apiService.ts');
