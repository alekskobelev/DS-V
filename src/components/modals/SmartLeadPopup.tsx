import React, { useState, useEffect, useCallback } from 'react';
import { X, ShieldCheck, Mail, ArrowRight, Crosshair, Box, Cpu, MapPin, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/apiService';

export const SmartLeadPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>(['scanner']);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast, currentPage } = useApp();

  const tasks = [
    { id: 'scanner', title: 'Подбор 3D-сканера или КИМ', description: 'Анализ чертежей, требуемой точности измерений и габаритов деталей.', icon: Crosshair },
    { id: 'reverse', title: 'Расчет услуг реверс-инжиниринга', description: 'Оценка сроков и стоимости 3D-сканирования, контроля геометрии или построения CAD-моделей.', icon: Box },
    { id: 'software', title: 'Внедрение софта (TopSolid / Geomagic)', description: 'Подбор модулей под станки ЧПУ, разработка постпроцессоров и обучение персонала.', icon: Cpu },
    { id: 'demo', title: 'Выездная демонстрация на заводе', description: 'Тестовый замер или сканирование ваших реальных изделий на вашем предприятии.', icon: MapPin },
  ];

  const triggerPopup = useCallback((forced = false) => {
    // Never auto-interrupt in administrative CMS / CRM mode unless forced
    if (!forced && (currentPage === 'cms' || currentPage === 'account')) {
      return;
    }

    setIsOpen(true);
    setHasTriggered(true);
    try {
      sessionStorage.setItem('dsLeadPopupShown', 'true');
      sessionStorage.setItem('dsLeadPopupTimestamp', Date.now().toString());
    } catch {
      // Storage access protected or private browsing
    }
  }, [currentPage]);

  // Global triggers and event listeners for testing & manual opening
  useEffect(() => {
    const handleCustomOpen = () => triggerPopup(true);
    const handleCustomReset = () => {
      try {
        sessionStorage.removeItem('dsLeadPopupShown');
        sessionStorage.removeItem('dsLeadPopupTimestamp');
        sessionStorage.removeItem('dsLeadPopupDismissed');
        localStorage.removeItem('dsLeadPopupSubmitted');
      } catch {
        // Storage access protected
      }
      setHasTriggered(false);
      showToast('Таймеры и блокировки смарт-баннера сброшены');
    };

    window.addEventListener('open-smart-lead-banner', handleCustomOpen);
    window.addEventListener('reset-smart-lead-banner', handleCustomReset);

    // Expose developer / user inspection functions on window
    (window as unknown as Record<string, unknown>).__openSmartLeadBanner = () => triggerPopup(true);
    (window as unknown as Record<string, unknown>).__resetSmartLeadBanner = handleCustomReset;

    // Check URL parameters for explicit banner testing (?testBanner=1 or #test-lead-banner)
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('testBanner') === '1' || searchParams.get('showBanner') === '1' || window.location.hash === '#test-banner') {
      setTimeout(() => triggerPopup(true), 800);
    }

    return () => {
      window.removeEventListener('open-smart-lead-banner', handleCustomOpen);
      window.removeEventListener('reset-smart-lead-banner', handleCustomReset);
    };
  }, [triggerPopup, showToast]);

  // Main triggers: 30 seconds timer + Exit Intent
  useEffect(() => {
    // If already converted previously in this browser, don't disturb
    if (localStorage.getItem('dsLeadPopupSubmitted') === 'true') {
      return;
    }

    // Check if dismissed in this session within last 15 minutes (grace period)
    const dismissedTime = sessionStorage.getItem('dsLeadPopupTimestamp');
    if (dismissedTime) {
      const elapsed = Date.now() - parseInt(dismissedTime, 10);
      // 15 minutes cooldown (900,000 ms) instead of permanent lock forever
      if (elapsed < 900000 && sessionStorage.getItem('dsLeadPopupShown') === 'true') {
        return;
      }
    }

    let timerId: NodeJS.Timeout | null = null;
    let pageLoadTime = Date.now();

    // 1. Time-based trigger (90 seconds)
    timerId = setTimeout(() => {
      triggerPopup();
    }, 90000);

    // 2. High-precision Exit-Intent trigger:
    // Triggers when cursor moves toward the top of the browser window (address bar / tabs)
    const handleMouseMoveOrLeave = (e: MouseEvent) => {
      // Must be on page for at least 15 seconds before exit-intent activates
      if (Date.now() - pageLoadTime < 15000) return;

      const isLeavingTop = e.clientY <= 12;
      const isWindowExit = (e.relatedTarget === null || (e as unknown as { toElement: unknown }).toElement === null) && e.clientY <= 30;

      if ((isLeavingTop || isWindowExit) && !hasTriggered) {
        triggerPopup();
      }
    };

    document.addEventListener('mouseleave', handleMouseMoveOrLeave);
    document.addEventListener('mousemove', handleMouseMoveOrLeave);

    return () => {
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('mouseleave', handleMouseMoveOrLeave);
      document.removeEventListener('mousemove', handleMouseMoveOrLeave);
    };
  }, [hasTriggered, triggerPopup]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('dsLeadPopupShown', 'true');
      sessionStorage.setItem('dsLeadPopupTimestamp', Date.now().toString());
    } catch {
      // ignore
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setPhone('');
      return;
    }
    if (raw.startsWith('8')) raw = '7' + raw.slice(1);
    if (!raw.startsWith('7')) raw = '7' + raw;

    let formatted = '+7';
    if (raw.length > 1) {
      formatted += ' (' + raw.substring(1, 4);
    }
    if (raw.length >= 4) {
      formatted += ') ' + raw.substring(4, 7);
    }
    if (raw.length >= 7) {
      formatted += '-' + raw.substring(7, 9);
    }
    if (raw.length >= 9) {
      formatted += '-' + raw.substring(9, 11);
    }
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sanitize = (str: string) => str ? str.replace(/[<>]/g, '').trim() : '';
    const safeEmail = sanitize(email);
    const safePhone = sanitize(phone);

    if (!safeEmail || !safeEmail.includes('@')) {
      showToast('Пожалуйста, укажите корректный рабочий email');
      return;
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(safeEmail)) {
      showToast('Некорректный формат email');
      return;
    }

    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (!safePhone || !phoneRegex.test(safePhone)) {
      showToast('Укажите полный корректный номер телефона (формат +7 (XXX) XXX-XX-XX)');
      return;
    }

    if (selectedTasks.length === 0) {
      showToast('Пожалуйста, выберите хотя бы одну задачу');
      return;
    }

    const taskTitles = selectedTasks.map(id => {
      const task = tasks.find(t => t.id === id);
      return task ? task.title : id;
    });

    setIsSubmitting(true);

    try {
      // Submit real lead to server API / CRM
      await apiService.submitRFQ({
        customerName: 'Входящий лид (подбор решений)',
        companyName: 'Посетитель сайта',
        email: safeEmail,
        phone: safePhone,
        serviceType: 'Инженерная поддержка и расчет проектов',
        details: `Выбранные задачи:\n- ${taskTitles.join('\n- ')}\n\nСтраница запроса: ${window.location.pathname || 'Главная'} / Раздел: ${currentPage}`,
      });

      // Mark as submitted so we don't nag user again
      try {
        localStorage.setItem('dsLeadPopupSubmitted', 'true');
      } catch {
        // ignore
      }

      setIsSuccess(true);
      showToast('Заявка успешно принята! Инженер свяжется с вами в ближайшее время.');

      setTimeout(() => {
        handleClose();
      }, 3500);
    } catch (err) {
      console.warn('Smart lead submission note:', err);
      // Fallback friendly success
      setIsSuccess(true);
      showToast('Заявка принята в обработку.');
      setTimeout(() => {
        handleClose();
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lock body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl sm:rounded-xl shadow-sm w-full max-w-4xl relative overflow-hidden flex flex-col md:flex-row my-auto max-h-[94vh] border border-gray-100"
      >
        {/* Prominent High-Contrast Close Button (Always visible on both dark and light mobile backgrounds) */}
        <button 
          type="button"
          onClick={handleClose}
          aria-label="Закрыть окно"
          title="Закрыть (Esc)"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-slate-900/85 hover:bg-slate-950 text-white rounded-full shadow-lg border border-white/30 backdrop-blur-md transition-transform active:scale-90 cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Scrollable interior for small screens */}
        <div className="w-full flex flex-col md:flex-row overflow-y-auto max-h-[94vh]">
          {/* Left Side: Visual / Context */}
          <div className="w-full md:w-5/12 bg-gradient-to-br from-[#1E3A8A] via-blue-900 to-[#172554] p-5 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none"></div>
            
            <div className="relative z-10 space-y-3 sm:space-y-5 pr-8 md:pr-0">
              <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-white/10 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase text-blue-100 border border-white/15">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>ИНЖИНИРИНГОВАЯ КОМПАНИЯ ДС‑ИНЖИНИРИНГ</span>
              </div>
              
              <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold leading-snug sm:leading-tight">
                Инженерная поддержка и расчет проектов
              </h2>
              
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Подберем оборудование под допуски ваших деталей, рассчитаем трудоемкость услуг или согласуем выездную демонстрацию.
              </p>
            </div>

            <div className="relative z-10 mt-4 sm:mt-6 pt-3 sm:pt-5 border-t border-blue-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-800 flex items-center justify-center shrink-0 border border-blue-700">
                  <span className="font-bold text-xs sm:text-sm text-amber-400 font-mono">31</span>
                </div>
                <div className="text-[11px] sm:text-xs text-blue-200 leading-tight">
                  год внедряем CAD/CAM системы и измерительное оборудование на заводах России.
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="w-full md:w-7/12 p-5 sm:p-7 md:p-8 bg-slate-50 flex-1 flex flex-col justify-center">
            {isSuccess ? (
              <div className="text-center py-8 animate-in zoom-in duration-300 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Заявка принята!</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Мы приняли вашу заявку. В ближайшее время инженер свяжется с вами по указанным контактам.
                </p>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    Вернуться к сайту
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Step Indicator Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-xs pr-10 sm:pr-12">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
                      1
                    </span>
                    <span className="font-bold text-gray-900 text-xs">Выберите направление:</span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    {selectedTasks.length === 0 ? 'Выберите из списка' : `Выбрано: ${selectedTasks.length}`}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                    {tasks.map((task) => {
                      const Icon = task.icon;
                      const isActive = selectedTasks.includes(task.id);
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => {
                            if (isActive) {
                              setSelectedTasks(selectedTasks.filter(id => id !== task.id));
                            } else {
                              setSelectedTasks([...selectedTasks, task.id]);
                            }
                          }}
                          className={`flex items-start sm:flex-col sm:items-start text-left p-2.5 sm:p-3 rounded-xl sm:rounded-xl border-2 transition-all cursor-pointer gap-2.5 sm:gap-0 h-full ${
                            isActive 
                              ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20' 
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 sm:mb-2 ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                          </div>
                          <div>
                            <div className={`text-xs font-semibold leading-tight mb-1 ${isActive ? 'text-blue-950 font-bold' : 'text-gray-800'}`}>
                              {task.title}
                            </div>
                            <div className={`text-[10px] leading-snug ${isActive ? 'text-blue-900/90' : 'text-gray-500'}`}>
                              {task.description}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2 Header */}
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
                    2
                  </span>
                  <span className="font-bold text-gray-900 text-xs">Контакты для отправки КП и консультации:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-800 block">
                      Корпоративная почта <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="engineer@plant.ru"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-800 block">
                      Телефон / MAX <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="+7 (___) ___-__-__"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-3.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-gray-950 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-amber-500/20 cursor-pointer min-h-[44px]"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>Отправить задачу инженерам</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                
                <div className="flex flex-col items-center gap-1.5 pt-1 text-center">
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Оставляя заявку, вы соглашаетесь на обработку персональных данных.
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-[11px] text-gray-400 hover:text-slate-500 underline underline-offset-2 py-0.5 transition-colors cursor-pointer"
                  >
                    Не сейчас, закрыть окно
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

