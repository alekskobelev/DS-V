import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Gauge, 
  TrendingUp, 
  Calculator, 
  CheckCircle2, 
  RefreshCw, 
  Save, 
  Target, 
  ShieldCheck, 
  Info, 
  DollarSign, 
  Wrench, 
  Cpu, 
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  Box,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Layers,
  Zap,
  Thermometer,
  Scan,
  Maximize2
} from 'lucide-react';
import { fetchWithCsrf } from '../../services/csrfService';
import { 
  ConfiguratorsGlobalSettings, 
  DEFAULT_CONFIGURATOR_SETTINGS, 
  DEFAULT_SI_CATEGORIES, 
  SiEquipmentCategoryConfig 
} from '../../hooks/useConfiguratorSettings';

export const CmsConfiguratorsTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'metrology' | 'roi' | 'services'>('metrology');
  const [settings, setSettings] = useState<ConfiguratorsGlobalSettings>(DEFAULT_CONFIGURATOR_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load saved settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetchWithCsrf('/api/cms/store/configurators_settings');
      if (res.ok) {
        const json = await res.json();
        const raw = json?.value || json?.data || json;
        if (raw && raw.metrology) {
          setSettings({
            metrology: { 
              ...DEFAULT_CONFIGURATOR_SETTINGS.metrology, 
              ...raw.metrology,
              categories: Array.isArray(raw.metrology?.categories) && raw.metrology.categories.length > 0
                ? raw.metrology.categories
                : DEFAULT_SI_CATEGORIES
            },
            roi: { ...DEFAULT_CONFIGURATOR_SETTINGS.roi, ...raw.roi },
            services: { ...DEFAULT_CONFIGURATOR_SETTINGS.services, ...raw.services },
            updatedAt: raw.updatedAt,
            updatedBy: raw.updatedBy
          });
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load configurator settings from API, checking local storage', err);
    }

    // LocalStorage fallback
    const local = localStorage.getItem('ds_configurator_settings');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        setSettings({
          metrology: { 
            ...DEFAULT_CONFIGURATOR_SETTINGS.metrology, 
            ...parsed.metrology,
            categories: Array.isArray(parsed.metrology?.categories) && parsed.metrology.categories.length > 0
              ? parsed.metrology.categories
              : DEFAULT_SI_CATEGORIES
          },
          roi: { ...DEFAULT_CONFIGURATOR_SETTINGS.roi, ...parsed.roi },
          services: { ...DEFAULT_CONFIGURATOR_SETTINGS.services, ...parsed.services }
        });
      } catch (e) {}
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    const updatedPayload: ConfiguratorsGlobalSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Администратор CMS'
    };

    try {
      localStorage.setItem('ds_configurator_settings', JSON.stringify(updatedPayload));
      const res = await fetchWithCsrf('/api/cms/store/configurators_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'configurators_settings', value: updatedPayload })
      });

      if (res.ok) {
        setSaveStatus('🟢 Настройки конфигураторов успешно сохранены в СУБД PostgreSQL!');
      } else {
        setSaveStatus('🟢 Настройки успешно сохранены в локальное хранилище браузера.');
      }
      setSettings(updatedPayload);
    } catch (err: any) {
      console.error('Save settings error:', err);
      setSaveStatus('🟢 Настройки сохранены локально.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Сбросить все параметры конфигураторов к инженерным стандартам ГОСТ по умолчанию?')) {
      setSettings(DEFAULT_CONFIGURATOR_SETTINGS);
      localStorage.removeItem('ds_configurator_settings');
      setSaveStatus('🟢 Восстановлены стандарты ГОСТ по умолчанию.');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Category management handlers
  const handleToggleCategory = (index: number) => {
    const updated = [...settings.metrology.categories];
    updated[index].enabled = !updated[index].enabled;
    setSettings({
      ...settings,
      metrology: { ...settings.metrology, categories: updated }
    });
  };

  const handleUpdateCategory = (index: number, patch: Partial<SiEquipmentCategoryConfig>) => {
    const updated = [...settings.metrology.categories];
    updated[index] = { ...updated[index], ...patch };
    setSettings({
      ...settings,
      metrology: { ...settings.metrology, categories: updated }
    });
  };

  const handleDeleteCategory = (index: number) => {
    if (settings.metrology.categories.length <= 1) {
      alert('В конфигураторе должна оставаться хотя бы одна категория СИ.');
      return;
    }
    const cat = settings.metrology.categories[index];
    if (window.confirm(`Удалить категорию СИ «${cat.name}»?`)) {
      const updated = settings.metrology.categories.filter((_, i) => i !== index);
      setSettings({
        ...settings,
        metrology: { ...settings.metrology, categories: updated }
      });
    }
  };

  const handleAddCategory = () => {
    const newId = `custom_si_${Date.now()}`;
    const newCategory: SiEquipmentCategoryConfig = {
      id: newId,
      name: 'Новая категория средств измерений (СИ)',
      category: 'Специализированные измерительные системы',
      brand: 'Российский производитель / ГОСТ',
      enabled: true,
      accuracyFormula: 'MPE = 5.0 + L / 200 мкм',
      mpeUm: 15,
      capexRub: 5000000,
      manualInspectionTimeMin: 45,
      autoInspectionTimeMin: 12,
      scrapReductionPercent: 60,
      cncDowntimeReductionHoursPerMonth: 20,
      annualMaintenancePercent: 4.0
    };
    setSettings({
      ...settings,
      metrology: {
        ...settings.metrology,
        categories: [...settings.metrology.categories, newCategory]
      }
    });
  };

  const handleResetCategories = () => {
    if (window.confirm('Сбросить список категорий СИ и их коэффициенты окупаемости к заводским стандартам?')) {
      setSettings({
        ...settings,
        metrology: {
          ...settings.metrology,
          categories: DEFAULT_SI_CATEGORIES
        }
      });
    }
  };

  // Dimensions math preview
  const length = settings.metrology.defaultLengthMm || 450;
  const width = settings.metrology.defaultWidthMm || 320;
  const height = settings.metrology.defaultHeightMm || 180;
  const weight = settings.metrology.defaultWeightKg || 25;
  const diagonalMm = Math.round(Math.sqrt(length * length + width * width + height * height));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Управление алгоритмами и расчетами</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Настройки конфигураторов и калькуляторов
          </h2>
          <p className="text-xs text-blue-200 mt-1 max-w-2xl">
            Централизованное управление параметрами Метрологического конфигуратора СИ (габариты детали по умолчанию, доступные категории оборудования, технические коэффициенты ROI), B2B-калькулятора окупаемости, тарифов 3D-сканирования и ставок НДС.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Сброс ГОСТ</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Сохранение...' : 'Сохранить настройки'}</span>
          </button>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'metrology', label: '1. Метрологический конфигуратор СИ', icon: Gauge, badge: 'Габариты, СИ & ROI' },
          { id: 'roi', label: '2. B2B ROI Калькулятор', icon: TrendingUp, badge: 'Окупаемость' },
          { id: 'services', label: '3. Калькуляторы Услуг и НДС', icon: Calculator, badge: 'Расчет смет' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
              activeSection === tab.id
                ? 'bg-blue-900 text-white border-blue-900 shadow-xs ring-2 ring-blue-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeSection === tab.id ? 'text-amber-400' : 'text-blue-600'}`} />
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              activeSection === tab.id ? 'bg-blue-800 text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
            }`}>
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* SECTION 1: METROLOGY CONFIGURATOR SETTINGS */}
      {activeSection === 'metrology' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* BLOCK 1: DEFAULT PART DIMENSIONS AND PROPERTIES */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Box className="w-4 h-4 text-blue-600" />
                  <span>1. Габариты и параметры заготовки по умолчанию</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Устанавливает стартовые размеры, массу, тип детали и среду при открытии Метрологического конфигуратора СИ.
                </p>
              </div>

              {/* Geometry Preview Badge */}
              <div className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold text-blue-900 dark:text-blue-200 shrink-0">
                Габариты: {length}×{width}×{height} мм • {weight} кг (Диагональ: {diagonalMm} мм)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-white">Длина по умолчанию (X):</span>
                  <span className="font-mono text-blue-600">{length} мм</span>
                </div>
                <input
                  type="number"
                  min={10}
                  max={10000}
                  value={length}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, defaultLengthMm: Math.max(1, Number(e.target.value)) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 block">От 10 мм до 10 000 мм</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-white">Ширина по умолчанию (Y):</span>
                  <span className="font-mono text-blue-600">{width} мм</span>
                </div>
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={width}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, defaultWidthMm: Math.max(1, Number(e.target.value)) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 block">От 10 мм до 5 000 мм</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-white">Высота по умолчанию (Z):</span>
                  <span className="font-mono text-blue-600">{height} мм</span>
                </div>
                <input
                  type="number"
                  min={5}
                  max={3000}
                  value={height}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, defaultHeightMm: Math.max(1, Number(e.target.value)) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 block">От 5 мм до 3 000 мм</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-white">Масса заготовки (M):</span>
                  <span className="font-mono text-blue-600">{weight} кг</span>
                </div>
                <input
                  type="number"
                  min={0.1}
                  step={0.5}
                  max={10000}
                  value={weight}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, defaultWeightKg: Math.max(0.1, Number(e.target.value)) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 block">Влияет на предел нагрузки стола КИМ</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Тип детали по умолчанию:</label>
                <select
                  value={settings.metrology.defaultPartType || 'housing'}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, defaultPartType: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="housing">Корпусная деталь / Картер (housing)</option>
                  <option value="mold_die">Пресс-форма / Штамп (mold_die)</option>
                  <option value="impeller_blade">Крыльчатка / Лопаточный венец (impeller_blade)</option>
                  <option value="frame_weldment">Сварная рама / Станина (frame_weldment)</option>
                  <option value="sheet_metal">Листовая штамповка (sheet_metal)</option>
                  <option value="tooling_shaft">Ступенчатый вал / Шпиндель (tooling_shaft)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Свойства поверхности по умолчанию:</label>
                <select
                  value={settings.metrology.defaultSurfaceType || 'machined_matte'}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, defaultSurfaceType: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="machined_matte">Матовый металл (без бликов)</option>
                  <option value="mirror_glossy">Зеркальный полированный хром</option>
                  <option value="dark_carbon">Черный углепластик / Композит</option>
                  <option value="transparent">Полупрозрачный полимер / Стекло</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Производственная среда по умолчанию:</label>
                <select
                  value={settings.metrology.defaultWorkshopEnvironment || 'shop_floor'}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, defaultWorkshopEnvironment: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="metrology_lab">ЦЗЛ (Лаборатория 20 ± 0.5 °C)</option>
                  <option value="shop_floor">Цеховой участок (Мехобработка)</option>
                  <option value="on_machine">Непосредственно на станке ЧПУ</option>
                  <option value="onsite_field">Выездной контроль на объекте заказчика</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Плотность сканирования по умолчанию:</label>
                <select
                  value={settings.metrology.defaultScanDensityNeed || 'full_colormap'}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, defaultScanDensityNeed: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="inspection_points">Контроль дискретных точек и баз щупом</option>
                  <option value="full_colormap">Сплошная цветовая карта GD&T</option>
                  <option value="both">Комбинированный (Щуп + 3D-скан)</option>
                </select>
              </div>
            </div>
          </div>

          {/* BLOCK 2: PRECISION QUALITIES AND TOLERANCE PRESETS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>2. Настройка квалитетов точности и допусков чертежа (мкм)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Кванты точности задают базовые поля допусков в микронах (± мкм) для экспресс-кнопок пресетов IT5–IT12 в Конфигураторе СИ.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-white">Прецизионный IT5:</span>
                  <span className="font-mono text-blue-600">±{settings.metrology.it5Um} мкм</span>
                </div>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={settings.metrology.it5Um}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, it5Um: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 block">Шейки валов, подшипники</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-white">Высокоточный IT7:</span>
                  <span className="font-mono text-blue-600">±{settings.metrology.it7Um} мкм</span>
                </div>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={settings.metrology.it7Um}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, it7Um: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 block">Пресс-формы, гидравлика</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-white">Машиностроение IT9:</span>
                  <span className="font-mono text-blue-600">±{settings.metrology.it9Um} мкм</span>
                </div>
                <input
                  type="number"
                  min={20}
                  max={100}
                  value={settings.metrology.it9Um}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, it9Um: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 block">Корпуса, ЧПУ фрезеровка</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-white">Свободный IT12:</span>
                  <span className="font-mono text-blue-600">±{settings.metrology.it12Um} мкм</span>
                </div>
                <input
                  type="number"
                  min={50}
                  max={500}
                  value={settings.metrology.it12Um}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, it12Um: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 block">Литье, сварные рамы</span>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Threshold Ratios */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>3. Пороги запаса точности (Правило РМГ 29 / ГОСТ)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Соотношение T / MPE, где T — допуск детали, MPE — предел допустимой погрешности измерительного прибора.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  <span>Оптимальный коэффициент запаса (ГОСТ):</span>
                  <span className="font-mono font-black text-lg text-emerald-600">{settings.metrology.optimalReserveRatio}×</span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={5.0}
                  step={0.1}
                  value={settings.metrology.optimalReserveRatio}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, optimalReserveRatio: Number(e.target.value) }
                  })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block">
                  При коэффициенте &ge; {settings.metrology.optimalReserveRatio}× статус «Оптимально по ГОСТ»
                </span>
              </div>

              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-amber-900 dark:text-amber-200">
                  <span>Допустимый порог (Цеховой контроль):</span>
                  <span className="font-mono font-black text-lg text-amber-600">{settings.metrology.acceptableReserveRatio}×</span>
                </div>
                <input
                  type="range"
                  min={1.1}
                  max={2.9}
                  step={0.1}
                  value={settings.metrology.acceptableReserveRatio}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, acceptableReserveRatio: Number(e.target.value) }
                  })}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 block">
                  При коэффициенте от {settings.metrology.acceptableReserveRatio}× до {settings.metrology.optimalReserveRatio}× статус «Допустимо для цеха»
                </span>
              </div>
            </div>
          </div>

          {/* BLOCK 3: AVAILABLE SI CATEGORIES & ROI TECHNICAL COEFFICIENTS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  <span>4. Доступные категории средств измерений (СИ) и технические коэффициенты ROI</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Настройка физических параметров оборудования, доступности в подборе Конфигуратора СИ и формул экономической эффективности (время контроля, снижения брака, CAPEX).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCategories}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Сбросить к стандарту</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Добавить категорию СИ</span>
                </button>
              </div>
            </div>

            {/* List of SI Category Cards */}
            <div className="space-y-4">
              {settings.metrology.categories.map((cat, idx) => {
                const speedupRatio = cat.manualInspectionTimeMin > 0 && cat.autoInspectionTimeMin > 0
                  ? (cat.manualInspectionTimeMin / cat.autoInspectionTimeMin).toFixed(1)
                  : '1.0';

                return (
                  <div
                    key={cat.id || idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      cat.enabled
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 shadow-xs'
                        : 'bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    {/* Category Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700/80">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleCategory(idx)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            cat.enabled
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {cat.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{cat.enabled ? 'Активна в конфигураторе' : 'Отключена'}</span>
                        </button>
                        <span className="text-xs font-mono font-bold text-slate-400">ID: {cat.id}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Live Efficiency Metric Badge */}
                        <div className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950/60 rounded-md text-[11px] font-mono font-bold text-blue-800 dark:text-blue-300">
                          Ускорение контроля: <span className="text-emerald-600 dark:text-emerald-400">{speedupRatio}×</span> • Брак: -{cat.scrapReductionPercent}%
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                          title="Удалить категорию"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Category Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4">
                      {/* Left: General Equipment Info (5 cols) */}
                      <div className="md:col-span-5 space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Наименование категории СИ:</label>
                          <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => handleUpdateCategory(idx, { name: e.target.value })}
                            className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Класс оборудования:</label>
                            <input
                              type="text"
                              value={cat.category}
                              onChange={(e) => handleUpdateCategory(idx, { category: e.target.value })}
                              className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Бренд / Производитель:</label>
                            <input
                              type="text"
                              value={cat.brand}
                              onChange={(e) => handleUpdateCategory(idx, { brand: e.target.value })}
                              className="w-full mt-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Паспортная формула погрешности MPE:</label>
                          <input
                            type="text"
                            value={cat.accuracyFormula}
                            onChange={(e) => handleUpdateCategory(idx, { accuracyFormula: e.target.value })}
                            className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-blue-600 dark:text-blue-400"
                          />
                        </div>
                      </div>

                      {/* Right: Technical Coefficients Affecting ROI (7 cols) */}
                      <div className="md:col-span-7 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Технические коэффициенты для расчета окупаемости (ROI):</span>
                          </span>
                          <span className="font-mono text-emerald-600">{(cat.capexRub / 1000000).toFixed(1)} млн ₽</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Инвестиции CAPEX (руб):</label>
                            <input
                              type="number"
                              step={100000}
                              value={cat.capexRub}
                              onChange={(e) => handleUpdateCategory(idx, { capexRub: Number(e.target.value) })}
                              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Ручной замер до СИ (мин):</label>
                            <input
                              type="number"
                              min={1}
                              value={cat.manualInspectionTimeMin}
                              onChange={(e) => handleUpdateCategory(idx, { manualInspectionTimeMin: Number(e.target.value) })}
                              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Замер на СИ (мин):</label>
                            <input
                              type="number"
                              min={1}
                              value={cat.autoInspectionTimeMin}
                              onChange={(e) => handleUpdateCategory(idx, { autoInspectionTimeMin: Number(e.target.value) })}
                              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Снижение брака (%):</label>
                            <input
                              type="number"
                              min={5}
                              max={99}
                              value={cat.scrapReductionPercent}
                              onChange={(e) => handleUpdateCategory(idx, { scrapReductionPercent: Number(e.target.value) })}
                              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Экономия ЧПУ (ч/мес):</label>
                            <input
                              type="number"
                              min={0}
                              value={cat.cncDowntimeReductionHoursPerMonth}
                              onChange={(e) => handleUpdateCategory(idx, { cncDowntimeReductionHoursPerMonth: Number(e.target.value) })}
                              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block">Сервис / ТО (%/год):</label>
                            <input
                              type="number"
                              step={0.5}
                              min={0}
                              max={20}
                              value={cat.annualMaintenancePercent}
                              onChange={(e) => handleUpdateCategory(idx, { annualMaintenancePercent: Number(e.target.value) })}
                              className="w-full mt-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Methodology texts */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>5. Шаблоны методик измерений в отчете СИ</span>
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Климатический регламент подготовки детали:</label>
                <textarea
                  rows={2}
                  value={settings.metrology.climateStandardText}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, climateStandardText: e.target.value }
                  })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Калибровка измерительных наконечников:</label>
                <textarea
                  rows={2}
                  value={settings.metrology.probeCalibrationText}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, probeCalibrationText: e.target.value }
                  })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Базирование 3-2-1 по чертежным базам:</label>
                <textarea
                  rows={2}
                  value={settings.metrology.datumAlignmentText}
                  onChange={(e) => setSettings({
                    ...settings,
                    metrology: { ...settings.metrology, datumAlignmentText: e.target.value }
                  })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ROI CALCULATOR SETTINGS */}
      {activeSection === 'roi' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>1. Финансово-экономические параметры (Брак, Ставки, Окупаемость)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Параметры финансового моделирования для B2B-калькулятора окупаемости СИ (ROI Calculator).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ставка сотрудника ОТК (руб/час):</label>
                <input
                  type="number"
                  step={50}
                  value={settings.roi.hourlyLaborRateRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    roi: { ...settings.roi, hourlyLaborRateRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">Включая ФОТ и налоги</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Базовый % брака без СИ (%):</label>
                <input
                  type="number"
                  step={0.5}
                  value={settings.roi.defaultScrapRatePercent}
                  onChange={(e) => setSettings({
                    ...settings,
                    roi: { ...settings.roi, defaultScrapRatePercent: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">Средний показатель цеха</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Целевое сокращение брака (%):</label>
                <input
                  type="number"
                  step={5}
                  value={settings.roi.scrapReductionTargetPercent}
                  onChange={(e) => setSettings({
                    ...settings,
                    roi: { ...settings.roi, scrapReductionTargetPercent: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">За счет оперативного контроля</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Себестоимость 1 бракованной детали (руб):</label>
                <input
                  type="number"
                  step={500}
                  value={settings.roi.defaultPartScrapCostRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    roi: { ...settings.roi, defaultPartScrapCostRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">Прямые затраты на материал и мехобработку</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Целевой срок окупаемости СИ (месяцев):</label>
                <input
                  type="number"
                  min={6}
                  max={60}
                  value={settings.roi.paybackTargetMonths}
                  onChange={(e) => setSettings({
                    ...settings,
                    roi: { ...settings.roi, paybackTargetMonths: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">Нормативный инвестиционный горизонт предприятия</span>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>2. Базовые стоимости инвестиций в оборудование (CAPEX, руб)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Стационарная КИМ PMT:</label>
                <input
                  type="number"
                  step={100000}
                  value={settings.roi.cmmCapexRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    roi: { ...settings.roi, cmmCapexRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-blue-600 font-mono font-bold">{(settings.roi.cmmCapexRub / 1000000).toFixed(1)} млн руб</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">3D-Сканер Shining 3D:</label>
                <input
                  type="number"
                  step={100000}
                  value={settings.roi.scannerCapexRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    roi: { ...settings.roi, scannerCapexRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-blue-600 font-mono font-bold">{(settings.roi.scannerCapexRub / 1000000).toFixed(1)} млн руб</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Лазерный трекер Leica:</label>
                <input
                  type="number"
                  step={100000}
                  value={settings.roi.trackerCapexRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    roi: { ...settings.roi, trackerCapexRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-blue-600 font-mono font-bold">{(settings.roi.trackerCapexRub / 1000000).toFixed(1)} млн руб</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Рука PMT Arm 7-Axis:</label>
                <input
                  type="number"
                  step={100000}
                  value={settings.roi.armCapexRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    roi: { ...settings.roi, armCapexRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-blue-600 font-mono font-bold">{(settings.roi.armCapexRub / 1000000).toFixed(1)} млн руб</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SERVICES & VAT CALCULATOR SETTINGS */}
      {activeSection === 'services' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>1. Прейскурант и расценки на услуги 3D-сканирования (руб)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Малая деталь (&lt;100 мм):</label>
                <input
                  type="number"
                  step={500}
                  value={settings.services.scanBaseSmallRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    services: { ...settings.services, scanBaseSmallRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 font-mono">{settings.services.scanBaseSmallRub.toLocaleString('ru-RU')} руб</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Средняя деталь (&lt;500 мм):</label>
                <input
                  type="number"
                  step={500}
                  value={settings.services.scanBaseMediumRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    services: { ...settings.services, scanBaseMediumRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 font-mono">{settings.services.scanBaseMediumRub.toLocaleString('ru-RU')} руб</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Крупная деталь (&lt;2000 мм):</label>
                <input
                  type="number"
                  step={1000}
                  value={settings.services.scanBaseLargeRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    services: { ...settings.services, scanBaseLargeRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 font-mono">{settings.services.scanBaseLargeRub.toLocaleString('ru-RU')} руб</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Крупногабарит (&gt;2 м):</label>
                <input
                  type="number"
                  step={2000}
                  value={settings.services.scanBaseHugeRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    services: { ...settings.services, scanBaseHugeRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 font-mono">{settings.services.scanBaseHugeRub.toLocaleString('ru-RU')} руб</span>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Reverse Engineering */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>2. Базовые тарифы на реверс-инжиниринг (построение CAD-модели, руб)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Призматическая геометрия:</label>
                <input
                  type="number"
                  step={1000}
                  value={settings.services.reverseBasePrismaticRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    services: { ...settings.services, reverseBasePrismaticRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 font-mono">{settings.services.reverseBasePrismaticRub.toLocaleString('ru-RU')} руб</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Литая корпусная деталь:</label>
                <input
                  type="number"
                  step={1000}
                  value={settings.services.reverseBaseCastRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    services: { ...settings.services, reverseBaseCastRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 font-mono">{settings.services.reverseBaseCastRub.toLocaleString('ru-RU')} руб</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Сложная NURBS поверхность / Лопатки:</label>
                <input
                  type="number"
                  step={2000}
                  value={settings.services.reverseBaseFreeformRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    services: { ...settings.services, reverseBaseFreeformRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 font-mono">{settings.services.reverseBaseFreeformRub.toLocaleString('ru-RU')} руб</span>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* Onsite fees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Минимальный чек выездных работ (руб):</label>
                <input
                  type="number"
                  step={1000}
                  value={settings.services.onsiteMinTotalRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    services: { ...settings.services, onsiteMinTotalRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 font-mono">{settings.services.onsiteMinTotalRub.toLocaleString('ru-RU')} руб</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Надбавка за мобильный выезд инженера (руб):</label>
                <input
                  type="number"
                  step={500}
                  value={settings.services.onsiteExtraFeeRub}
                  onChange={(e) => setSettings({
                    ...settings,
                    services: { ...settings.services, onsiteExtraFeeRub: Number(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500 font-mono">{settings.services.onsiteExtraFeeRub.toLocaleString('ru-RU')} руб</span>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* VAT Tax Rate */}
            <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-blue-900 dark:text-blue-200">
                <span>Базовая ставка НДС по умолчанию в сметах калькулятора:</span>
                <span className="font-mono font-black text-lg text-blue-600">{settings.services.defaultVatRatePercent}%</span>
              </div>
              <div className="flex gap-3">
                {[
                  { rate: 22, label: '22% НДС (Стандарт)' },
                  { rate: 0, label: '0% НДС (Экспорт / Гособоронзаказ)' },
                  { rate: 20, label: '20% НДС (Архив)' }
                ].map(item => (
                  <button
                    key={item.rate}
                    type="button"
                    onClick={() => setSettings({
                      ...settings,
                      services: { ...settings.services, defaultVatRatePercent: item.rate }
                    })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                      settings.services.defaultVatRatePercent === item.rate
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
