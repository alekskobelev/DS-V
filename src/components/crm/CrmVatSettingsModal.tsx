import React, { useState } from 'react';
import { 
  X, 
  Percent, 
  HelpCircle, 
  Save, 
  RotateCcw, 
  Globe2, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CrmVatSettingsModalProps {
  onClose: () => void;
}

export const CrmVatSettingsModal: React.FC<CrmVatSettingsModalProps> = ({ onClose }) => {
  const { crmSettings, updateCrmSettings, showToast } = useApp();

  const [defaultVatRate, setDefaultVatRate] = useState<number>(crmSettings?.defaultVatRate ?? 22);
  const [allowVatOverride, setAllowVatOverride] = useState<boolean>(crmSettings?.allowVatOverride ?? true);
  const [neighboringCountriesVatZero, setNeighboringCountriesVatZero] = useState<boolean>(
    crmSettings?.neighboringCountriesVatZero ?? true
  );
  const [isSaving, setIsSaving] = useState(false);

  const presets = [
    { rate: 22, label: '22% (Стандарт РФ)', desc: 'Основная базовая ставка НДС в РФ', badge: 'Действующая' },
    { rate: 0, label: '0% (Экспорт / ЕАЭС)', desc: 'Для заказчиков из Беларуси, Казахстана и др.', badge: 'ВЭД / Экспорт' },
    { rate: 10, label: '10% (Льготная)', desc: 'Медицинские и отдельные научные изделия', badge: 'Льгота' },
    { rate: 20, label: '20% (Архивная РФ)', desc: 'Прежняя ставка РФ до реформы', badge: 'Архив' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCrmSettings({
        defaultVatRate: Number(defaultVatRate) || 0,
        allowVatOverride,
        neighboringCountriesVatZero
      });
      showToast(`Настройки НДС сохранены: базовая ставка ${defaultVatRate}%`);
      onClose();
    } catch (e) {
      showToast('Ошибка сохранения настроек НДС');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setDefaultVatRate(22);
    setAllowVatOverride(true);
    setNeighboringCountriesVatZero(true);
    showToast('Параметры сброшены к нормативу: 22% (РФ) и 0% (Экспорт/ЕАЭС)');
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Настройки ставки НДС и налогообложения
                </h3>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  Базовая ставка: {defaultVatRate}%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Глобальные параметры расчета налога для сделок CRM, калькулятора и коммерческих предложений (ТКП)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* Regulatory Highlights Alert */}
          <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
            <div className="flex items-center gap-2 text-blue-950 dark:text-blue-200 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Нормативная база налогообложения ООО «ДС-Инжиниринг»</span>
            </div>
            <p className="text-xs text-blue-900/90 dark:text-blue-300/90 leading-relaxed">
              <strong>Текущая правильная ставка НДС в РФ — 22%.</strong> При продаже контрольно-измерительного оборудования, координатно-измерительных машин, 3D-сканеров, ПО PolyWorks и инжиниринговых услуг на территории РФ применяется ставка 22%.
            </p>
            <p className="text-xs text-blue-900/90 dark:text-blue-300/90 leading-relaxed">
              <strong>Нулевая ставка 0% при экспорте в соседние страны:</strong> При реализации оборудования или услуг в государства-члены ЕАЭС (Беларусь, Казахстан, Армения, Кыргызстан) и страны ближнего зарубежья (Узбекистан и др.) налог на добавленную стоимость рассчитывается по ставке <strong>0%</strong> (ст. 164 НК РФ, Протокол о порядке взимания косвенных налогов в ЕАЭС).
            </p>
          </div>

          {/* Base VAT Rate Field */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Базовая ставка НДС компании (%):
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-[220px]">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={defaultVatRate}
                  onChange={(e) => setDefaultVatRate(Number(e.target.value))}
                  className="w-full h-11 pl-4 pr-10 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <Percent className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <div className="text-xs text-slate-500">
                Используется по умолчанию для новых сделок, расчетов в калькуляторе и формируемых ТКП
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Быстрый выбор типовой ставки:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {presets.map((p) => {
                  const isSelected = defaultVatRate === p.rate;
                  return (
                    <button
                      key={p.rate}
                      type="button"
                      onClick={() => setDefaultVatRate(p.rate)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>{p.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            p.rate === 22 
                              ? 'bg-blue-600 text-white' 
                              : p.rate === 0 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {p.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {p.desc}
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                        isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Automation Rules */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Правила автоматизации и гибкости:
            </label>

            <div className="space-y-2.5">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={neighboringCountriesVatZero}
                  onChange={(e) => setNeighboringCountriesVatZero(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Автоматически предлагать ставку 0% для клиентов из соседних стран и ЕАЭС</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    При указании страны заказчика «Казахстан», «Беларусь», «Узбекистан», «Армения» или «Кыргызстан» система сразу переключит расчет на экспортную ставку 0% НДС с соответствующей ссылкой на ст. 164 НК РФ.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={allowVatOverride}
                  onChange={(e) => setAllowVatOverride(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Разрешить менеджерам менять ставку НДС в карточке конкретной сделки и ТКП</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Менеджеры смогут на вкладке спецификации сделки и в генераторе ТКП выбирать индивидуальный режим: 22%, 0% (Экспорт), Без НДС (УСН) или вводить произвольную ставку.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить к 22%</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-lg shadow-sm shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Сохранение...' : 'Сохранить настройки'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
