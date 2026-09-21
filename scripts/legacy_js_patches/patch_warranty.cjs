const fs = require('fs');
let content = fs.readFileSync('src/components/account/AccountTicketModal.tsx', 'utf8');

const warningHtml = `
                {/* Warranty Check */}
                {contractId && contracts.find(c => c.id === contractId) && (
                  (() => {
                    const linkedContract = contracts.find(c => c.id === contractId);
                    if (!linkedContract?.supportUntil) return null;
                    
                    // Parse date "DD.MM.YYYY"
                    const parts = linkedContract.supportUntil.split('.');
                    if (parts.length === 3) {
                      const supportDate = new Date(\`\${parts[2]}-\${parts[1]}-\${parts[0]}\`);
                      if (supportDate < new Date()) {
                        return (
                          <div className="col-span-full mt-2 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in">
                            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-bold text-red-900">Срок технической поддержки истек</div>
                              <div className="text-xs text-red-700 mt-0.5">
                                Гарантия по договору {linkedContract.number} закончилась {linkedContract.supportUntil}. Данная заявка может быть рассмотрена на коммерческой основе после согласования стоимости работ.
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="col-span-full mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-in fade-in">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-bold text-emerald-900">Оборудование на гарантии</div>
                              <div className="text-xs text-emerald-700 mt-0.5">
                                Техническая поддержка по договору {linkedContract.number} действует до {linkedContract.supportUntil}.
                              </div>
                            </div>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()
                )}
`;

content = content.replace(
  "{/* Description */}",
  warningHtml + "\n                {/* Description */}"
);

// We need to import ShieldCheck if it's not imported. Wait, ShieldAlert is already imported.
if (!content.includes('ShieldCheck')) {
  content = content.replace("ShieldAlert", "ShieldAlert, ShieldCheck");
}

fs.writeFileSync('src/components/account/AccountTicketModal.tsx', content);
