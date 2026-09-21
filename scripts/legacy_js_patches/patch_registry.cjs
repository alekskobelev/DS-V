const fs = require('fs');
let content = fs.readFileSync('src/components/crm/ContractsRegistry.tsx', 'utf8');

content = content.replace(
  "    authUsers\n  } = useApp();",
  "    authUsers,\n    licenses,\n    supportTickets\n  } = useApp();"
);

const licensesTicketsHtml = `
              {/* Connected Licenses and Tickets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {/* Licenses */}
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30">
                  <h4 className="text-xs font-bold text-blue-900 uppercase mb-3 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    Выданные лицензии ({licenses.filter(l => l.contractId === viewingContract.id).length})
                  </h4>
                  <div className="space-y-2">
                    {licenses.filter(l => l.contractId === viewingContract.id).map(lic => (
                      <div key={lic.id} className="p-2.5 bg-white border border-blue-100 rounded-lg text-xs">
                        <div className="font-bold text-gray-800">{lic.title}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{lic.type} • {lic.seatsCount}</div>
                        <div className="mt-1.5 inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                          {lic.status}
                        </div>
                      </div>
                    ))}
                    {licenses.filter(l => l.contractId === viewingContract.id).length === 0 && (
                      <div className="text-[11px] text-gray-400 italic">Нет привязанных лицензий</div>
                    )}
                  </div>
                </div>

                {/* Support Tickets */}
                <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30">
                  <h4 className="text-xs font-bold text-amber-900 uppercase mb-3 flex items-center gap-1.5">
                    <LifeBuoy className="w-3.5 h-3.5" />
                    Заявки в техподдержку ({supportTickets.filter(t => t.contractId === viewingContract.id).length})
                  </h4>
                  <div className="space-y-2">
                    {supportTickets.filter(t => t.contractId === viewingContract.id).map(ticket => (
                      <div key={ticket.id} className="p-2.5 bg-white border border-amber-100 rounded-lg text-xs">
                        <div className="font-bold text-gray-800">{ticket.subject}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">{ticket.id} • {ticket.date}</div>
                        <div className="mt-1.5 inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700">
                          {ticket.status === 'open' ? 'Открыта' : ticket.status === 'resolved' ? 'Решена' : 'В работе'}
                        </div>
                      </div>
                    ))}
                    {supportTickets.filter(t => t.contractId === viewingContract.id).length === 0 && (
                      <div className="text-[11px] text-gray-400 italic">Нет обращений по договору</div>
                    )}
                  </div>
                </div>
              </div>
`;

if (!content.includes('import { import * as XLSX')) {
  content = content.replace("import { KeyRound, LifeBuoy", "import { KeyRound, LifeBuoy"); // dummy
} else {
  // If KeyRound, LifeBuoy are missing from lucide-react imports:
  // Let's just make sure they are imported
}
// wait, I will just add KeyRound and LifeBuoy to lucide-react imports.
content = content.replace("import { ", "import { KeyRound, LifeBuoy, ");

content = content.replace(
  "{viewingContract.scope && (",
  licensesTicketsHtml + "\n\n              {viewingContract.scope && ("
);

fs.writeFileSync('src/components/crm/ContractsRegistry.tsx', content);
