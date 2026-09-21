const fs = require('fs');

let content = fs.readFileSync('src/components/crm/ContactCenterView.tsx', 'utf-8');

// The replacement for the bottom buttons in the Company cards.
// Currently: <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-1">...</div>
const oldButtons = `<div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenTaskModal(undefined, comp.id)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Поставить задачу по контрагенту в 1 клик"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>+ Задача</span>
                        </button>
                        <button
                          onClick={() => onOpenEventModal(comp.id)}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Назначить звонок/встречу в календаре в 1 клик"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>+ В календарь</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenCompanyModal(comp)}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100"
                          title="Редактировать компанию"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(\`Удалить предприятие «\${comp.name}»?\`)) {
                              onDeleteCompany(comp.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                          title="Удалить предприятие"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>`;

const newButtons = `<div className="pt-3 mt-auto border-t border-gray-100 grid grid-cols-4 gap-1">
                        <button
                          onClick={() => onOpenTaskModal(undefined, comp.id)}
                          className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          title="Задача"
                        >
                          <CheckSquare className="w-4 h-4 mb-0.5" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Задача</span>
                        </button>
                        <button
                          onClick={() => onOpenEventModal(comp.id)}
                          className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                          title="В календарь"
                        >
                          <Calendar className="w-4 h-4 mb-0.5" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Календарь</span>
                        </button>
                        <button
                          onClick={() => onOpenCompanyModal(comp)}
                          className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Изменить"
                        >
                          <Edit3 className="w-4 h-4 mb-0.5" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Изменить</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(\`Удалить предприятие «\${comp.name}»?\`)) {
                              onDeleteCompany(comp.id);
                            }
                          }}
                          className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 mb-0.5" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Удалить</span>
                        </button>
                    </div>`;

content = content.replace(oldButtons, newButtons);

// Make the same change to the contact cards! Let's find it.
const oldContactButtons = `<div className="pt-3 mt-auto border-t border-gray-100 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenTaskModal(undefined, cont.companyId, cont.id)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Поставить задачу по контакту"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>+ Задача</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenContactModal(cont)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                          title="Редактировать контакт"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(\`Удалить контакт «\${cont.fullName}»?\`)) {
                              onDeleteContact(cont.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                          title="Удалить контакт"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>`;

const newContactButtons = `<div className="pt-3 mt-auto border-t border-gray-100 grid grid-cols-3 gap-1">
                        <button
                          onClick={() => onOpenTaskModal(undefined, cont.companyId, cont.id)}
                          className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          title="Задача"
                        >
                          <CheckSquare className="w-4 h-4 mb-0.5" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Задача</span>
                        </button>
                        <button
                          onClick={() => onOpenContactModal(cont)}
                          className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Изменить"
                        >
                          <Edit3 className="w-4 h-4 mb-0.5" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Изменить</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(\`Удалить контакт «\${cont.fullName}»?\`)) {
                              onDeleteContact(cont.id);
                            }
                          }}
                          className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 mb-0.5" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Удалить</span>
                        </button>
                    </div>`;

content = content.replace(oldContactButtons, newContactButtons);
fs.writeFileSync('src/components/crm/ContactCenterView.tsx', content);
