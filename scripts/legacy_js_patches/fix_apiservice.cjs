const fs = require('fs');
let code = fs.readFileSync('src/services/apiService.ts', 'utf8');

const newMethods = `
  // --- New DB-backed endpoints ---
  async getKnowledgeBaseArticles(): Promise<any[]> {
    try {
      const res = await fetch('/api/knowledge-base');
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('Failed to fetch knowledge base from DB', e);
      return [];
    }
  },

  async getEquipmentCatalog(): Promise<any[]> {
    try {
      const res = await fetch('/api/equipment');
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('Failed to fetch equipment catalog from DB', e);
      return [];
    }
  },

  async getCmsPages(): Promise<any[]> {
    try {
      const res = await fetch('/api/cms/pages');
      if (!res.ok) throw new Error('API Error');
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('Failed to fetch CMS pages from DB', e);
      return [];
    }
  },
`;

code = code.replace('  // Central CMS State API', newMethods + '\n  // Central CMS State API');
fs.writeFileSync('src/services/apiService.ts', code);
console.log('Added methods to apiService.ts');
