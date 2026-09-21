const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

// 1. Add activeTab 'requests'
code = code.replace(
  "useState<'contracts' | 'tickets' | 'licenses' | 'team'>('contracts');",
  "useState<'contracts' | 'tickets' | 'licenses' | 'team' | 'requests'>('requests');"
);

// 2. Add state for RFQs
const stateToAdd = `
  const [rfqs, setRfqs] = useState<any[]>([]);

  // Загрузка Заявок
  useEffect(() => {
    let isMounted = true;
    apiService.getServiceRequests().then((data) => {
      if (isMounted) setRfqs(data);
    });
    return () => { isMounted = false; };
  }, []);
`;
code = code.replace(
  "// Загрузка B2B тикетов с сервера",
  stateToAdd + "\n  // Загрузка B2B тикетов с сервера"
);

// 3. Add Tab Button
const tabButton = `
            <button
              onClick={() => setActiveTab('requests')}
              className={\`flex items-center gap-2 px-4 py-3 font-semibold text-xs transition-colors border-b-2 \${
                activeTab === 'requests'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }\`}
            >
              <FileText className="w-4 h-4" />
              Мои заявки
            </button>
`;
code = code.replace(
  /<button[\s\S]*?onClick=\{\(\) => setActiveTab\('contracts'\)\}[\s\S]*?<\/button>/,
  tabButton + "\n$&"
);

// 4. Add Tab Content
const tabContent = `
      {/* Tab 1.5: My Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Мои заявки и расчеты стоимости</h2>
          </div>
          {rfqs.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-gray-500 text-sm font-medium">
              У вас пока нет активных заявок.
            </div>
          ) : (
            <div className="grid gap-4">
              {rfqs.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                        {r.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {new Date(r.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">
                      {r.serviceType === 'software' ? 'Заявка на ПО' : 
                       r.serviceType === 'demo' ? 'Заказ демонстрации' : 
                       r.serviceType === 'consultation' ? 'Консультация инженера' : 
                       'Заявка: ' + r.serviceType}
                    </h3>
                    {r.details && (
                      <p className="text-xs text-gray-600 line-clamp-2 max-w-2xl">{r.details}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <span
                      className={\`px-3 py-1.5 text-xs font-semibold rounded-lg border \${
                        r.status === 'completed' || r.status === 'closed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : r.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }\`}
                    >
                      {r.status === 'completed' || r.status === 'closed'
                        ? 'Завершено'
                        : r.status === 'in_progress'
                        ? 'В работе'
                        : 'На рассмотрении'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
`;

code = code.replace(
  /\{\/\* Tab 1: Contracts \*\/\}/,
  tabContent + "\n      {/* Tab 1: Contracts */}"
);

fs.writeFileSync('src/pages/AccountPage.tsx', code);
console.log('Account requests added');
