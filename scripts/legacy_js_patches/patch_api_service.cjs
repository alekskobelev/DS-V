const fs = require('fs');
let code = fs.readFileSync('src/services/apiService.ts', 'utf8');

const methods = `
  // --- Admin CRM & Tickets ---
  async getServiceRequests(): Promise<any[]> {
    try {
      const res = await fetch('/api/service-requests');
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('Failed to fetch service requests', e);
      return [];
    }
  },

  async updateServiceRequestStatus(id: string, status: string): Promise<boolean> {
    try {
      const res = await fetch(\`/api/service-requests/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to update service request', e);
      return false;
    }
  },

  async updateB2BTicketStatus(id: string, status: string): Promise<boolean> {
    try {
      const res = await fetch(\`/api/b2b/tickets/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to update ticket status', e);
      return false;
    }
  },
`;

code = code.replace('export const apiService = {', 'export const apiService = {' + methods);
fs.writeFileSync('src/services/apiService.ts', code);
console.log("apiService updated!");
