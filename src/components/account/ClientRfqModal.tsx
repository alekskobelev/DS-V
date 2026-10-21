import React, { useState } from 'react';
import { 
  X, 
  Send, 
  FileText, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Layers, 
  CheckCircle2, 
  Paperclip, 
  Calculator,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { UserProfile } from '../../types';

interface ClientRfqModalProps {
  currentUser?: UserProfile | null;
  onClose: () => void;
  onSuccess: (newRfq: any) => void;
}

const SERVICE_OPTIONS = [
  { id: 'topsolid', label: 'Внедрение CAD/CAM/CAE системы TopSolid 7' },
  { id: 'polyworks', label: 'Лицензии и модули ПО PolyWorks|Inspector' },
  { id: 'cmm_measurement', label: 'Контроль геометрических параметров на КИМ (GD&T)' },
  { id: 'scan_reverse', label: '3D-сканирование и реверс-инжиниринг деталей' },
  { id: 'postprocessor', label: 'Разработка и отладка постпроцессора ЧПУ' },
  { id: 'tooling_dies', label: 'Проектирование и изготовление штампов и оснастки' },
  { id: 'training', label: 'Обучение специалистов и операторов станков' },
  { id: 'arshin_calibration', label: 'Калибровка и поверка оборудования (ФГИС «АРШИН»)' },
  { id: 'consultation', label: 'Инженерный консалтинг и аудит производства' }
];

export const ClientRfqModal: React.FC<ClientRfqModalProps> = ({
  currentUser,
  onClose,
  onSuccess
}) => {
  const [serviceType, setServiceType] = useState('topsolid');
  const [customServiceName, setCustomServiceName] = useState('');
  const [details, setDetails] = useState('');
  const [urgency, setUrgency] = useState('Стандартно (1–2 недели)');
  const [budget, setBudget] = useState('По согласованию');
  const [cadFormat, setCadFormat] = useState('STEP / STP');
  const [attachedFileName, setAttachedFileName] = useState('');

  // Contact info
  const [customerName, setCustomerName] = useState(currentUser?.fullName || '');
  const [companyName, setCompanyName] = useState(currentUser?.company || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+7 (');
  const [email, setEmail] = useState(currentUser?.email || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedServiceLabel = SERVICE_OPTIONS.find(s => s.id === serviceType)?.label || serviceType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !email.trim()) {
      setError('Пожалуйста, заполните обязательные контактные данные (ФИО, телефон, Email)');
      return;
    }

    if (!details.trim()) {
      setError('Пожалуйста, укажите краткое описание технической задачи или требуемого оборудования/ПО');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const finalServiceName = customServiceName ? `${selectedServiceLabel} (${customServiceName})` : selectedServiceLabel;
      const fullDetails = `[Сроки: ${urgency}] [Бюджет: ${budget}] [CAD: ${cadFormat}] ${attachedFileName ? `[Прикреплено ТЗ: ${attachedFileName}] ` : ''}${details}`;

      const res = await apiService.submitRFQ({
        customerName: customerName.trim(),
        companyName: companyName.trim() || 'ООО / Предприятие',
        email: email.trim(),
        phone: phone.trim(),
        serviceType: finalServiceName,
        details: fullDetails,
        cadFormat: cadFormat
      });

      const newRfqItem = {
        id: res.data?.id || `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        serviceType: finalServiceName,
        details: fullDetails,
        status: 'pending',
        createdAt: new Date().toISOString(),
        customerName: customerName.trim(),
        companyName: companyName.trim(),
        email: email.trim(),
        phone: phone.trim()
      };

      onSuccess(newRfqItem);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Произошла ошибка при отправке заявки. Пожалуйста, проверьте подключение.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-4 bg-gray-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Новая заявка на расчет стоимости и ТКП</h3>
              <p className="text-xs text-blue-100">Прямое обращение в коммерческий и инженерный отделы ООО «ДС-Инжиниринг»</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Service Type */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Направление / Услуга / Оборудование <strong className="text-rose-500">*</strong></span>
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Техническое задание и описание требований <strong className="text-rose-500">*</strong></span>
            </label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Укажите модель станка / КИМ, габариты детали, материал, точность, необходимое количество рабочих мест или особенности техпроцесса..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400"
              required
            />
          </div>

          {/* Grid of parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Желаемые сроки</span>
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
              >
                <option value="Срочно (до 3 дней)">Срочно (до 3 дней)</option>
                <option value="Стандартно (1–2 недели)">Стандартно (1–2 недели)</option>
                <option value="В течение месяца">В течение месяца</option>
                <option value="Плановый проект">Плановый проект</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Ориентир бюджета</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
              >
                <option value="По согласованию">По согласованию</option>
                <option value="До 300 000 ₽">До 300 000 ₽</option>
                <option value="300 000 – 1 000 000 ₽">300 000 – 1 000 000 ₽</option>
                <option value="1 000 000 – 5 000 000 ₽">1 000 000 – 5 000 000 ₽</option>
                <option value="Свыше 5 000 000 ₽">Свыше 5 000 000 ₽</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Формат исходных 3D-данных</label>
              <select
                value={cadFormat}
                onChange={(e) => setCadFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
              >
                <option value="STEP / STP">STEP / STP</option>
                <option value="IGES / IGS">IGES / IGS</option>
                <option value="Parasolid (x_t)">Parasolid (x_t)</option>
                <option value="STL (Сетка)">STL (Сетка)</option>
                <option value="Чертеж PDF / DWG">Чертеж PDF / DWG</option>
                <option value="Образец детали на предприятии">Образец на предприятии</option>
              </select>
            </div>
          </div>

          {/* Attached file input simulation */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                {attachedFileName ? `Прикреплен файл: ${attachedFileName}` : 'Прикрепить чертеж или ТЗ (.step, .pdf, .zip)'}
              </span>
            </div>
            <label className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold text-blue-700 dark:text-blue-400 cursor-pointer shrink-0">
              <span>{attachedFileName ? 'Заменить' : 'Выбрать файл'}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setAttachedFileName(e.target.files[0].name);
                  }
                }}
              />
            </label>
          </div>

          {/* Contact Details */}
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/50 space-y-3">
            <div className="font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>Контактные данные заявителя</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  ФИО специалиста <strong className="text-rose-500">*</strong>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Иванов Иван Иванович"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Предприятие / Организация
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="АО «Авиаагрегат-Самара»"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Контактный телефон <strong className="text-rose-500">*</strong>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Электронная почта <strong className="text-rose-500">*</strong>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.ru"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Отмена
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Отправка заявки...' : 'Отправить заявку на расчет'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
