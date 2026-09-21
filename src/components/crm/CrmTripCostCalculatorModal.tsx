import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Calculator, Plane, Hotel, Clock, ShieldCheck, 
  Coins, FileText, CheckCircle2, ChevronRight, Sparkles, Building2, MapPin
} from 'lucide-react';

interface CrmTripCostCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToDeal?: (calcSummary: {
    totalCost: number;
    recommendedPrice: number;
    marginPercent: number;
    breakdownText: string;
  }) => void;
  initialCity?: string;
}

export const CrmTripCostCalculatorModal: React.FC<CrmTripCostCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyToDeal,
  initialCity = 'Екатеринбург'
}) => {
  // Trip & Location Params
  const [city, setCity] = useState(initialCity);
  const [distanceKm, setDistanceKm] = useState<number>(1400);
  const [engineersCount, setEngineersCount] = useState<number>(2);
  const [daysCount, setDaysCount] = useState<number>(3);
  
  // Transport & Lodging
  const [ticketPricePerPerson, setTicketPricePerPerson] = useState<number>(18000); // Авиа/ЖД билеты туда-обратно
  const [hotelPerNight, setHotelPerNight] = useState<number>(5500); // Гостиница за сутки
  const [dailyAllowancePerDay, setDailyAllowancePerDay] = useState<number>(2500); // Суточные по РФ
  const [localTaxiAndCargo, setLocalTaxiAndCargo] = useState<number>(12000); // Логистика сканера и трансфер
  
  // Engineering Hours & Postprocessors
  const [scanningHours, setScanningHours] = useState<number>(16); // Часы замеров на объекте
  const [processingAndCadHours, setProcessingAndCadHours] = useState<number>(24); // Обработка сканов и отчет
  const [postprocessorDevelopmentHours, setPostprocessorDevelopmentHours] = useState<number>(30); // Часы разработки постпроцессора
  const [hourlyRateEngineer, setHourlyRateEngineer] = useState<number>(3500); // Ставка инженера руб/час
  
  // Equipment insurance & Amortization
  const [equipmentValueRub, setEquipmentValueRub] = useState<number>(8500000); // Стоимость 3D-сканера/КИМ
  const [insuranceRatePercent, setInsuranceRatePercent] = useState<number>(0.3); // Страховка выезда %
  
  // Target Margin
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(35); // Желаемая маржинальность

  // Calculations
  const travelTotal = useMemo(() => {
    const tickets = ticketPricePerPerson * engineersCount;
    const hotel = hotelPerNight * (daysCount - 1 > 0 ? daysCount - 1 : 1) * engineersCount;
    const allowance = dailyAllowancePerDay * daysCount * engineersCount;
    const logistics = localTaxiAndCargo;
    return tickets + hotel + allowance + logistics;
  }, [ticketPricePerPerson, engineersCount, hotelPerNight, daysCount, dailyAllowancePerDay, localTaxiAndCargo]);

  const laborTotal = useMemo(() => {
    const totalHours = scanningHours + processingAndCadHours + postprocessorDevelopmentHours;
    return totalHours * hourlyRateEngineer;
  }, [scanningHours, processingAndCadHours, postprocessorDevelopmentHours, hourlyRateEngineer]);

  const insuranceAndAmortizationTotal = useMemo(() => {
    const insurance = (equipmentValueRub * insuranceRatePercent) / 100;
    const amortization = (equipmentValueRub * 0.001) * daysCount; // 0.1% в день
    return Math.round(insurance + amortization);
  }, [equipmentValueRub, insuranceRatePercent, daysCount]);

  const primeCost = useMemo(() => {
    return travelTotal + laborTotal + insuranceAndAmortizationTotal;
  }, [travelTotal, laborTotal, insuranceAndAmortizationTotal]);

  const recommendedPrice = useMemo(() => {
    if (targetMarginPercent >= 100) return primeCost * 2;
    return Math.round(primeCost / (1 - targetMarginPercent / 100));
  }, [primeCost, targetMarginPercent]);

  const profitRub = recommendedPrice - primeCost;

  const breakdownSummary = `Расчет сметы выезда в г. ${city} (${engineersCount} инж., ${daysCount} дн.):
- Командировочные и логистика: ${travelTotal.toLocaleString('ru-RU')} ₽
- Трудозатраты инженеров (${scanningHours + processingAndCadHours + postprocessorDevelopmentHours} ч): ${laborTotal.toLocaleString('ru-RU')} ₽
- Страховка и амортизация СИ: ${insuranceAndAmortizationTotal.toLocaleString('ru-RU')} ₽
Итого себестоимость: ${primeCost.toLocaleString('ru-RU')} ₽
Стоимость для заказчика (с наценкой ${targetMarginPercent}%): ${recommendedPrice.toLocaleString('ru-RU')} ₽`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-lg w-full max-w-4xl max-h-[92vh] flex flex-col shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-lg shadow-md">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Калькулятор сметы выездных измерений и внедрения ЧПУ
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Расчет командировочных, страховки СИ, трудозатрат и расчетной маржинальности сделки
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm">
            {/* Block 1: Location & Personnel */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>1. Локация и состав инженеров</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Город / Предприятие</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Кол-во инженеров</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={engineersCount}
                    onChange={e => setEngineersCount(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Дней командировки</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={daysCount}
                    onChange={e => setDaysCount(Math.max(1, Number(e.target.value)))}
                    className="w-full px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Билеты на 1 чел. (₽)</label>
                  <input
                    type="number"
                    step={1000}
                    value={ticketPricePerPerson}
                    onChange={e => setTicketPricePerPerson(Number(e.target.value))}
                    className="w-full px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Block 2: Labor & Postprocessors */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>2. Трудозатраты инженеров-метрологов и технологов ЧПУ</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Часы замеров на КИМ/сканере</label>
                  <input
                    type="number"
                    value={scanningHours}
                    onChange={e => setScanningHours(Number(e.target.value))}
                    className="w-full px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Обработка и CAD-отчет (ч)</label>
                  <input
                    type="number"
                    value={processingAndCadHours}
                    onChange={e => setProcessingAndCadHours(Number(e.target.value))}
                    className="w-full px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Разработка постпроцессора (ч)</label>
                  <input
                    type="number"
                    value={postprocessorDevelopmentHours}
                    onChange={e => setPostprocessorDevelopmentHours(Number(e.target.value))}
                    className="w-full px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ставка инженера (₽/час)</label>
                  <input
                    type="number"
                    step={250}
                    value={hourlyRateEngineer}
                    onChange={e => setHourlyRateEngineer(Number(e.target.value))}
                    className="w-full px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Block 3: Target Margin & Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-xs text-slate-500 font-semibold">Себестоимость прямая:</div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {primeCost.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-[11px] text-slate-500">
                  Билеты, суточные: {travelTotal.toLocaleString('ru-RU')} ₽<br/>
                  ФОТ инженеров: {laborTotal.toLocaleString('ru-RU')} ₽
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900 space-y-2">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Целевая маржа (%):</div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={targetMarginPercent}
                  onChange={e => setTargetMarginPercent(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between items-center text-xs font-bold text-blue-900 dark:text-blue-200">
                  <span>{targetMarginPercent}%</span>
                  <span>Прибыль: {profitRub.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900 space-y-2">
                <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Рекомендованная цена ТКП:</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {recommendedPrice.toLocaleString('ru-RU')} ₽
                </div>
                <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                  Включает НДС 20% и накладные расходы
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Смета готова для вставки в коммерческое предложение по 44-ФЗ / 223-ФЗ.
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Отмена
              </button>
              {onApplyToDeal && (
                <button
                  onClick={() => {
                    onApplyToDeal({
                      totalCost: primeCost,
                      recommendedPrice,
                      marginPercent: targetMarginPercent,
                      breakdownText: breakdownSummary
                    });
                    onClose();
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Применить в сделку</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
