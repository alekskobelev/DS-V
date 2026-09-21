const fs = require('fs');

let content = fs.readFileSync('src/components/crm/ContactCenterView.tsx', 'utf-8');

// 1. Add icons
content = content.replace(
  /} from 'lucide-react';/,
  `  LayoutGrid, List as ListIcon, Table, ArrowDownAZ, ArrowUpZA\n} from 'lucide-react';`
);

// 2. Add states for view mode and sorting
content = content.replace(
  /const \[selectedStatus, setSelectedStatus\] = useState\(''\);/,
  `const [selectedStatus, setSelectedStatus] = useState('');
  const [companyViewMode, setCompanyViewMode] = useState<'cards' | 'list' | 'table'>('cards');
  const [companySort, setCompanySort] = useState<'default' | 'az' | 'za'>('default');`
);

content = content.replace(
  /const \[selectedContactCompany, setSelectedContactCompany\] = useState\(''\);/,
  `const [selectedContactCompany, setSelectedContactCompany] = useState('');
  const [contactViewMode, setContactViewMode] = useState<'cards' | 'list' | 'table'>('cards');
  const [contactSort, setContactSort] = useState<'default' | 'az' | 'za'>('default');`
);

// 3. Add sorting logic to filteredCompanies
content = content.replace(
  /return true;\n    \}\);\n  \}, \[companies, companySearch, selectedIndustry, selectedCity, selectedStatus\]\);/,
  `return true;
    });
    
    if (companySort === 'az') {
      res.sort((a, b) => a.name.localeCompare(b.name));
    } else if (companySort === 'za') {
      res.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    return res;
  }, [companies, companySearch, selectedIndustry, selectedCity, selectedStatus, companySort]);`
);
content = content.replace(/return companies\.filter\(c => \{/, `let res = companies.filter(c => {`);

// 4. Add sorting logic to filteredContacts
content = content.replace(
  /return true;\n    \}\);\n  \}, \[contacts, contactSearch, lprOnly, selectedContactCompany\]\);/,
  `return true;
    });
    
    if (contactSort === 'az') {
      res.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (contactSort === 'za') {
      res.sort((a, b) => b.fullName.localeCompare(a.fullName));
    }
    
    return res;
  }, [contacts, contactSearch, lprOnly, selectedContactCompany, contactSort]);`
);
content = content.replace(/return contacts\.filter\(c => \{/, `let res = contacts.filter(c => {`);

// 5. Replace Company Filters Toolbar
content = content.replace(
  /<select\s+value=\{selectedStatus\}\s+onChange=\{\(e\) => setSelectedStatus\(e\.target\.value\)\}\s+className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-hidden"\s*>\s*<option value="">Все статусы<\/option>\s*<option value="key_partner">Ключевой партнер<\/option>\s*<option value="active">Активный<\/option>\s*<option value="in_progress">В работе<\/option>\s*<option value="potential">Потенциальный<\/option>\s*<\/select>/s,
  `<select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-hidden"
              >
                <option value="">Все статусы</option>
                <option value="key_partner">Ключевой партнер</option>
                <option value="active">Активный</option>
                <option value="in_progress">В работе</option>
                <option value="potential">Потенциальный</option>
              </select>
              
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setCompanySort(companySort === 'az' ? 'za' : 'az')}
                  className={\`p-1.5 rounded-lg transition-colors cursor-pointer \${companySort !== 'default' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}\`}
                  title="Сортировка по алфавиту"
                >
                  {companySort === 'za' ? <ArrowUpZA className="w-3.5 h-3.5" /> : <ArrowDownAZ className="w-3.5 h-3.5" />}
                </button>
                {companySort !== 'default' && (
                  <button 
                    onClick={() => setCompanySort('default')}
                    className="px-1 text-[10px] font-bold text-gray-400 hover:text-red-500 cursor-pointer"
                  >×</button>
                )}
              </div>

              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setCompanyViewMode('cards')}
                  className={\`p-1.5 rounded-lg transition-colors cursor-pointer \${companyViewMode === 'cards' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}\`}
                  title="Карточки"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCompanyViewMode('list')}
                  className={\`p-1.5 rounded-lg transition-colors cursor-pointer \${companyViewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}\`}
                  title="Список"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCompanyViewMode('table')}
                  className={\`p-1.5 rounded-lg transition-colors cursor-pointer \${companyViewMode === 'table' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}\`}
                  title="Таблица"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
              </div>`
);

// 6. Replace Contacts Filters Toolbar
content = content.replace(
  /<select\s+value=\{selectedContactCompany\}\s+onChange=\{\(e\) => setSelectedContactCompany\(e\.target\.value\)\}\s+className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-hidden"\s*>\s*<option value="">Все предприятия<\/option>\s*\{companies\.map\(comp => \(\s*<option key=\{comp\.id\} value=\{comp\.id\}>\{comp\.name\}<\/option>\s*\)\)\}\s*<\/select>/s,
  `<select
                value={selectedContactCompany}
                onChange={(e) => setSelectedContactCompany(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-hidden"
              >
                <option value="">Все предприятия</option>
                {companies.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name}</option>
                ))}
              </select>

              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setContactSort(contactSort === 'az' ? 'za' : 'az')}
                  className={\`p-1.5 rounded-lg transition-colors cursor-pointer \${contactSort !== 'default' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}\`}
                  title="Сортировка по алфавиту"
                >
                  {contactSort === 'za' ? <ArrowUpZA className="w-3.5 h-3.5" /> : <ArrowDownAZ className="w-3.5 h-3.5" />}
                </button>
                {contactSort !== 'default' && (
                  <button 
                    onClick={() => setContactSort('default')}
                    className="px-1 text-[10px] font-bold text-gray-400 hover:text-red-500 cursor-pointer"
                  >×</button>
                )}
              </div>

              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setContactViewMode('cards')}
                  className={\`p-1.5 rounded-lg transition-colors cursor-pointer \${contactViewMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}\`}
                  title="Карточки"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setContactViewMode('list')}
                  className={\`p-1.5 rounded-lg transition-colors cursor-pointer \${contactViewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}\`}
                  title="Список"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setContactViewMode('table')}
                  className={\`p-1.5 rounded-lg transition-colors cursor-pointer \${contactViewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}\`}
                  title="Таблица"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
              </div>`
);

// 7. Company Grid - Start
const oldCompanyGrid = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
                Предприятий по выбранным параметрам не найдено.
              </div>
            ) : (
              filteredCompanies.map(comp => {`;

const newCompanyGrid = `
          {filteredCompanies.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
              Предприятий по выбранным параметрам не найдено.
            </div>
          ) : (
            <>
              {companyViewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCompanies.map(comp => {`;

content = content.replace(oldCompanyGrid, newCompanyGrid);

// 8. Company Grid - End
// The tricky part: we need to replace the end of the cards layout, but ONLY the one for companies.
// It was:
/*
                  </div>
                );
              })
            )}
          </div>
*/
const oldCompanyEnd = `                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. TAB: CONTACTS (Контактные лица / ЛПР) */}`;

const newCompanyEnd = `                  </div>
                );
              })}
            </div>
            )}
            
            {companyViewMode === 'list' && (
              <div className="flex flex-col gap-3">
                {filteredCompanies.map(comp => {
                  const compContacts = contacts.filter(c => c.companyId === comp.id);
                  const lpr = compContacts.find(c => c.isDecisionMaker);
                  
                  return (
                    <div key={comp.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 onClick={() => onOpenCompanyModal(comp)} className="text-sm font-bold text-gray-900 hover:text-emerald-600 cursor-pointer truncate">
                              {comp.name}
                            </h3>
                            {getStatusBadge(comp.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                            <span className="font-mono text-[10px]">ИНН: {comp.inn}</span>
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] text-gray-700">{comp.industry}</span>
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3"/> {comp.city}</span>
                          </div>
                        </div>
                        
                        {lpr && (
                          <div className="hidden md:block flex-1 text-xs p-2 bg-amber-50/50 border border-amber-100 rounded-lg">
                            <div className="font-bold text-amber-900 flex items-center gap-1"><Star className="w-3 h-3 fill-current text-amber-500" /> {lpr.fullName}</div>
                            <div className="text-[10px] text-amber-800 mt-0.5 truncate">{lpr.position}</div>
                          </div>
                        )}
                        
                        <div className="hidden md:block flex-1 text-xs text-gray-500">
                           <div className="font-medium text-gray-700 flex items-center gap-1"><Wrench className="w-3 h-3 text-blue-500" /> Оборудование ({comp.assignedEquipment?.length || 0})</div>
                           <div className="text-[10px] mt-0.5 truncate">{comp.assignedEquipment?.map(e => e.name).join(', ') || '—'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => onOpenTaskModal(undefined, comp.id)} className="p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100" title="Задача"><CheckSquare className="w-4 h-4" /></button>
                        <button onClick={() => onOpenEventModal(comp.id)} className="p-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100" title="В календарь"><Calendar className="w-4 h-4" /></button>
                        <button onClick={() => onOpenCompanyModal(comp)} className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm(\`Удалить предприятие «\${comp.name}»?\`)) onDeleteCompany(comp.id); }} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {companyViewMode === 'table' && (
              <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Название</th>
                      <th className="px-4 py-3">ИНН/КПП</th>
                      <th className="px-4 py-3">Отрасль / Город</th>
                      <th className="px-4 py-3">Статус</th>
                      <th className="px-4 py-3">ЛПР</th>
                      <th className="px-4 py-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCompanies.map(comp => {
                      const compContacts = contacts.filter(c => c.companyId === comp.id);
                      const lpr = compContacts.find(c => c.isDecisionMaker);
                      return (
                        <tr key={comp.id} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="px-4 py-3 font-bold text-gray-900 cursor-pointer hover:text-emerald-600" onClick={() => onOpenCompanyModal(comp)}>{comp.name}</td>
                          <td className="px-4 py-3 font-mono text-[10px] text-gray-600">{comp.inn} / {comp.kpp || '—'}</td>
                          <td className="px-4 py-3 text-gray-600"><span className="block">{comp.industry}</span><span className="text-[10px] text-gray-400">{comp.city}</span></td>
                          <td className="px-4 py-3">{getStatusBadge(comp.status)}</td>
                          <td className="px-4 py-3 text-gray-700">{lpr ? <div className="flex items-center gap-1 text-amber-700 font-medium"><Star className="w-3 h-3 fill-current"/> {lpr.fullName}</div> : <span className="text-gray-400">—</span>}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => onOpenTaskModal(undefined, comp.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Задача"><CheckSquare className="w-3.5 h-3.5" /></button>
                              <button onClick={() => onOpenEventModal(comp.id)} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="В календарь"><Calendar className="w-3.5 h-3.5" /></button>
                              <button onClick={() => onOpenCompanyModal(comp)} className="p-1 text-gray-400 hover:text-emerald-600 rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            </>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. TAB: CONTACTS (Контактные лица / ЛПР) */}`;

content = content.replace(oldCompanyEnd, newCompanyEnd);

// 9. Contacts Grid - Start
const oldContactsGrid = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
                Контактных лиц не найдено.
              </div>
            ) : (
              filteredContacts.map(cont => {`;

const newContactsGrid = `
          {filteredContacts.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 text-gray-400">
              Контактных лиц не найдено.
            </div>
          ) : (
            <>
              {contactViewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContacts.map(cont => {`;

content = content.replace(oldContactsGrid, newContactsGrid);

// 10. Contacts Grid - End
const oldContactsEnd = `                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB: SEGMENTS (Списки и сегментация клиентов) */}`;

const newContactsEnd = `                  </div>
                );
              })}
            </div>
            )}
            
            {contactViewMode === 'list' && (
              <div className="flex flex-col gap-3">
                {filteredContacts.map(cont => {
                  return (
                    <div key={cont.id} className={\`bg-white rounded-xl border p-4 transition-all hover:shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 \${cont.isDecisionMaker ? 'border-amber-200 bg-amber-50/20' : 'border-gray-200 hover:border-blue-300'}\`}>
                      <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 onClick={() => onOpenContactModal(cont)} className="text-sm font-bold text-gray-900 hover:text-blue-600 cursor-pointer truncate">
                              {cont.fullName}
                            </h3>
                            {cont.isDecisionMaker && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-0.5 shrink-0">
                                <Star className="w-3 h-3 fill-current text-amber-500" /> ЛПР
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-gray-600">{cont.position}</div>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-blue-800 font-medium bg-blue-50/50 w-fit px-2 py-0.5 rounded-md border border-blue-100">
                            <Building2 className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="truncate">{cont.companyName}</span>
                          </div>
                        </div>
                        
                        <div className="hidden md:block flex-1 text-xs text-gray-600 space-y-1">
                           {cont.mobilePhone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-emerald-500 shrink-0"/> {cont.mobilePhone} (моб.)</div>}
                           {cont.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-blue-500 shrink-0"/> {cont.email}</div>}
                        </div>
                        
                        <div className="hidden md:block flex-1 text-xs text-gray-500 text-center">
                           Взаимодействий: <span className="font-bold text-gray-700">{cont.interactionHistory?.length || 0}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => onOpenTaskModal(undefined, cont.companyId, cont.id)} className="p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100" title="Задача"><CheckSquare className="w-4 h-4" /></button>
                        <button onClick={() => onOpenContactModal(cont)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm(\`Удалить контакт «\${cont.fullName}»?\`)) onDeleteContact(cont.id); }} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {contactViewMode === 'table' && (
              <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">ФИО / Роль</th>
                      <th className="px-4 py-3">Предприятие</th>
                      <th className="px-4 py-3">Должность</th>
                      <th className="px-4 py-3">Контакты</th>
                      <th className="px-4 py-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredContacts.map(cont => {
                      return (
                        <tr key={cont.id} className={\`hover:bg-blue-50/30 transition-colors \${cont.isDecisionMaker ? 'bg-amber-50/10' : ''}\`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => onOpenContactModal(cont)}>{cont.fullName}</span>
                              {cont.isDecisionMaker && <Star className="w-3 h-3 text-amber-500 fill-current" title="ЛПР" />}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-blue-800">{cont.companyName}</td>
                          <td className="px-4 py-3 text-gray-600">{cont.position}</td>
                          <td className="px-4 py-3 text-gray-600 space-y-0.5 text-[11px]">
                            {cont.mobilePhone && <div className="flex items-center gap-1"><Phone className="w-2.5 h-2.5 text-emerald-500" /> {cont.mobilePhone}</div>}
                            {cont.email && <div className="flex items-center gap-1"><Mail className="w-2.5 h-2.5 text-blue-500" /> {cont.email}</div>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => onOpenTaskModal(undefined, cont.companyId, cont.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Задача"><CheckSquare className="w-3.5 h-3.5" /></button>
                              <button onClick={() => onOpenContactModal(cont)} className="p-1 text-gray-400 hover:text-blue-600 rounded"><Edit3 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            </>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TAB: SEGMENTS (Списки и сегментация клиентов) */}`;

content = content.replace(oldContactsEnd, newContactsEnd);

fs.writeFileSync('src/components/crm/ContactCenterView.tsx', content);
