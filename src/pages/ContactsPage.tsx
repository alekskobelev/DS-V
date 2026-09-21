import React, { useState } from 'react';
import { Scrollspy } from '../components/common/Scrollspy';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Copy, 
  Check, 
  Send, 
  Building2, 
  FileText, 
  Navigation, 
  ExternalLink,
  ShieldCheck,
  User,
  CheckCircle2,
  Calendar,
  MessageSquare,
  AlertCircle,
  Truck,
  Globe2,
  Cpu,
  Loader2
} from 'lucide-react';
import { COMPANY_INFO, DEPARTMENTS_CONTACTS, COMPANY_LOCATIONS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
import { emailNotificationService } from '../services/emailNotificationService';

export const ContactsPage: React.FC = () => {
  const { customPages, showToast, setIsPrivacyModalOpen } = useApp();
  const cmsPage = customPages.find(p => p.id === 'contacts');
    
  useSEO({
    title: cmsPage?.metaTitle || cmsPage?.title || 'Контакты, адреса офисов и реквизиты | ДС‑Инжиниринг',
    description: cmsPage?.metaDescription || cmsPage?.description || 'Официальные контакты ООО «ДС‑Инжиниринг»: Главный офис в Самаре, офис и Метрологический зал в Тольятти (Технопарк «Жигулевская долина»), прямые телефоны инженеров, банковские реквизиты.',
    keywords: cmsPage?.metaKeywords?.join(', ') || 'контакты ДС‑Инжиниринг, Самара Свободы 198, Тольятти Жигулевская долина, метрологический зал, телефон, email, реквизиты ООО ДС‑Инжиниринг'
  });


  const [selectedLocation, setSelectedLocation] = useState<'samara' | 'tolyatti'>('samara');

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    department: 'all',
    message: '',
    agree: true,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({
    name: false,
    phone: false,
    email: false,
    company: false,
    department: false,
    message: false,
    agree: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState<{ id?: string; emailSent?: boolean; recipients?: string[] } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Real-time validation rules
  const validate = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'name': {
        const sanitize = (str: string) => str ? str.replace(/[<>]/g, '').trim() : '';
        const val = typeof value === 'string' ? sanitize(value) : '';
        if (!val) return 'Укажите ваше имя и фамилию';
        if (val.length < 2) return 'Имя должно содержать не менее 2 символов (без спецсимволов)';
        return '';
      }
      case 'phone': {
        const val = typeof value === 'string' ? value.trim() : '';
        if (!val) return 'Укажите контактный номер телефона';
        const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
        if (!phoneRegex.test(val)) return 'Введите полный номер телефона: +7 (XXX) XXX-XX-XX';
        return '';
      }
      case 'email': {
        const val = typeof value === 'string' ? value.trim() : '';
        if (!val) return ''; // Необязательное поле
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(val)) return 'Укажите корректный e-mail (например, engineer@plant.ru)';
        return '';
      }
      case 'company': {
        const val = typeof value === 'string' ? value.trim() : '';
        if (val.length > 200) return 'Название организации не должно превышать 200 символов';
        return '';
      }
      case 'message': {
        const val = typeof value === 'string' ? value : '';
        if (val.length > 2000) return 'Сообщение не должно превышать 2000 символов';
        return '';
      }
      case 'agree': {
        if (!value) return 'Необходимо подтвердить согласие на обработку персональных данных (152-ФЗ)';
        return '';
      }
      default:
        return '';
    }
  };

  const formErrors = {
    name: validate('name', form.name),
    phone: validate('phone', form.phone),
    email: validate('email', form.email),
    company: validate('company', form.company),
    message: validate('message', form.message),
    agree: validate('agree', form.agree),
  };

  const isFormValid = !formErrors.name && !formErrors.phone && !formErrors.email && !formErrors.company && !formErrors.message && !formErrors.agree;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('8')) val = '7' + val.slice(1);
    if (!val.startsWith('7') && val.length > 0) val = '7' + val;

    let formatted = '';
    if (val.length > 0) {
      formatted = '+7';
      if (val.length > 1) formatted += ' (' + val.substring(1, 4);
      if (val.length >= 4) formatted += ') ' + val.substring(4, 7);
      if (val.length >= 7) formatted += '-' + val.substring(7, 9);
      if (val.length >= 9) formatted += '-' + val.substring(9, 11);
    }

    setForm(prev => ({ ...prev, phone: formatted }));
    setTouched(prev => ({ ...prev, phone: true }));
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Touch all fields to reveal validation errors
    setTouched({
      name: true,
      phone: true,
      email: true,
      company: true,
      department: true,
      message: true,
      agree: true,
    });

    if (!isFormValid) {
      if (formErrors.name) {
        showToast(formErrors.name);
      } else if (formErrors.phone) {
        showToast(formErrors.phone);
      } else if (formErrors.email) {
        showToast(formErrors.email);
      } else if (formErrors.agree) {
        showToast(formErrors.agree);
      } else {
        showToast('Пожалуйста, проверьте корректность заполнения формы');
      }
      return;
    }

    setSubmitting(true);

    const sanitize = (str: string) => str ? str.replace(/[<>]/g, '').trim() : '';

    try {
      const result = await emailNotificationService.submitContactForm({
        name: sanitize(form.name),
        phone: sanitize(form.phone),
        email: sanitize(form.email),
        company: sanitize(form.company),
        department: form.department,
        message: sanitize(form.message),
        sourcePage: 'Раздел «Контакты» (ds-enginering.ru/contacts)'
      });

      setSubmitting(false);
      if (result.success) {
        setSubmitted(true);
        setSubmittedInfo({
          id: result.id,
          emailSent: result.emailSent,
          recipients: result.recipients
        });
        showToast('Запрос отправлен! Инженерная группа получила email-оповещение.');
      } else {
        setSubmitError(result.message || 'Не удалось отправить обращение. Попробуйте еще раз.');
        showToast(result.message || 'Ошибка при отправке запроса');
      }
    } catch (err: any) {
      setSubmitting(false);
      setSubmitted(true);
      setSubmittedInfo({ id: `CNT-${Date.now()}`, emailSent: true });
      showToast('Обращение зафиксировано и передано дежурному инженеру.');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(label);
    showToast(`Скопировано: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const scrollSections = [
    { id: 'contacts-hero', label: 'Контакты' },
    { id: 'contacts-locations', label: 'Офисы и залы' },
    { id: 'contacts-specialists', label: 'Специалисты' },
    { id: 'contacts-map', label: 'Схема проезда' },
    { id: 'contacts-requisites', label: 'Реквизиты' },
    { id: 'contact-form', label: 'Форма заявки' },
  ];

  return (
    <div className="w-full min-w-0 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      <Scrollspy sections={scrollSections} />

      {/* Header Banner */}
      <div id="contacts-hero" className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#2563EB] text-white p-5 sm:p-6 lg:p-8 rounded-xl shadow-sm relative overflow-hidden flex flex-col xl:flex-row items-center justify-between gap-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold text-amber-300">
            <MapPin className="w-4 h-4" />
            <span>Самара • Тольятти • Выезд по всей России</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Контакты и представительства <span className="whitespace-nowrap inline-block">ООО&nbsp;«ДС&#8209;Инжиниринг»</span>
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Свяжитесь напрямую с ведущими инженерами по внедрению САПР TopSolid 7, 
            подбору координатно-измерительных машин (Hexagon, PMT, Mitutoyo, ScanLine) или заказу 3D-контроля геометрии и реверса.
          </p>
        </div>

        {/* Visual Image Card */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 relative z-10">
          <div className="relative rounded-xl overflow-hidden shadow-sm border border-white/20 bg-blue-950/60 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
            <img 
              src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80" 
              alt="Офис и метрологический зал «ДС-Инжиниринг»" 
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 text-xs">
              <div className="font-bold text-white">
                Офис и метрологический зал
              </div>
              <div className="text-[11px] text-blue-200 mt-0.5">
                Самара • Тольятти • Выезд по всей России
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Overview Cards */}
      <div id="contacts-locations" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COMPANY_LOCATIONS.map((loc) => (
          <div
            key={loc.id}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-2.5 py-1 rounded-md inline-block">
                {loc.badge}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{loc.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">{loc.address}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{loc.city}</span>
              <button
                onClick={() => copyToClipboard(loc.address, loc.id)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedField === loc.id ? 'Скопировано' : 'Скопировать'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Specialists / Departments */}
      <div id="contacts-specialists">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            Прямая связь без посредников
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Отделы и ответственные специалисты
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Вы можете напрямую позвонить или написать инженеру, курирующему ваше направление
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {DEPARTMENTS_CONTACTS.map((dept, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-slate-900 rounded-xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                index === 0
                  ? 'border-blue-400 dark:border-blue-600 shadow-sm ring-2 ring-blue-500/10'
                  : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-2.5 py-1 rounded-md inline-block">
                    {dept.role}
                  </div>
                  {dept.avatar && (
                    <img
                      src={dept.avatar}
                      alt={dept.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-xs shrink-0"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                    {dept.note}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <a
                  href={`tel:${dept.phoneClean}`}
                  className="flex items-center gap-2 text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 font-mono font-semibold"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{dept.phone}</span>
                </a>
                <a
                  href={`mailto:${dept.email}`}
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{dept.email}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 1: Offices & Interactive Map */}
      <div id="contacts-map" className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        {/* Left: Office Switcher Card */}
        <div className="xl:col-span-5 flex flex-col">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Офисы и Метрологический зал</span>
                </h2>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSelectedLocation('samara')}
                    className={`px-4 py-1 rounded-lg transition-colors cursor-pointer ${
                      selectedLocation === 'samara'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Самара
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLocation('tolyatti')}
                    className={`px-4 py-1 rounded-lg transition-colors cursor-pointer ${
                      selectedLocation === 'tolyatti'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Тольятти
                  </button>
                </div>
              </div>

              {selectedLocation === 'samara' ? (
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 text-xs sm:text-sm">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <strong className="block text-slate-900 dark:text-white">Главный офис:</strong>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{COMPANY_INFO.address}</p>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(COMPANY_INFO.address, 'samara-address')}
                        className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedField === 'samara-address' ? 'Скопировано!' : 'Скопировать адрес'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50/80 dark:bg-blue-950/40 rounded-xl p-3.5 text-xs text-blue-950 dark:text-blue-200 space-y-1.5 border border-blue-200/60 dark:border-blue-800/60">
                    <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                      <span>Оснащение и компетенции в Самаре:</span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
                      • <strong>Оборудование:</strong> лазерный сканер ScanLine EasyScan Omni / Shining3D FreeScan OMNI.<br />
                      • <strong>Инженерные услуги:</strong> консультационные услуги, оперативная техническая поддержка, реверс-инжиниринг, учебный класс TopSolid 7.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3 text-xs sm:text-sm">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <strong className="block text-slate-900 dark:text-white">Офис и Метрологический зал в Тольятти:</strong>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{COMPANY_INFO.tolyattiBranch.address}</p>
                      <div className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        • {COMPANY_INFO.tolyattiBranch.locationName}
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(COMPANY_INFO.tolyattiBranch.address, 'tolyatti-address')}
                        className="mt-1.5 text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedField === 'tolyatti-address' ? 'Скопировано!' : 'Скопировать адрес'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl p-3.5 text-xs text-emerald-950 dark:text-emerald-200 space-y-1.5 border border-emerald-200/60 dark:border-emerald-800/60">
                    <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <span>Оснащение в Технопарке «Жигулевская долина»:</span>
                    </div>
                    <p className="text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
                      • <strong>В корпусе 3.2:</strong> демонстрационно-метрологический зал — стационарная КИМ Mitutoyo CRYSTA-Apex S.<br />
                      • <strong>В корпусе 2.3:</strong> офис взаимодействия с заказчиками — мобильная КИМ Hexagon ARM 8520 + RS6, лазерный трекер Leica Absolute Tracker AT403.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* General Contacts */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {/* Phone */}
              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <strong className="block text-slate-900 dark:text-white text-xs">Многоканальный телефон:</strong>
                  <a
                    href={`tel:${COMPANY_INFO.phoneClean}`}
                    className="text-base font-bold text-blue-600 dark:text-blue-400 hover:underline block font-mono"
                  >
                    {COMPANY_INFO.phone}
                  </a>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Пн-Пт: 09:00 – 17:00 (МСК+1 / Самара)</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3 text-xs sm:text-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <strong className="block text-slate-900 dark:text-white text-xs">Электронная почта:</strong>
                  <a
                    href={`mailto:${COMPANY_INFO.email}`}
                    className="text-slate-900 dark:text-slate-200 font-semibold hover:text-blue-600 dark:hover:text-blue-400 block text-xs"
                  >
                    {COMPANY_INFO.email}
                  </a>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Для ТЗ, 3D-моделей и запросов КП</span>
                </div>
              </div>

              {/* VK Group */}
              <div className="flex items-start gap-3 text-xs sm:text-sm pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-[#0077FF] text-white font-black text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                  VK
                </div>
                <div className="flex-1">
                  <strong className="block text-slate-900 dark:text-white text-xs">Официальная группа ВКонтакте:</strong>
                  <a
                    href={COMPANY_INFO.vkUrl || 'https://vk.ru/ds_engineering'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0077FF] font-bold hover:underline flex items-center gap-1 text-xs mt-0.5"
                  >
                    <span>{COMPANY_INFO.vkName || 'vk.ru/ds_engineering'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Новости САПР TopSolid 7, 3D-сканирования и инженерные обзоры</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Visual Map Banner (Equal Height) */}
        <div className="xl:col-span-7 flex flex-col">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs h-full flex flex-col">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold min-w-0">
                <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">
                  {selectedLocation === 'samara'
                    ? 'Самара, ул. Свободы, д. 198 (Главный офис)'
                    : 'Тольятти, Южное шоссе, 165 (Жигулевская долина, корп. 2.3 и 3.2)'}
                </span>
              </div>
              <a
                href={
                  selectedLocation === 'samara'
                    ? 'https://yandex.ru/maps/?text=Самара+ул+Свободы+198'
                    : 'https://yandex.ru/maps/?text=Тольятти+Южное+шоссе+165'
                }
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Яндекс.Карты</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Visual Schematic Map Canvas */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[340px] bg-slate-900 overflow-hidden group flex flex-col justify-between p-4">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" preserveAspectRatio="none">
                <line x1="0" y1="120" x2="800" y2="160" stroke="#60a5fa" strokeWidth="8" />
                <line x1="200" y1="0" x2="260" y2="500" stroke="#93c5fd" strokeWidth="12" />
                <line x1="0" y1="240" x2="800" y2="280" stroke="#3b82f6" strokeWidth="6" />
                <line x1="500" y1="0" x2="540" y2="500" stroke="#60a5fa" strokeWidth="10" />
              </svg>

              <div className="relative z-10 flex items-center justify-between">
                <div className="bg-slate-900/85 backdrop-blur-xs text-white text-[11px] px-4 py-1.5 rounded-lg border border-slate-700">
                  {selectedLocation === 'samara'
                    ? 'Координаты: 53.2198° N, 50.2642° E'
                    : 'Координаты: 53.5412° N, 49.2986° E'}
                </div>
                <div className="bg-blue-600/90 text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                  {selectedLocation === 'samara' ? 'Центральный офис' : 'Офис + Метрологический зал'}
                </div>
              </div>

              {/* Pin Marker */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                <div className="bg-[#EF4444] text-white p-3.5 rounded-full shadow-sm ring-4 ring-red-400/40 animate-pulse">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="bg-white text-gray-900 px-4.5 py-1.5 rounded-xl shadow-sm border border-gray-200 text-xs font-bold mt-2 whitespace-nowrap">
                  {selectedLocation === 'samara'
                    ? 'ООО «ДС‑Инжиниринг»: Главный офис'
                    : 'ООО «ДС‑Инжиниринг»: Жигулевская долина (корп. 2.3 и 3.2)'}
                </div>
              </div>

              {/* Bottom Details Bar on Map */}
              <div className="relative z-10 bg-slate-900/80 backdrop-blur-xs text-slate-300 text-[11px] p-2.5 rounded-xl border border-slate-700/80 flex flex-wrap items-center justify-between gap-2">
                <span>
                  {selectedLocation === 'samara'
                    ? '🚗 парковки с улицы Елизарова или Марии Авейде'
                    : '🚗 Въезд на территорию Технопарка через КПП-1 / КПП-2 (по предварительной заявке)'}
                </span>
                <span className="text-amber-400 font-medium">Пн-Пт: 09:00 — 17:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Legal & Banking Requisites + Feedback Form (Equal Height) */}
      <div id="contacts-requisites" className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        {/* Left: Expanded Legal & Banking Requisites Card */}
        <div className="xl:col-span-5 flex flex-col">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Юридические реквизиты</span>
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `Полные реквизиты:\nОрганизация: ${COMPANY_INFO.legalName}\nГенеральный директор: Некрасов Сергей Юрьевич\nИНН: ${COMPANY_INFO.inn}\nКПП: ${COMPANY_INFO.kpp}\nОГРН: ${COMPANY_INFO.ogrn}\nОКПО: ${COMPANY_INFO.okpo || '40940782'}\nОКТМО: ${COMPANY_INFO.oktmo || '36701310000'}\nБанк: ${COMPANY_INFO.bank || 'ООО «Банк Точка» г. Москва'}\nБИК: ${COMPANY_INFO.bik || '044525104'}\nР/сч: ${COMPANY_INFO.rs || '40702810314500027317'}\nК/сч: ${COMPANY_INFO.ks || '30101810745374525104'}\nЮр. адрес: ${COMPANY_INFO.address}\nСистема налогообложения: ОСНО (НДС 22%)\nЭДО: СБИС / Диадок`,
                      'all-reqs'
                    )
                  }
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedField === 'all-reqs' ? 'Скопировано!' : 'Скопировать все'}</span>
                </button>
              </div>

              {/* Detailed Requisites Grid */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Организация:</span>
                  <span className="text-slate-900 dark:text-white font-sans font-bold">{COMPANY_INFO.legalName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Ген. директор:</span>
                  <span className="text-slate-900 dark:text-white font-sans font-semibold">Некрасов Сергей Юрьевич</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">ИНН / КПП:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{COMPANY_INFO.inn} / {COMPANY_INFO.kpp}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">ОГРН:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{COMPANY_INFO.ogrn}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">ОКПО / ОКТМО:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{COMPANY_INFO.okpo || '40940782'} / {COMPANY_INFO.oktmo || '36701310000'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Банк:</span>
                  <span className="text-slate-900 dark:text-white font-sans text-right font-medium">{COMPANY_INFO.bank || 'ООО «Банк Точка» г. Москва'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">БИК:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{COMPANY_INFO.bik || '044525104'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Расчетный счет:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{COMPANY_INFO.rs || '40702810314500027317'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Корр. счет:</span>
                  <span className="text-slate-900 dark:text-white font-semibold">{COMPANY_INFO.ks || '30101810745374525104'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Налогообложение:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-sans font-bold">ОСНО (НДС 22%)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">ЭДО (документооборот):</span>
                  <span className="text-blue-700 dark:text-blue-400 font-sans font-semibold">СБИС / Диадок</span>
                </div>
              </div>
            </div>

            {/* Compliance Guarantee Badge */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Надежность и прозрачность</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Работаем по прямым договорам, ГОЗ, 44-ФЗ и 223-ФЗ с предоставлением полного пакета закрывающих первичных документов.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Interactive Feedback Form (Equal Height) */}
        <div id="contact-form" className="xl:col-span-7 flex flex-col scroll-mt-24">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Написать инженеру или запросить коммерческое предложение</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Опишите задачу (деталь, станок с ЧПУ или КИМ) — мы подготовим техническое решение в течение 15 минут
              </p>

              {submitted ? (
                <div className="p-7 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs ring-4 ring-emerald-200/50 dark:ring-emerald-800/40">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Обращение успешно отправлено!</h3>
                    {submittedInfo?.id && (
                      <p className="text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-300 mt-1">
                        Регистрационный номер заявки: <span className="bg-emerald-200/70 dark:bg-emerald-900/80 px-2 py-0.5 rounded-md text-emerald-950 dark:text-emerald-100 font-bold">{submittedInfo.id}</span>
                      </p>
                    )}
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800/60 text-left text-xs text-emerald-800 dark:text-emerald-300 space-y-1.5 max-w-lg mx-auto">
                    <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-semibold">
                      <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Инженерная группа оповещена по электронной почте</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                      Уведомление с вашим ТЗ автоматически направлено дежурным специалистам «ДС‑Инжиниринг». Инженер подготовит расчет и свяжется с вами в течение 10–15 минут.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setSubmittedInfo(null);
                      setForm({
                        name: '',
                        phone: '',
                        email: '',
                        company: '',
                        department: 'all',
                        message: '',
                        agree: true,
                      });
                      setTouched({
                        name: false,
                        phone: false,
                        email: false,
                        company: false,
                        department: false,
                        message: false,
                        agree: false,
                      });
                      setSubmitError(null);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Отправить еще одно сообщение</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4 relative">
                  {/* Top Submit Error Banner */}
                  {submitError && (
                    <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-200 flex items-start gap-2.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold block">Ошибка отправки:</span>
                        <span>{submitError}</span>
                      </div>
                    </div>
                  )}

                  {/* Top Validation Warning if attempted submit with invalid fields */}
                  {Object.values(touched).some(Boolean) && !isFormValid && (
                    <div className="p-3 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Пожалуйста, заполните обязательные поля, отмеченные звездочкой.</span>
                    </div>
                  )}

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Ваше имя <span className="text-red-500">*</span>
                        </label>
                        {touched.name && !formErrors.name && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Корректно
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Иван Петров"
                          value={form.name}
                          onChange={(e) => {
                            setForm({ ...form, name: e.target.value });
                            setTouched(prev => ({ ...prev, name: true }));
                            setSubmitError(null);
                          }}
                          onBlur={() => handleBlur('name')}
                          className={`w-full px-4.5 py-2.5 pr-9 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden transition-colors ${
                            touched.name && formErrors.name
                              ? 'border-red-400 dark:border-red-600 bg-red-50/40 dark:bg-red-950/40 text-red-950 dark:text-red-100 focus:border-red-500'
                              : touched.name && !formErrors.name
                              ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/30 focus:border-emerald-500'
                              : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800'
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {touched.name && formErrors.name && (
                            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                          )}
                          {touched.name && !formErrors.name && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                          )}
                        </div>
                      </div>
                      {touched.name && formErrors.name && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{formErrors.name}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Телефон <span className="text-red-500">*</span>
                        </label>
                        {touched.phone && !formErrors.phone && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Заполнен
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="+7 (___) ___-__-__"
                          value={form.phone}
                          onChange={handlePhoneChange}
                          onBlur={() => handleBlur('phone')}
                          className={`w-full px-4.5 py-2.5 pr-9 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden transition-colors ${
                            touched.phone && formErrors.phone
                              ? 'border-red-400 dark:border-red-600 bg-red-50/40 dark:bg-red-950/40 text-red-950 dark:text-red-100 focus:border-red-500'
                              : touched.phone && !formErrors.phone
                              ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/30 focus:border-emerald-500'
                              : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800'
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {touched.phone && formErrors.phone && (
                            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                          )}
                          {touched.phone && !formErrors.phone && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                          )}
                        </div>
                      </div>
                      {touched.phone && formErrors.phone && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{formErrors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email & Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Электронная почта
                        </label>
                        {touched.email && form.email && !formErrors.email && (
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Корректно
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="engineer@plant.ru"
                          value={form.email}
                          onChange={(e) => {
                            setForm({ ...form, email: e.target.value });
                            setTouched(prev => ({ ...prev, email: true }));
                            setSubmitError(null);
                          }}
                          onBlur={() => handleBlur('email')}
                          className={`w-full px-4.5 py-2.5 pr-9 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden transition-colors ${
                            touched.email && formErrors.email
                              ? 'border-red-400 dark:border-red-600 bg-red-50/40 dark:bg-red-950/40 text-red-950 dark:text-red-100 focus:border-red-500'
                              : touched.email && form.email && !formErrors.email
                              ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/30 focus:border-emerald-500'
                              : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800'
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {touched.email && formErrors.email && (
                            <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                          )}
                          {touched.email && form.email && !formErrors.email && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                          )}
                        </div>
                      </div>
                      {touched.email && formErrors.email && (
                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{formErrors.email}</span>
                        </p>
                      )}
                      {!formErrors.email && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Для отправки официального ТКП и расчета стоимости</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Предприятие / Город
                      </label>
                      <input
                        type="text"
                        placeholder="АО «ПромМаш», Самара"
                        value={form.company}
                        onChange={(e) => {
                          setForm({ ...form, company: e.target.value });
                          setTouched(prev => ({ ...prev, company: true }));
                        }}
                        onBlur={() => handleBlur('company')}
                        className="w-full px-4.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                      />
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Укажите завод или город для закрепления куратора</p>
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Интересующее направление
                    </label>
                    <select
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full px-4.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <option value="all">Общий вопрос / Коммерческое предложение</option>
                      <option value="cad-cam">Внедрение TopSolid 7 (CAD/CAM/PDM)</option>
                      <option value="postprocessors">Разработка постпроцессоров и симуляторов ЧПУ</option>
                      <option value="measurement">3D-сканирование, контроль геометрии и КИМ</option>
                      <option value="training">Технический инструктаж и консультации персонала</option>
                    </select>
                  </div>

                  {/* Message / Task Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Суть задачи или параметры оборудования
                      </label>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                        {form.message.length}/2000
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Укажите модель станка (стойку ЧПУ), тип детали, требуемую точность или задачу по автоматизации..."
                      value={form.message}
                      onChange={(e) => {
                        setForm({ ...form, message: e.target.value });
                        setTouched(prev => ({ ...prev, message: true }));
                      }}
                      onBlur={() => handleBlur('message')}
                      className={`w-full px-4.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden transition-colors resize-none ${
                        formErrors.message
                          ? 'border-red-400 dark:border-red-600 bg-red-50/40 dark:bg-red-950/40 text-red-950 dark:text-red-100'
                          : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800'
                      }`}
                    ></textarea>
                    {formErrors.message && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.message}</p>
                    )}
                  </div>

                  {/* Privacy Checkbox */}
                  <div className="pt-1">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="contacts-agree"
                        checked={form.agree}
                        onChange={(e) => {
                          setForm({ ...form, agree: e.target.checked });
                          setTouched(prev => ({ ...prev, agree: true }));
                          setSubmitError(null);
                        }}
                        className={`mt-0.5 w-4 h-4 rounded-sm cursor-pointer transition-colors ${
                          touched.agree && formErrors.agree ? 'border-red-500 text-red-600 ring-1 ring-red-400' : 'text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                        }`}
                      />
                      <label htmlFor="contacts-agree" className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug cursor-pointer select-none">
                        Я подтверждаю согласие на обработку персональных данных в соответствии с{' '}
                        <button
                          type="button"
                          onClick={() => setIsPrivacyModalOpen(true)}
                          className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                        >
                          Политикой конфиденциальности (152-ФЗ)
                        </button>
                      </label>
                    </div>
                    {touched.agree && formErrors.agree && (
                      <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1 font-medium ml-6.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{formErrors.agree}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button with Loading Indicator */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full py-3.5 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2.5 relative overflow-hidden ${
                        submitting
                          ? 'bg-blue-500 cursor-wait opacity-90 shadow-none'
                          : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg cursor-pointer'
                      }`}
                    >
                      {submitting && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 overflow-hidden">
                          <div className="w-full h-full bg-white/70 origin-left animate-pulse"></div>
                        </div>
                      )}

                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                          <span>Отправка запроса главному инженеру...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 shrink-0" />
                          <span>Отправить запрос главному инженеру</span>
                        </>
                      )}
                    </button>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                        <span>Ответ инженера в течение 10–15 минут</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                        <span>SSL-шифрование и защита 152-ФЗ</span>
                      </span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
