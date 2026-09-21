const fs = require('fs');
let content = fs.readFileSync('src/components/account/AccountLicenseModal.tsx', 'utf8');

if (!content.includes('import { useApp }')) {
  content = content.replace("import { AccountFileModal } from './AccountFileModal';", "import { useApp } from '../../context/AppContext';\nimport { AccountFileModal } from './AccountFileModal';");
}

content = content.replace(
  "const [notes, setNotes] = useState(license?.notes || '');",
  "const [notes, setNotes] = useState(license?.notes || '');\n  const [dealId, setDealId] = useState(license?.dealId || '');\n  const [contractId, setContractId] = useState(license?.contractId || '');\n  const { deals, contracts } = useApp();"
);

content = content.replace(
  "files: files",
  "files: files,\n      dealId: dealId || undefined,\n      contractId: contractId || undefined"
);

const fieldsHtml = `
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Привязка к договору</label>
                  <select
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-800"
                  >
                    <option value="">Без привязки</option>
                    {contracts.map(c => (
                      <option key={c.id} value={c.id}>{c.number} {c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Привязка к сделке (CRM)</label>
                  <select
                    value={dealId}
                    onChange={(e) => setDealId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-800"
                  >
                    <option value="">Без привязки</option>
                    {deals.map(d => (
                      <option key={d.id} value={d.id}>{d.id} - {d.companyName}</option>
                    ))}
                  </select>
                </div>
              </div>
`;

content = content.replace(
  "{/* Hardware & Usage */}",
  fieldsHtml + "\n              {/* Hardware & Usage */}"
);

fs.writeFileSync('src/components/account/AccountLicenseModal.tsx', content);
