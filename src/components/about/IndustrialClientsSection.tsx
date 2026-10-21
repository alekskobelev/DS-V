import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Plane, 
  Car, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  Award, 
  ArrowRight,
  CheckCircle2,
  Factory
} from 'lucide-react';
import { INDUSTRIAL_CLIENTS_DATA, type IndustrialClient } from '../../data/industrialClientsData';
import { useApp } from '../../context/AppContext';

export const IndustrialClientsSection: React.FC = () => {
  const { openContactModal } = useApp();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredClients = useMemo(() => {
    return INDUSTRIAL_CLIENTS_DATA.filter((client) => {
      const matchesIndustry = selectedIndustry === 'all' || client.industry === selectedIndustry;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        client.name.toLowerCase().includes(q) ||
        client.shortName.toLowerCase().includes(q) ||
        client.city.toLowerCase().includes(q) ||
        client.scope.toLowerCase().includes(q) ||
        (client.notableProjects && client.notableProjects.toLowerCase().includes(q));
      return matchesIndustry && matchesSearch;
    });
  }, [selectedIndustry, searchQuery]);

  const categories = [
    { id: 'all', label: 'Все предприятия', count: INDUSTRIAL_CLIENTS_DATA.length, icon: Factory },
    { id: 'aerospace', label: 'Авиация и Космос', count: INDUSTRIAL_CLIENTS_DATA.filter(c => c.industry === 'aerospace').length, icon: Plane },
    { id: 'automotive', label: 'Автомобилестроение', count: INDUSTRIAL_CLIENTS_DATA.filter(c => c.industry === 'automotive').length, icon: Car },
    { id: 'heavy_machinery', label: 'Тяжелое машиностроение', count: INDUSTRIAL_CLIENTS_DATA.filter(c => c.industry === 'heavy_machinery').length, icon: Cpu },
    { id: 'energy_defense', label: 'Энергетика, ТЭК и ОПК', count: INDUSTRIAL_CLIENTS_DATA.filter(c => c.industry === 'energy_defense').length, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-200/80 dark:border-blue-800 mb-2 shadow-xs">
            <Factory className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Индустриальные заказчики и партнеры</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Предприятия, доверяющие «ДС-Инжиниринг»
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Флагманы авиастроения, ракетостроения, автомобилестроения и тяжелого машиностроения России, с которыми компания успешно реализует технологические и метрологические проекты с 1995 года.
          </p>
        </div>

        {/* Quick summary pill */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shrink-0">
          <div className="text-right">
            <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400 font-mono leading-none">20+</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">промышленных гигантов</div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
          <div className="text-right">
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono leading-none">30+</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">лет надежного партнерства</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedIndustry === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedIndustry(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или городу..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Grid of Industrial Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white dark:bg-slate-900/90 rounded-xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header with Monogram and City */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center shrink-0 font-mono tracking-tighter">
                    {client.logoMonogram}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={client.name}>
                      {client.shortName}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                      <span>{client.city}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 shrink-0">
                  {client.badge}
                </span>
              </div>

              {/* Full Legal Name */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-1" title={client.name}>
                {client.name}
              </div>

              {/* Scope of Cooperation */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block text-[11px] mb-0.5">Направления сотрудничества:</strong>
                {client.scope}
              </div>

              {/* Notable Projects */}
              {client.notableProjects && (
                <div className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Проекты:</strong> {client.notableProjects}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {client.industryLabel}
              </span>
              <button
                type="button"
                onClick={() => openContactModal({ 
                  title: `Консультация по инженерным решениям для предприятия (${client.shortName})`, 
                  formType: 'consultation' 
                })}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer text-xs"
              >
                <span>Обсудить задачу</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Factory className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Предприятия не найдены</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Попробуйте изменить поисковый запрос или выбрать другую отрасль.</p>
        </div>
      )}

      {/* Cooperation CTA banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-base sm:text-lg font-bold">
            Готовы решать технологические задачи вашего производства
          </h3>
          <p className="text-xs text-blue-200 max-w-2xl leading-relaxed">
            Разработка постпроцессоров, поставка и модернизация КИМ, внедрение САПР TopSolid 7, 3D-контроль геометрии и реверс-инжиниринг со строгим соблюдением стандартов качества и конфиденциальности (NDA).
          </p>
        </div>
        <button
          type="button"
          onClick={() => openContactModal({ title: 'Запрос коммерческого предложения для предприятия', formType: 'quote' })}
          className="px-5 py-2.5 bg-white text-blue-950 hover:bg-blue-50 font-bold rounded-xl text-xs sm:text-sm shrink-0 shadow-xs transition-colors cursor-pointer"
        >
          Запросить сотрудничество
        </button>
      </div>
    </div>
  );
};

export default IndustrialClientsSection;
