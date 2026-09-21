import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Phone, 
  PhoneCall, 
  Clock, 
  Building2, 
  User, 
  Mail, 
  CheckCircle2, 
  ShieldCheck, 
  Send, 
  ChevronRight,
  AlertCircle,
  HelpCircle,
  Cpu,
  Microscope,
  Box,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COMPANY_INFO } from '../../data/mockData';
import { apiService } from '../../services/apiService';

const CALLBACK_TOPICS = [
  { id: 'cmm', label: 'КИМ и руки PMT', icon: Microscope, desc: 'Координатно-измерительные машины, оптические КИМ' },
  { id: 'scan', label: '3D-сканирование и реверс', icon: Box, desc: 'ScanLine Omni, Shining3D, оцифровка и CAD-моделирование' },
  { id: 'cam', label: 'TopSolid 7 CAD/CAM', icon: Cpu, desc: 'Лицензии, постпроцессоры ЧПУ, инструктаж технологов' },
  { id: 'service', label: 'Поверка, калибровка и сервис', icon: FileCheck2, desc: 'ВНИИМС, аттестация, ТО и юстировка оборудования' },
  { id: 'general', label: 'Общий технический вопрос', icon: HelpCircle, desc: 'Консультация дежурного инженера по подбору решения' },
];

const CALLBACK_TIMES = [
  { id: 'now', label: 'В течение 10–15 минут', badge: 'Срочно' },
  { id: 'today_morning', label: 'Сегодня с 10:00 до 13:00' },
  { id: 'today_afternoon', label: 'Сегодня с 13:00 до 17:00' },
  { id: 'tomorrow', label: 'Завтра утром (с 09:00)' },
  { id: 'custom', label: 'Указано в комментарии' },
];

export const CallbackModal: React.FC = () => {
  const { 
    isCallbackModalOpen, 
    closeCallbackModal, 
    callbackInitialData, 
    showToast,
    setIsPrivacyModalOpen 
  } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('cmm');
  const [selectedTime, setSelectedTime] = useState('now');
  const [comment, setComment] = useState('');
  const [agreeConsent, setAgreeConsent] = useState(true);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isCallbackModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isCallbackModalOpen]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ callId: string; message: string } | null>(null);

  useEffect(() => {
    if (isCallbackModalOpen) {
      setSuccessData(null);
      setErrors({});
      if (callbackInitialData) {
        if (callbackInitialData.name) setName(callbackInitialData.name);
        if (callbackInitialData.phone) setPhone(callbackInitialData.phone);
        if (callbackInitialData.topic) {
          const topicStr = callbackInitialData.topic.toLowerCase();
          const match = CALLBACK_TOPICS.find(t => t.id === callbackInitialData.topic || (t.label || '').toLowerCase().includes(topicStr));
          if (match) setSelectedTopic(match.id);
        }
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeCallbackModal();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isCallbackModalOpen, callbackInitialData, closeCallbackModal]);

  if (!isCallbackModalOpen) return null;

  // Форматирование телефона +7 (XXX) XXX-XX-XX
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
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const sanitize = (str: string) => str ? str.replace(/[<>]/g, '').trim() : '';

    const safeName = sanitize(name);
    if (!safeName || safeName.length < 2) {
      newErrors.name = 'Укажите ваше имя или ФИО (без спецсимволов)';
    }

    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (!phone || !phoneRegex.test(phone)) {
      newErrors.phone = 'Укажите полный номер мобильного или рабочего телефона';
    }

    if (email && email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Некорректный формат email (например: name@company.ru)';
      }
    }
    if (!agreeConsent) {
      newErrors.consent = 'Необходимо подтвердить согласие на обработку персональных данных';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const activeTopicObj = CALLBACK_TOPICS.find(t => t.id === selectedTopic);
    const activeTimeObj = CALLBACK_TIMES.find(t => t.id === selectedTime);
    const sanitize = (str: string) => str ? str.replace(/[<>]/g, '').trim() : '';

    try {
      const payload = {
        customerName: sanitize(name),
        phone: sanitize(phone),
        companyName: sanitize(company) || 'Частное лицо / Заказчик',
        email: sanitize(email),
        topic: activeTopicObj ? activeTopicObj.label : selectedTopic,
        preferredTime: activeTimeObj ? activeTimeObj.label : selectedTime,
        comment: sanitize(comment)
      };

      const result = await apiService.requestQuickCallback(payload);

      if (result && result.success) {
        setSuccessData({
          callId: result.callId || `CALL-2026-${Math.floor(100 + Math.random() * 900)}`,
          message: result.message || 'Заявка успешно принята!'
        });
        showToast('Заявка на звонок принята! Инженер свяжется с вами.');
      } else {
        setErrors({ general: result?.error || 'Не удалось отправить заявку. Попробуйте позвонить нам напрямую.' });
      }
    } catch (err) {
      setErrors({ general: 'Сетевой сбой при отправке. Пожалуйста, позвоните нам по телефону +7 (846) 954-02-92.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeTopicObj = CALLBACK_TOPICS.find(t => t.id === selectedTopic);
  const activeTimeObj = CALLBACK_TIMES.find(t => t.id === selectedTime);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCallbackModal();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="callback-modal-title"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A8A] via-[#1E40AF] to-[#2563EB] text-white p-4 sm:p-5 relative">
          <button
            id="close-callback-modal-btn"
            onClick={closeCallbackModal}
            className="absolute top-3 right-3 text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
            aria-label="Закрыть модальное окно"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Экспресс-связь • Дежурный инженер
            </span>
          </div>

          <h2 id="callback-modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-300 shrink-0" />
            Заказ обратного звонка
          </h2>
          <p className="text-blue-100 text-[11px] sm:text-xs mt-1 leading-relaxed">
            Оставьте номер телефона, и дежурный инженер-технолог перезвонит вам в течение 10–15 минут для технической консультации.
          </p>
        </div>

        {/* Direct Phone Callout Bar */}
        <div className="bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/50 px-4 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Прямой телефон инженеров:</span>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href={`tel:${COMPANY_INFO.phoneClean}`}
              className="font-bold text-sm text-[#1E3A8A] dark:text-blue-300 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md shadow-xs border border-blue-200 dark:border-blue-800"
            >
              <PhoneCall className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {COMPANY_INFO.phone}
            </a>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {successData ? (
            /* Success State */
            <div className="text-center py-4 px-2 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 mb-2">
                  Заявка № {successData.callId}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Заявка на обратный звонок принята!
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-300 mt-1.5 max-w-md mx-auto">
                  Дежурный специалист свяжется с вами по указанному номеру для решения вашей задачи.
                </p>
              </div>

              {/* CRM Summary Box */}
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-left text-xs space-y-1.5 text-slate-500 dark:text-gray-300">
                <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Телефон:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Тема:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{activeTopicObj?.label}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Время:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{activeTimeObj?.label}</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1 text-[10px] text-gray-500 dark:text-gray-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Заявка синхронизирована с базой данных CRM.</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                <a
                  href={`tel:${COMPANY_INFO.phoneClean}`}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Позвонить сейчас
                </a>
                <button
                  onClick={closeCallbackModal}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-500 dark:text-gray-200 font-medium rounded-xl text-xs transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className="space-y-3">
              {errors.general && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Topic Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-gray-300 uppercase tracking-wider mb-1">
                  1. Выберите интересующее направление
                </label>
                <div className="relative">
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full pl-3 pr-8 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 appearance-none cursor-pointer"
                  >
                    {CALLBACK_TOPICS.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.label}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                {/* Name */}
                <div>
                  <label htmlFor="callback-name" className="block text-[11px] font-semibold text-slate-500 dark:text-gray-300 mb-1">
                    Ваше имя или ФИО <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      id="callback-name"
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                      }}
                      placeholder="Иван Сергеевич"
                      className={`w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.name
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-300 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-600'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 mt-0.5">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="callback-phone" className="block text-[11px] font-semibold text-slate-500 dark:text-gray-300 mb-1">
                    Номер телефона <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      id="callback-phone"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+7 (___) ___-__-__"
                      className={`w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.phone
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-300 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-600'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 mt-0.5">{errors.phone}</p>}
                </div>

                {/* Company */}
                <div>
                  <label htmlFor="callback-company" className="block text-[11px] font-semibold text-slate-500 dark:text-gray-300 mb-1">
                    Организация <span className="text-gray-400 text-[9px]">(необязательно)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      id="callback-company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="АО «Авиакор»..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="callback-email" className="block text-[11px] font-semibold text-slate-500 dark:text-gray-300 mb-1">
                    Email <span className="text-gray-400 text-[9px]">(для КП)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      id="callback-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      placeholder="engineer@enterprise.ru"
                      className={`w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-gray-300 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-600'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
                </div>
              </div>

              {/* Time selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-blue-600" />
                  2. Когда вам перезвонить?
                </label>
                <div className="relative">
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full pl-3 pr-8 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 appearance-none cursor-pointer"
                  >
                    {CALLBACK_TIMES.map((time) => (
                      <option key={time.id} value={time.id}>
                        {time.label} {time.badge ? `(${time.badge})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="callback-comment" className="block text-[11px] font-semibold text-slate-500 dark:text-gray-300 mb-1">
                  Комментарий или задача <span className="text-gray-400 text-[9px]">(необязательно)</span>
                </label>
                <textarea
                  id="callback-comment"
                  rows={1}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Опишите деталь или станок ЧПУ..."
                  className="w-full px-4 py-1.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-y min-h-[36px]"
                />
              </div>

              {/* Consent checkbox (Strictly separate consent for 152-FZ compliance) */}
              <div className="p-2 bg-blue-50/60 dark:bg-slate-800/80 border border-blue-200/80 dark:border-slate-700 rounded-xl">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeConsent}
                    onChange={(e) => {
                      setAgreeConsent(e.target.checked);
                      if (errors.consent) setErrors(prev => ({ ...prev, consent: '' }));
                    }}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-gray-300 shrink-0"
                  />
                  <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-gray-300 leading-snug">
                    Я даю <strong>отдельное согласие</strong> на обработку моих персональных данных (ФЗ № 152-ФЗ) на серверах в РФ и принимаю условия{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsPrivacyModalOpen(true);
                      }}
                      className="text-blue-700 dark:text-blue-400 font-bold hover:underline inline"
                    >
                      Политики конфиденциальности
                    </button>
                    .
                  </span>
                </label>
                {errors.consent && <p className="text-[10px] text-red-500 mt-1 pl-5 font-medium">{errors.consent}</p>}
              </div>

              {/* Submit CTA */}
              <div className="pt-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Защита SSL • Прямая передача в CRM</span>
                </div>

                <button
                  id="submit-callback-request-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-blue-700 to-[#1E3A8A] hover:from-blue-800 hover:to-blue-900 text-white font-semibold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Регистрация в CRM...</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Заказать звонок</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
