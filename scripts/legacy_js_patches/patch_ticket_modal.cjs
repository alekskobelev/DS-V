const fs = require('fs');
let content = fs.readFileSync('src/components/account/AccountTicketModal.tsx', 'utf8');

if (!content.includes('import { useApp }')) {
  content = content.replace("import { AccountFileModal } from './AccountFileModal';", "import { useApp } from '../../context/AppContext';\nimport { AccountFileModal } from './AccountFileModal';");
}

content = content.replace(
  "const [assignedEngineer, setAssignedEngineer] = useState(ticket?.assignedEngineer || 'Скобелев Александр Сергеевич');",
  "const [assignedEngineer, setAssignedEngineer] = useState(ticket?.assignedEngineer || 'Скобелев Александр Сергеевич');\n  const [dealId, setDealId] = useState(ticket?.dealId || '');\n  const [contractId, setContractId] = useState(ticket?.contractId || '');\n  const { deals, contracts } = useApp();"
);

content = content.replace(
  "attachments: attachments",
  "attachments: attachments,\n      dealId: dealId || undefined,\n      contractId: contractId || undefined"
);

const fieldsHtml = `
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Привязка к договору</label>
                  <select
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    disabled={!canManage && contractId !== ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Без привязки (Общий вопрос)</option>
                    {contracts.map(c => (
                      <option key={c.id} value={c.id}>{c.number} {c.title}</option>
                    ))}
                  </select>
                </div>
                {canManage && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Привязка к сделке (CRM)</label>
                    <select
                      value={dealId}
                      onChange={(e) => setDealId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-800"
                    >
                      <option value="">Не выбрано</option>
                      {deals.map(d => (
                        <option key={d.id} value={d.id}>{d.id} - {d.companyName} ({d.customerName})</option>
                      ))}
                    </select>
                  </div>
                )}
`;

content = content.replace(
  "{/* Description */}",
  fieldsHtml + "\n                {/* Description */}"
);

fs.writeFileSync('src/components/account/AccountTicketModal.tsx', content);
