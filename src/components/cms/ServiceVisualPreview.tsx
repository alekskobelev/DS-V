import React, { useState } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Eye, 
  Check, 
  Wrench, 
  Calculator, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Award,
  Phone,
  Mail,
  MapPin,
  UserCheck
} from 'lucide-react';
import { ServiceItem, ServiceContact } from '../../types';

interface ServicePreviewData extends Partial<ServiceItem> {
  category?: string;
  price?: string;
  unit?: string;
  benefits?: string[];
  equipmentList?: string[];
}

interface ServiceVisualPreviewProps {
  service: ServicePreviewData;
  viewMode?: 'split' | 'editor' | 'preview';
}

export const ServiceVisualPreview: React.FC<ServiceVisualPreviewProps> = ({
  service,
  viewMode = 'split'
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [viewType, setViewType] = useState<'card' | 'detail'>('card');

  const title = service.title || 'Название инженерной услуги';
  const category = service.category || 'Метрологический контроль и реверс-инжиниринг';
  const price = service.price || service.basePriceText || 'от 15 000 ₽';
  const unit = service.unit || 'за деталь';
  const shortDesc = service.shortDesc || 'Краткое описание технологической услуги...';
  const fullDesc = service.fullDesc || shortDesc;
  const image = service.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
  const deliverables = Array.isArray(service.deliverables) ? service.deliverables : [];
  const benefits = Array.isArray(service.benefits) ? service.benefits : [];
  const equipmentUsed = Array.isArray(service.equipmentUsed) ? service.equipmentUsed : [];
  const contacts = Array.isArray(service.contacts) ? service.contacts : [];
  const responsiblePerson = service.responsiblePerson || '';
  const slaResponseTime = service.slaResponseTime || '';
  const workLocationNote = service.workLocationNote || '';

  return (
    <div className="w-full bg-slate-900/5 rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
      {/* Top Preview Control Bar */}
      <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live-предпросмотр услуги
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
            {category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Card / Detail Switcher */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewType('card')}
              className={`px-4 py-1 rounded-md transition-all font-medium ${
                viewType === 'card'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Вид в каталоге услуг
            </button>
            <button
              type="button"
              onClick={() => setViewType('detail')}
              className={`px-4 py-1 rounded-md transition-all font-medium ${
                viewType === 'detail'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Полное описание
            </button>
          </div>

          {/* Desktop / Mobile Switcher */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              title="ПК вид"
              className={`p-1.5 rounded-md transition-all ${
                viewport === 'desktop' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              title="Мобильный вид"
              className={`p-1.5 rounded-md transition-all ${
                viewport === 'mobile' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Frame Container */}
      <div className="p-4 sm:p-6 bg-slate-100 flex justify-center items-start min-h-[420px] overflow-auto">
        <div
          className={`transition-all duration-300 w-full ${
            viewport === 'mobile'
              ? 'max-w-[390px] bg-white rounded-[32px] p-4 shadow-sm border-4 border-slate-800 min-h-[640px]'
              : 'max-w-4xl bg-white rounded-xl p-6 shadow-md border border-slate-200'
          }`}
        >
          {viewType === 'card' ? (
            /* SERVICE CARD VIEW */
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all flex flex-col max-w-md mx-auto">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 mb-4">
                <img
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded shadow-sm">
                  {category}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                {title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                {shortDesc}
              </p>

              {deliverables.length > 0 && (
                <div className="mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Что получает заказчик:
                  </span>
                  <div className="space-y-1">
                    {deliverables.slice(0, 3).map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Базовая стоимость</span>
                  <span className="text-sm font-bold text-slate-900">
                    {price} <span className="text-[11px] font-normal text-slate-500">{unit}</span>
                  </span>
                </div>
                <button
                  type="button"
                  className="px-4.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  Заказать услугу
                </button>
              </div>
            </div>
          ) : (
            /* FULL SERVICE DETAIL VIEW */
            <div className="space-y-6 text-slate-800">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span>Услуги</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{category}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-slate-900 font-medium truncate">{title}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                      {category}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">{title}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Стоимость работ</span>
                    <span className="text-lg sm:text-xl font-extrabold text-blue-700">
                      {price} <span className="text-xs font-normal text-slate-500">{unit}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Hero Banner */}
              <div className="relative aspect-[21/9] rounded-xl overflow-hidden shadow-inner bg-slate-900">
                <img src={image} alt={title} className="w-full h-full object-cover opacity-85" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4 sm:p-6">
                  <div className="text-white">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600/80 text-xs font-semibold mb-2">
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      ГОСТ Р ИСО 9001-2015
                    </div>
                    <h3 className="text-base sm:text-xl font-bold">{title}</h3>
                  </div>
                </div>
              </div>

              {/* Full Description */}
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-500 leading-relaxed">
                <p>{fullDesc}</p>
              </div>

              {/* Deliverables & Benefits Grid */}
              <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {deliverables.length > 0 && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Результат для заказчика
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {benefits.length > 0 && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      Преимущества и гарантии
                    </h4>
                    <ul className="space-y-1.5 text-xs text-blue-900">
                      {benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Equipment Used Section */}
              {equipmentUsed.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-amber-500" />
                    Применяемое оборудование и программные комплексы
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {equipmentUsed.map((eq, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-medium rounded-lg shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsible Contacts & SLA */}
              {(contacts.length > 0 || responsiblePerson || slaResponseTime || workLocationNote) && (
                <div className="bg-gradient-to-br from-blue-50/60 to-slate-50 p-4 rounded-xl border border-blue-100 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2">
                    <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      Ответственные инженеры и контакты по услуге
                    </h4>
                    {slaResponseTime && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3 text-blue-600" />
                        {slaResponseTime}
                      </span>
                    )}
                  </div>

                  {workLocationNote && (
                    <div className="flex items-start gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{workLocationNote}</span>
                    </div>
                  )}

                  {contacts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {contacts.map((c, i) => (
                        <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                          <div className="font-bold text-xs text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-500">{c.role}</div>
                          <div className="flex items-center gap-3 pt-1 text-[11px]">
                            {c.phone && (
                              <span className="flex items-center gap-1 text-blue-600 font-semibold">
                                <Phone className="w-3 h-3" />
                                {c.phone}
                              </span>
                            )}
                            {c.email && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Mail className="w-3 h-3" />
                                {c.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : responsiblePerson ? (
                    <div className="text-xs text-slate-700 font-medium bg-white p-2.5 rounded-lg border border-slate-200">
                      Ведущий специалист: <strong>{responsiblePerson}</strong>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Action Bar */}
              <div className="p-4 bg-slate-900 rounded-xl text-white flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Готовы рассчитать точную стоимость?</div>
                  <div className="text-[11px] text-slate-400">Инженер подготовит смету по вашей CAD-модели или чертежу</div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Заказать услугу
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Calculator className="w-3.5 h-3.5 text-amber-400" />
                    В калькулятор
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
