import React, { useState, useMemo, useEffect } from 'react';
import { Calculator as CalcIcon, Clock, Check, Send, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CalculatorProps {
  defaultService?: 'scanning' | 'reverse' | 'inspection' | 'postprocessor' | 'tooling' | 'cmm_service';
}

export const Calculator: React.FC<CalculatorProps> = ({ defaultService = 'scanning' }) => {
  const { openContactModal } = useApp();
  const [serviceType, setServiceType] = useState<'scanning' | 'reverse' | 'inspection' | 'postprocessor' | 'tooling' | 'cmm_service'>(defaultService);

  // Sync serviceType when defaultService prop changes
  useEffect(() => {
    if (defaultService) {
      setServiceType(defaultService);
    }
  }, [defaultService]);

  // Scanning State
  const [scanSize, setScanSize] = useState<'small' | 'medium' | 'large' | 'huge'>('medium');
  const [scanComplexity, setScanComplexity] = useState<'simple' | 'medium' | 'complex'>('medium');
  const [scanLocation, setScanLocation] = useState<'lab' | 'onsite'>('lab');
  const [scanUrgent, setScanUrgent] = useState(false);

  // Reverse Engineering State
  const [reverseType, setReverseType] = useState<'prismatic' | 'cast' | 'freeform' | 'complex_impeller'>('cast');
  const [reverseApproach, setReverseApproach] = useState<'parametric_tree' | 'nurbs_surface' | 'hybrid'>('parametric_tree');
  const [reverseScanSource, setReverseScanSource] = useState<'has_mesh' | 'need_lab_scan' | 'need_onsite_scan'>('has_mesh');
  const [reverseNeedDeviationAudit, setReverseNeedDeviationAudit] = useState(true);
  const [reverseNeedDrawings, setReverseNeedDrawings] = useState(true);
  const [reverseCadFormat, setReverseCadFormat] = useState<'native_topsolid' | 'native_solidworks' | 'native_nx' | 'native_kompas' | 'step_parasolid'>('native_topsolid');

  // Inspection State
  const [inspectionObject, setInspectionObject] = useState<'part' | 'tooling' | 'assembly'>('part');
  const [inspectionPointsCount, setInspectionPointsCount] = useState<'basic' | 'detailed' | 'fai'>('detailed');
  const [inspectionNeedColorMap, setInspectionNeedColorMap] = useState(true);

  // Tooling Design State
  const [toolingType, setToolingType] = useState<'mold' | 'die' | 'fixture' | 'casting'>('mold');
  const [toolingComplexity, setToolingComplexity] = useState<'standard' | 'medium' | 'high'>('medium');
  const [toolingDeliverable, setToolingDeliverable] = useState<'cad_only' | 'cad_drawings' | 'turnkey'>('cad_drawings');
  const [toolingKinematics, setToolingKinematics] = useState(true);
  const [toolingUsa, setToolingUsa] = useState(true);

  // Postprocessor State
  const [cncAxes, setCncAxes] = useState<'3axis' | '4axis' | '5axis' | 'turn_mill'>('5axis');
  const [cncControl, setCncControl] = useState<'fanuc' | 'siemens' | 'heidenhain' | 'haas' | 'other'>('siemens');
  const [camSystem, setCamSystem] = useState<string>('TopSolid 7 CAM (TopSolid SAS / Франция)');
  const [isLicensedCam, setIsLicensedCam] = useState<boolean>(true);
  const [cncNeed3DSimulation, setCncNeed3DSimulation] = useState(true);

  // CMM Service State
  const [cmmWorkType, setCmmWorkType] = useState<'maintenance' | 'calibration' | 'retrofit'>('maintenance');
  const [cmmBrand, setCmmBrand] = useState<'global' | 'domestic' | 'other'>('global');
  const [cmmNeedTraining, setCmmNeedTraining] = useState(false);

  // Calculation Logic
  const { estimatedPrice, estimatedDays, summaryText, isOnsiteMinApplied } = useMemo(() => {
    let price = 0;
    let days = 1;
    let desc = '';
    let minOnsiteApplied = false;

    if (serviceType === 'scanning') {
      const sizePrices = { small: 5000, medium: 9000, large: 18000, huge: 35000 };
      const complexityMult = { simple: 1.0, medium: 1.25, complex: 1.6 };
      price = sizePrices[scanSize] * complexityMult[scanComplexity];
      if (scanLocation === 'onsite') {
        price += 12000;
        if (price < 25000) {
          price = 25000;
          minOnsiteApplied = true;
        }
      }
      if (scanUrgent) price *= 1.3;

      days = scanSize === 'huge' ? 3 : scanComplexity === 'complex' ? 2 : 1;
      if (scanUrgent && days > 1) days = 1;

      desc = `3D-сканирование (${scanSize === 'small' ? 'до 100 мм' : scanSize === 'medium' ? 'до 500 мм' : scanSize === 'large' ? 'до 2000 мм' : 'крупногабарит >2м'}, сложность: ${scanComplexity}, ${scanLocation === 'lab' ? 'в офисе / техцентре (Самара/Тольятти)' : 'выезд на объект'})`;
    } else if (serviceType === 'reverse') {
      const typePrices = { prismatic: 16000, cast: 30000, freeform: 52000, complex_impeller: 78000 };
      const approachMult = { parametric_tree: 1.25, nurbs_surface: 1.0, hybrid: 1.15 };
      price = typePrices[reverseType] * approachMult[reverseApproach];

      if (reverseScanSource === 'need_lab_scan') price += 9000;
      if (reverseScanSource === 'need_onsite_scan') {
        price += 21000;
        if (price < 25000) {
          price = 25000;
          minOnsiteApplied = true;
        }
      }
      if (reverseNeedDeviationAudit) price += 6000;
      if (reverseNeedDrawings) price += 14000;

      days = reverseType === 'complex_impeller' ? 8 : reverseType === 'freeform' ? 6 : reverseType === 'cast' ? 4 : 2;
      if (reverseApproach === 'parametric_tree') days += 1;
      if (reverseNeedDrawings) days += 2;
      if (reverseScanSource !== 'has_mesh') days += 1;

      const cadFormatNames: Record<string, string> = {
        native_topsolid: 'TopSolid 7 (Native Feature Tree)',
        native_solidworks: 'SolidWorks (LiveTransfer)',
        native_nx: 'Siemens NX (LiveTransfer)',
        native_kompas: 'КОМПАС-3D (Параметрическая модель)',
        step_parasolid: 'STEP AP242 / Parasolid X_T',
      };

      const approachNames: Record<string, string> = {
        parametric_tree: 'Параметрическое твердотельное моделирование с деревом (Geomagic Design X)',
        nurbs_surface: 'Точная подгонка NURBS-поверхностей (Autosurface)',
        hybrid: 'Гибридное моделирование (Solid + NURBS)',
      };

      desc = `Реверс-инжиниринг: ${reverseType === 'prismatic' ? 'призматическая деталь' : reverseType === 'cast' ? 'литая корпусная' : reverseType === 'freeform' ? 'свободная NURBS форма' : 'крыльчатка / лопаточный аппарат'}, метод: ${approachNames[reverseApproach]}, CAD: ${cadFormatNames[reverseCadFormat]}, ${reverseScanSource === 'has_mesh' ? 'исходный скан предоставлен' : reverseScanSource === 'need_lab_scan' ? 'включая 3D-сканирование в офисе компании' : 'включая выездное 3D-сканирование'}${reverseNeedDeviationAudit ? ', аудит отклонений CAD/Mesh' : ''}${reverseNeedDrawings ? ', чертежи по ЕСКД' : ''}`;
    } else if (serviceType === 'inspection') {
      const objPrices = { part: 8000, tooling: 16000, assembly: 24000 };
      const pointMult = { basic: 1.0, detailed: 1.3, fai: 1.7 };
      price = objPrices[inspectionObject] * pointMult[inspectionPointsCount];
      if (inspectionNeedColorMap) price += 3000;

      days = inspectionPointsCount === 'fai' ? 3 : 1;
      desc = `Контроль геометрии (${inspectionObject === 'part' ? 'деталь' : inspectionObject === 'tooling' ? 'пресс-форма/штамп' : 'сборочный узел'}, отчет: ${inspectionPointsCount})`;
    } else if (serviceType === 'tooling') {
      const typePrices = { mold: 65000, die: 55000, fixture: 40000, casting: 48000 };
      const complexityMult = { standard: 1.0, medium: 1.4, high: 2.1 };
      const deliverableMult = { cad_only: 1.0, cad_drawings: 1.35, turnkey: 3.5 };
      price = typePrices[toolingType] * complexityMult[toolingComplexity] * deliverableMult[toolingDeliverable];
      if (toolingKinematics) price += 12000;
      if (toolingUsa) price += 8000;

      days = toolingDeliverable === 'turnkey' ? 25 : toolingComplexity === 'high' ? 14 : 7;
      if (toolingKinematics) days += 2;

      const typeNames = {
        mold: 'Пресс-форма (литье пластмасс/резины/сплавов)',
        die: 'Штамп (вырубной, гибочный, последовательный)',
        fixture: 'Станочное зажимное/контрольное приспособление',
        casting: 'Литейная модельная оснастка и кокиль',
      };
      const deliverableNames = {
        cad_only: '3D CAD-проект оснастки с деревом (STEP / Parasolid / Native CAD)',
        cad_drawings: '3D CAD + комплект рабочих чертежей по ЕСКД + УП ЧПУ',
        turnkey: 'Полный цикл: проектирование + изготовление "под ключ" с испытаниями и образцами',
      };

      desc = `Проектирование и изготовление оснастки: ${typeNames[toolingType]}, сложность: ${toolingComplexity === 'standard' ? 'базовая (1-2 гнезда)' : toolingComplexity === 'medium' ? 'средняя' : 'высокая (многогнездная/шиберы)'}, формат: ${deliverableNames[toolingDeliverable]}${toolingKinematics ? ', кинематический анализ смыкания' : ''}${toolingUsa ? ', расчет объемной усадки' : ''}`;
    } else if (serviceType === 'postprocessor') {
      const axisPrices = { '3axis': 25000, '4axis': 40000, '5axis': 75000, 'turn_mill': 85000 };
      price = axisPrices[cncAxes];
      if (cncNeed3DSimulation) price += 20000;

      days = cncAxes === 'turn_mill' || cncAxes === '5axis' ? 7 : 4;
      desc = `Постпроцессор (${cncAxes === '3axis' ? '3-осевой' : cncAxes === '4axis' ? '4-осевой' : cncAxes === '5axis' ? '5-осевой' : 'токарно-фрезерный'}, ЧПУ ${cncControl.toUpperCase()}, CAM: ${camSystem}, ${isLicensedCam ? 'Лицензия CAM: Да' : 'Лицензия CAM: Не указано'})`;
    } else if (serviceType === 'cmm_service') {
      const workPrices = { maintenance: 30000, calibration: 65000, retrofit: 280000 };
      price = workPrices[cmmWorkType];
      if (cmmNeedTraining) price += 35000;

      days = cmmWorkType === 'retrofit' ? 10 : cmmWorkType === 'calibration' ? 3 : 2;
      const typeLabel = cmmWorkType === 'maintenance' ? 'Регламентное ТО и дефектовка КИМ' : cmmWorkType === 'calibration' ? 'Лазерная калибровка по ISO 10360' : 'Модернизация контроллеров и замена ПО';
      desc = `${typeLabel} (${cmmBrand === 'global' ? 'Zeiss/DEA/Hexagon/Mitutoyo' : cmmBrand === 'domestic' ? 'Отечественная КИМ' : 'Другой производитель'})`;
    }

    return {
      estimatedPrice: Math.round(price / 500) * 500,
      estimatedDays: days,
      summaryText: desc,
      isOnsiteMinApplied: minOnsiteApplied,
    };
  }, [
    serviceType,
    scanSize,
    scanComplexity,
    scanLocation,
    scanUrgent,
    reverseType,
    reverseApproach,
    reverseScanSource,
    reverseNeedDeviationAudit,
    reverseNeedDrawings,
    reverseCadFormat,
    inspectionObject,
    inspectionPointsCount,
    inspectionNeedColorMap,
    toolingType,
    toolingComplexity,
    toolingDeliverable,
    toolingKinematics,
    toolingUsa,
    cncAxes,
    cncControl,
    cncNeed3DSimulation,
    cmmWorkType,
    cmmBrand,
    cmmNeedTraining,
  ]);

  const handleOrderWithEstimate = () => {
    if (serviceType === 'postprocessor') {
      openContactModal({
        title: 'Заказ разработки постпроцессора для станка с ЧПУ',
        defaultService: `${summaryText} — ориентировочно ${estimatedPrice.toLocaleString('ru-RU')} ₽, ${estimatedDays} дн.`,
        formType: 'postprocessor',
        camSystem: camSystem,
        isLicensedCam: isLicensedCam,
      });
    } else {
      openContactModal({
        title: 'Заказ услуги по предварительному расчету',
        defaultService: `${summaryText} — ориентировочно ${estimatedPrice.toLocaleString('ru-RU')} ₽, ${estimatedDays} дн.`,
        formType: 'service',
      });
    }
  };

  return (
    <div id="service-calculator" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <CalcIcon className="w-4 h-4" />
            <span>Интерактивный расчет стоимости и сроков</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Калькулятор инжиниринговых услуг
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            Выберите параметры вашей технической задачи для моментальной оценки
          </p>
        </div>

        {/* Service Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-blue-900/60 p-1 rounded-xl">
          <button
            onClick={() => setServiceType('scanning')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              serviceType === 'scanning' ? 'bg-[#F59E0B] text-white font-semibold' : 'text-blue-200 hover:text-white'
            }`}
          >
            3D-сканирование
          </button>
          <button
            onClick={() => setServiceType('reverse')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              serviceType === 'reverse' ? 'bg-[#F59E0B] text-white font-semibold' : 'text-blue-200 hover:text-white'
            }`}
          >
            Обратный инжиниринг
          </button>
          <button
            onClick={() => setServiceType('inspection')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              serviceType === 'inspection' ? 'bg-[#F59E0B] text-white font-semibold' : 'text-blue-200 hover:text-white'
            }`}
          >
            Контроль деталей
          </button>
          <button
            onClick={() => setServiceType('tooling')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              serviceType === 'tooling' ? 'bg-[#F59E0B] text-white font-semibold' : 'text-blue-200 hover:text-white'
            }`}
          >
            Проектирование оснастки
          </button>
          <button
            onClick={() => setServiceType('postprocessor')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              serviceType === 'postprocessor' ? 'bg-[#F59E0B] text-white font-semibold' : 'text-blue-200 hover:text-white'
            }`}
          >
            Постпроцессоры ЧПУ
          </button>
          <button
            onClick={() => setServiceType('cmm_service')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              serviceType === 'cmm_service' ? 'bg-[#F59E0B] text-white font-semibold' : 'text-blue-200 hover:text-white'
            }`}
          >
            Сервис и ТО КИМ
          </button>
        </div>
      </div>

      {/* Calculator Body */}
      <div className="p-6 sm:p-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Options Column (2 cols) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Scanning Mode Form */}
          {serviceType === 'scanning' && (
            <div className="space-y-5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  1. Габариты сканируемого объекта
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                  {[
                    { id: 'small', label: 'До 100 мм', hint: 'Мелкие детали, крепеж' },
                    { id: 'medium', label: '100 – 500 мм', hint: 'Кронштейны, фланцы' },
                    { id: 'large', label: '0.5 – 2.0 м', hint: 'Блоки, корпуса, штампы' },
                    { id: 'huge', label: 'Более 2.0 м', hint: 'Стапели, кузова, суда' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setScanSize(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        scanSize === item.id
                          ? 'border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-xs">{item.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  2. Сложность геометрии и поверхностей
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'simple', label: 'Простая', hint: 'Плоскости, цилиндры' },
                    { id: 'medium', label: 'Средняя', hint: 'Литье, ребра, пазы' },
                    { id: 'complex', label: 'Высокая', hint: 'Крыльчатки, каналы, лопатки' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setScanComplexity(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        scanComplexity === item.id
                          ? 'border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-xs">{item.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="scan-onsite"
                    checked={scanLocation === 'onsite'}
                    onChange={(e) => setScanLocation(e.target.checked ? 'onsite' : 'lab')}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="scan-onsite" className="text-xs text-gray-800 cursor-pointer">
                    <span className="font-semibold block">Выезд на предприятие заказчика</span>
                    <span className="text-[11px] text-gray-500">Доставка мобильного сканера и инженера</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="scan-urgent"
                    checked={scanUrgent}
                    onChange={(e) => setScanUrgent(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded"
                  />
                  <label htmlFor="scan-urgent" className="text-xs text-gray-800 cursor-pointer">
                    <span className="font-semibold block text-amber-700">Срочное выполнение (24 часа)</span>
                    <span className="text-[11px] text-gray-500">Приоритетная обработка и выдача сетки</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Reverse Engineering Form */}
          {serviceType === 'reverse' && (
            <div className="space-y-5 text-xs sm:text-sm">
              {/* Category of part */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  1. Категория объекта для реверс-инжиниринга
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                  {[
                    { id: 'prismatic', label: 'Призматическая / Токарная', hint: 'Фланцы, валы, плиты, оси' },
                    { id: 'cast', label: 'Корпусная / Литая', hint: 'Насосы, редукторы, кронштейны' },
                    { id: 'freeform', label: 'Сложные NURBS поверхности', hint: 'Пресс-формы, штампы, кузовные элементы' },
                    { id: 'complex_impeller', label: 'Крыльчатка / Лопатки', hint: 'Турбины, шнеки, импеллеры' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setReverseType(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        reverseType === item.id
                          ? 'border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-xs">{item.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modeling Approach */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  2. Метод построения и перевод полигональной сетки (Mesh-to-CAD)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'parametric_tree', label: 'Параметрическое CAD с деревом', hint: 'Geomagic Design X: эскизы, выдавливания, дерево' },
                    { id: 'hybrid', label: 'Гибридное моделирование', hint: 'Твердотельные базы + точные NURBS поверхности' },
                    { id: 'nurbs_surface', label: 'Прямая подгонка NURBS', hint: 'Autosurface для сложных художественных/аэроформ' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setReverseApproach(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        reverseApproach === item.id
                          ? 'border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-xs">{item.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scan Source */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  3. Источник исходных данных для реверса
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'has_mesh', label: 'Уже есть 3D-скан (STL / OBJ)', hint: 'Готовая полигональная сетка от заказчика' },
                    { id: 'need_lab_scan', label: 'Сканирование в офисе компании', hint: 'ScanLine / Shining 3D синий лазер (Самара)' },
                    { id: 'need_onsite_scan', label: 'Выездное 3D-сканирование', hint: 'Доставка сканера и инженера на завод' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setReverseScanSource(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        reverseScanSource === item.id
                          ? 'border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-xs">{item.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Format and Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200">
                  <label className="text-xs font-semibold block text-gray-800 mb-1">
                    Целевая CAD-система
                  </label>
                  <select
                    value={reverseCadFormat}
                    onChange={(e) => setReverseCadFormat(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  >
                    <option value="native_topsolid">TopSolid 7 (Native CAD дерево)</option>
                    <option value="native_solidworks">SolidWorks (LiveTransfer)</option>
                    <option value="native_nx">Siemens NX (LiveTransfer)</option>
                    <option value="native_kompas">КОМПАС-3D (Параметрическая)</option>
                    <option value="step_parasolid">STEP AP242 / Parasolid X_T</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="rev-audit"
                    checked={reverseNeedDeviationAudit}
                    onChange={(e) => setReverseNeedDeviationAudit(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="rev-audit" className="text-xs text-gray-800 cursor-pointer">
                    <span className="font-semibold block">Аудит отклонений CAD от Mesh</span>
                    <span className="text-[11px] text-gray-500">Цветовая карта точности до ±0.01 мм</span>
                  </label>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="rev-drawings"
                    checked={reverseNeedDrawings}
                    onChange={(e) => setReverseNeedDrawings(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="rev-drawings" className="text-xs text-gray-800 cursor-pointer">
                    <span className="font-semibold block">Чертежи по ЕСКД (ГОСТ)</span>
                    <span className="text-[11px] text-gray-500">Виды, сечения, допуски, шероховатость</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Inspection Form */}
          {serviceType === 'inspection' && (
            <div className="space-y-5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  1. Тип контролируемого объекта
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'part', label: 'Одиночная деталь', hint: 'Штучное или серийное изделие' },
                    { id: 'tooling', label: 'Оснастка / Штамп / Пресс-форма', hint: 'Контроль износа и зазоров' },
                    { id: 'assembly', label: 'Сборочный узел / Стапель', hint: 'Взаимное положение баз' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setInspectionObject(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        inspectionObject === item.id
                          ? 'border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-xs">{item.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                    2. Глубина метрологического отчета
                  </label>
                  <select
                    value={inspectionPointsCount}
                    onChange={(e) => setInspectionPointsCount(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="basic">Базовый отчет (до 15 ключевых размеров)</option>
                    <option value="detailed">Развернутый протокол GD&T (допуски формы и расположения)</option>
                    <option value="fai">Полный отчет первого изделия First Article Inspection (FAI)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center gap-3 self-end">
                  <input
                    type="checkbox"
                    id="insp-colormap"
                    checked={inspectionNeedColorMap}
                    onChange={(e) => setInspectionNeedColorMap(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="insp-colormap" className="text-xs text-gray-800 cursor-pointer">
                    <span className="font-semibold block">Цветовая 3D-карта отклонений</span>
                    <span className="text-[11px] text-gray-500">Наглядная карта припусков и деформаций</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tooling Design Form */}
          {serviceType === 'tooling' && (
            <div className="space-y-5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  1. Тип проектируемой технологической оснастки
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                  {[
                    { id: 'mold', label: 'Пресс-форма', hint: 'Литье пластмасс/резины/сплавов' },
                    { id: 'die', label: 'Штамп листовой', hint: 'Вырубной, гибочный, последовательный' },
                    { id: 'fixture', label: 'Станочная оснастка', hint: 'Зажимные приспособления, кондукторы' },
                    { id: 'casting', label: 'Литейная оснастка', hint: 'Модельные комплекты и кокили' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setToolingType(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        toolingType === item.id
                          ? 'border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-xs">{item.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                    2. Сложность и количество гнезд
                  </label>
                  <select
                    value={toolingComplexity}
                    onChange={(e) => setToolingComplexity(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
                  >
                    <option value="standard">Базовая сложность (1-2 гнезда, прямое смыкание без шиберов)</option>
                    <option value="medium">Средняя сложность (многоместная, наклонные выталкиватели, боковые знаки)</option>
                    <option value="high">Высокая сложность (горячеканальная ГКС, сложные ползуны, шестеренные приводы)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                    3. Формат комплекта поставки
                  </label>
                  <select
                    value={toolingDeliverable}
                    onChange={(e) => setToolingDeliverable(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
                  >
                    <option value="cad_only">Только 3D CAD-проект с деревом построения (STEP AP242 / Parasolid / Native CAD)</option>
                    <option value="cad_drawings">3D CAD + комплект рабочих чертежей по ЕСКД + УП для станков ЧПУ</option>
                    <option value="turnkey">Полный цикл: Проектирование + Изготовление "под ключ" с испытанием и образцами</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="tooling-kinematics"
                    checked={toolingKinematics}
                    onChange={(e) => setToolingKinematics(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="tooling-kinematics" className="text-xs text-gray-800 cursor-pointer">
                    <span className="font-semibold block">Кинематический анализ раскрытия</span>
                    <span className="text-[11px] text-gray-500">Симуляция хода плит, ползунов и отсутствия коллизий</span>
                  </label>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="tooling-usa"
                    checked={toolingUsa}
                    onChange={(e) => setToolingUsa(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="tooling-usa" className="text-xs text-gray-800 cursor-pointer">
                    <span className="font-semibold block">Расчет усадки и проливаемости</span>
                    <span className="text-[11px] text-gray-500">Анализ геометрии отливки и температурных режимов</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Postprocessor Form */}
          {serviceType === 'postprocessor' && (
            <div className="space-y-5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  1. Кинематическая схема станка с ЧПУ
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                  {[
                    { id: '3axis', label: '3-осевой фрезерный', hint: 'X, Y, Z' },
                    { id: '4axis', label: '4-осевой (поворотный)', hint: 'X, Y, Z + A или B/C' },
                    { id: '5axis', label: '5-осевой непрерывный', hint: 'Стол-стол / голова-голова' },
                    { id: 'turn_mill', label: 'Токарно-фрезерный', hint: 'С B-осью и контршпинделем' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCncAxes(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        cncAxes === item.id
                          ? 'border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-xs">{item.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                    2. Система ЧПУ (стойка)
                  </label>
                  <select
                    value={cncControl}
                    onChange={(e) => setCncControl(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-mono"
                  >
                    <option value="siemens">Siemens Sinumerik (828D / 840D sl / ONE)</option>
                    <option value="fanuc">Fanuc (0i-MD / 31i / 32i / 30i)</option>
                    <option value="heidenhain">Heidenhain (iTNC 530 / TNC 620 / TNC 640)</option>
                    <option value="haas">Haas NGC / Classic Haas</option>
                    <option value="other">Другие (Syntec, Mitsubishi, GSK, Балт-Систем)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                    3. CAM-система предприятия <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={camSystem}
                    onChange={(e) => setCamSystem(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
                  >
                    <option value="TopSolid 7 CAM (TopSolid SAS / Франция)">TopSolid 7 CAM (TopSolid SAS)</option>
                    <option value="Siemens NX CAM (Unigraphics)">Siemens NX CAM</option>
                    <option value="Mastercam (CNC Software)">Mastercam</option>
                    <option value="SolidCAM">SolidCAM</option>
                    <option value="Autodesk PowerMill">Autodesk PowerMill</option>
                    <option value="Autodesk FeatureCAM">Autodesk FeatureCAM</option>
                    <option value="SprutCAM (Спрут-Технология)">SprutCAM (Спрут-Технология)</option>
                    <option value="CATIA V5 / 3DEXPERIENCE">CATIA V5 / 3DEXPERIENCE</option>
                    <option value="Esprit CAM (Hexagon)">Esprit CAM (Hexagon)</option>
                    <option value="T-FLEX ЧПУ (Топ Системы)">T-FLEX ЧПУ</option>
                    <option value="Fusion 360 CAM (Autodesk)">Fusion 360 CAM</option>
                    <option value="Другая CAM-система">Другая CAM-система</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="cnc-sim"
                    checked={cncNeed3DSimulation}
                    onChange={(e) => setCncNeed3DSimulation(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="cnc-sim" className="text-xs text-gray-800 cursor-pointer">
                    <span className="font-semibold block">Кинематическая 3D-модель станка</span>
                    <span className="text-[11px] text-gray-500">Симуляция G-кода с защитой от коллизий</span>
                  </label>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  isLicensedCam ? 'bg-emerald-50/70 border-emerald-300' : 'bg-amber-50/70 border-amber-300'
                }`}>
                  <input
                    type="checkbox"
                    id="calc-cam-lic"
                    checked={isLicensedCam}
                    onChange={(e) => setIsLicensedCam(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="calc-cam-lic" className="text-xs text-gray-800 cursor-pointer">
                    <span className="font-bold text-gray-900 block flex items-center gap-1">
                      <span>Лицензионная CAM-система</span>
                      <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-semibold">Обязательно</span>
                    </span>
                    <span className="text-[11px] text-gray-500">Подтверждаю официальную лицензию ПО</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* CMM Service Form */}
          {serviceType === 'cmm_service' && (
            <div className="space-y-5 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  1. Требуемый вид работ по КИМ
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'maintenance', label: 'Регламентное ТО и дефектовка', hint: 'Пневматика, фильтры, подшипники, геометрия' },
                    { id: 'calibration', label: 'Лазерная калибровка и поверка', hint: 'Лазерная интерферометрия по ISO 10360' },
                    { id: 'retrofit', label: 'Комплексная модернизация', hint: 'Замена контроллеров Renishaw UCC, ПО PolyWorks' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCmmWorkType(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        cmmWorkType === item.id
                          ? 'border-[#2563EB] bg-blue-50/70 ring-2 ring-blue-500/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 text-xs">{item.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{item.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">
                    2. Производитель / тип машины
                  </label>
                  <select
                    value={cmmBrand}
                    onChange={(e) => setCmmBrand(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-300 bg-white"
                  >
                    <option value="global">Импортная КИМ (Zeiss, Hexagon, DEA, Mitutoyo, Coord3, PMT)</option>
                    <option value="domestic">Отечественная КИМ (КИМ-1000, Лапик, Вектор и др.)</option>
                    <option value="other">Другой производитель / портальная система</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 flex items-center gap-3 self-end">
                  <input
                    type="checkbox"
                    id="cmm-train"
                    checked={cmmNeedTraining}
                    onChange={(e) => setCmmNeedTraining(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="cmm-train" className="text-xs text-gray-800 cursor-pointer">
                    <span className="font-semibold block">Технический инструктаж и консультации</span>
                    <span className="text-[11px] text-gray-500">Инструктаж по работе с новым ПО и измерительными головками</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Calculation Result Summary Card (1 col, sticky on desktop) */}
        <div className="lg:sticky lg:top-24 h-fit bg-gradient-to-br from-gray-50 to-blue-50/40 rounded-xl p-6 border border-blue-100 flex flex-col justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              Ориентировочный расчет
            </div>
            <div className="text-3xl font-black text-gray-900 mt-2 font-mono">
              ~ {estimatedPrice.toLocaleString('ru-RU')} ₽
            </div>
            {isOnsiteMinApplied && (
              <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 leading-snug">
                ⚠️ <strong>Минимальный тариф выезда:</strong> Включен базовый выезд инженера с лазерным оборудованием (от 25 000 ₽).
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 font-medium">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              <span>Срок выполнения: ~ {estimatedDays}–{estimatedDays + 1} раб. дней</span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200/80 space-y-2 text-xs text-slate-500">
              <div className="font-semibold text-gray-900">Что входит в стоимость:</div>
              <p className="text-[11px] text-slate-500 leading-relaxed bg-white p-2.5 rounded-lg border border-gray-200">
                {summaryText}
              </p>
              <ul className="space-y-1 text-[11px] text-slate-500 pt-1">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Работа сертифицированных инженеров</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Метрологическая точность и контроль</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Гарантия и техническая поддержка</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleOrderWithEstimate}
              className="w-full py-3 px-4 bg-[#F59E0B] hover:bg-amber-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <span>Оформить заявку с этим расчетом</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              Итоговая цена уточняется после изучения чертежей и ТЗ
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Summary Bar (Visible only on mobile/tablet) */}
      <div className="lg:hidden sticky bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-blue-200/80 p-3.5 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Предварительный расчет:</div>
          <div className="text-base sm:text-lg font-black text-gray-900 font-mono leading-tight">
            ~ {estimatedPrice.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[10px] text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#F59E0B]" />
            <span>~ {estimatedDays}–{estimatedDays + 1} раб. дн.</span>
          </div>
        </div>

        <button
          onClick={handleOrderWithEstimate}
          className="shrink-0 py-2.5 px-4 bg-[#F59E0B] hover:bg-amber-600 active:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs cursor-pointer"
        >
          <span>Заказать расчет</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
