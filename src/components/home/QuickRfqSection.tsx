import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  Lock, 
  Send, 
  Paperclip, 
  X, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Phone, 
  User, 
  Mail, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';

const TASK_OPTIONS = [
  { id: 'scanning', label: '3D-сканирование с выездом' },
  { id: 'reverse', label: 'Реверс-инжиниринг в CAD (STEP/B-Rep)' },
  { id: 'metrology', label: 'Контроль геометрии и GD&T (протокол FAI)' },
  { id: 'postprocessor', label: 'Постпроцессор ЧПУ (TopSolid CAM)' },
  { id: 'hardware_supply', label: 'Подбор и поставка КИМ / 3D-сканера' },
];

export const QuickRfqSection: React.FC = () => {
  const { showToast, setIsPrivacyModalOpen } = useApp();

  const [taskType, setTaskType] = useState('scanning');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [ndaRequired, setNdaRequired] = useState(true);
  const [agree, setAgree] = useState(true);

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('8')) val = '7' + val.slice(1);
    if (!val.startsWith('7')) val = '7' + val;

    let formatted = '+7';
    if (val.length > 1) formatted += ' (' + val.substring(1, 4);
    if (val.length >= 4) formatted += ') ' + val.substring(4, 7);
    if (val.length >= 7) formatted += '-' + val.substring(7, 9);
    if (val.length >= 9) formatted += '-' + val.substring(9, 11);

    setPhone(formatted);
    setPhoneError('');
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const incoming = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...incoming].slice(0, 5));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const incoming = Array.from(e.target.files);
      setFiles(prev => [...prev, ...incoming].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitize = (str: string) => str ? str.replace(/[<>]/g, '').trim() : '';
    const safeName = sanitize(name);
    const safePhone = sanitize(phone);
    const safeCompany = sanitize(company);
    const safeEmail = sanitize(email);
    const safeComment = sanitize(comment);

    if (!safeName || safeName.length < 2) {
      showToast('Пожалуйста, укажите ваше имя');
      return;
    }

    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (!safePhone || !phoneRegex.test(safePhone)) {
      setPhoneError('Укажите полный номер: +7 (XXX) XXX-XX-XX');
      return;
    }

    if (!agree) {
      showToast('Необходимо согласие на обработку персональных данных');
      return;
    }

    setSubmitting(true);

    try {
      const selectedTask = TASK_OPTIONS.find(t => t.id === taskType)?.label || taskType;
      const fileNames = files.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)} Мб)`).join(', ');
      
      const fullMessage = [
        `[ЭКСПРЕСС-ОЦЕНКА ТЗ С ГЛАВНОЙ СТРАНИЦЫ]`,
        `Задача: ${selectedTask}`,
        safeCompany ? `Предприятие / Город: ${safeCompany}` : '',
        safeEmail ? `Email: ${safeEmail}` : '',
        `Требование NDA: ${ndaRequired ? 'ДА, обязательно подписание NDA до открытия файлов' : 'Не требуется'}`,
        files.length > 0 ? `Файлы (${files.length}): ${fileNames}` : 'Файлы не прикреплены (описание в тексте)',
        safeComment ? `Комментарий заказчика: ${safeComment}` : ''
      ].filter(Boolean).join('\n');

      const result = await apiService.submitContactForm({
        name: safeName,
        phone: safePhone,
        message: fullMessage,
        department: 'engineering'
      });

      if (result && result.success) {
        setSubmitted(true);
        setFiles([]);
        showToast('Заявка принята! Инженер проведет экспресс-оценку в течение 24 часов.');
      } else {
        showToast(result?.error || 'Произошла ошибка при отправке заявки.');
      }
    } catch (err) {
      console.error('Quick RFQ error:', err);
      showToast('Сетевой сбой при отправке. Пожалуйста, позвоните нам.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="section-quick-rfq" className="w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl border border-blue-900/60 shadow-xl p-5 sm:p-8 lg:p-10 relative overflow-hidden">
      {/* Background industrial decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            Экспресс-оценка ТЗ за 24 часа • Строгое соблюдение NDA
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Оценить чертеж, ТЗ или 3D-модель за 1 клик
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Загрузите файлы детали (STEP, IGES, STL, PDF). Ведущий инженер-метролог рассчитает трудоемкость, подберет необходимое оборудование (КИМ / сканер) и направит коммерческое предложение.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 sm:p-12 text-center border border-white/20 space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Заявка успешно принята в работу!
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              Дежурный инженер свяжется с вами по указанному телефону для уточнения параметров детали и направления предварительного расчета стоимости и сроков.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setPhone('');
                  setComment('');
                }}
                className="px-6 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-blue-50 transition-all cursor-pointer shadow-md"
              >
                Отправить еще одну деталь
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Type Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                1. Выберите тип производственной задачи:
              </label>
              <div className="flex flex-wrap gap-2">
                {TASK_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTaskType(opt.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      taskType === opt.id
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-400/30'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-Column Section: Drag & Drop Files on Left, Contact Inputs on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Drag & Drop Area */}
              <div className="lg:col-span-6 space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                  2. Прикрепите 3D-модель или чертеж детали:
                </label>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                    isDragging
                      ? 'border-blue-400 bg-blue-600/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-blue-500 hover:bg-slate-800/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept=".step,.stp,.iges,.igs,.stl,.obj,.x_t,.dwg,.dxf,.pdf,.zip,.rar,.7z"
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-cyan-300 border border-blue-400/30 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-extrabold text-white">
                    Перетащите файлы сюда или <span className="text-cyan-300 underline">выберите на диске</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Поддерживаются форматы: STEP, STP, IGES, STL, DWG, PDF, Parasolid X_T, архивы ZIP (до 100 Мб)
                  </div>
                </div>

                {/* Attached Files List */}
                {files.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400">
                      Прикрепленные файлы ({files.length}):
                    </div>
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="truncate font-medium text-slate-200">{file.name}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            ({(file.size / 1024 / 1024).toFixed(1)} Мб)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                          className="text-slate-400 hover:text-red-400 p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* NDA Protection Checkbox */}
                <div className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700/80 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="nda-toggle"
                    checked={ndaRequired}
                    onChange={(e) => setNdaRequired(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="nda-toggle" className="text-xs text-slate-300 leading-snug cursor-pointer select-none">
                    <span className="font-bold text-white block">
                      Требуется подписание соглашения о конфиденциальности (NDA)
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Инженер откроет присланные чертежи и 3D-модели только после официального подписания двустороннего соглашения о неразглашении.
                    </span>
                  </label>
                </div>
              </div>

              {/* Right Column: Contact Details */}
              <div className="lg:col-span-6 space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 block">
                  3. Ваши контактные данные для отправки ТКП:
                </label>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold mb-1 block">
                      Ваше имя или должность *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Например: Алексей Смирнов (главный технолог)"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-300 font-semibold mb-1 block">
                        Телефон для связи *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={handlePhoneChange}
                          placeholder="+7 (___) ___-__-__"
                          className={`w-full bg-slate-800 border rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:ring-1 outline-none ${
                            phoneError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500'
                          }`}
                          required
                        />
                      </div>
                      {phoneError && <p className="text-[11px] text-red-400 mt-1">{phoneError}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-semibold mb-1 block">
                        Корпоративный Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="smirnov@zavod.ru"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold mb-1 block">
                      Предприятие / Город
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Например: ПАО «Авиадвигатель», Самара"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold mb-1 block">
                      Требования к детали или допуски (кратко)
                    </label>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Например: Допуск профиля лопатки ±0.02 мм, требуется протокол FAI и CAD-модель в STEP AP242..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Consent & Submit */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="quick-agree"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      required
                    />
                    <label htmlFor="quick-agree" className="text-[11px] text-slate-400 leading-tight select-none cursor-pointer">
                      Я согласен на{' '}
                      <button
                        type="button"
                        onClick={() => setIsPrivacyModalOpen(true)}
                        className="text-cyan-300 underline hover:text-white"
                      >
                        обработку персональных данных
                      </button>{' '}
                      в соответствии с политикой конфиденциальности.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Отправка дежурному инженеру...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Получить предварительную оценку и ТКП за 24 ч</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
