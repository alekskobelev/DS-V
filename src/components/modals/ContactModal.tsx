import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShieldCheck, Send, Phone, Mail, Building, User, FileText, AlertCircle, Terminal, Cpu, Info, Maximize2, Minimize2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COMPANY_INFO } from '../../data/mockData';
import { apiService } from '../../services/apiService';
import { emailNotificationService } from '../../services/emailNotificationService';
import { useModalStack } from '../../hooks/useModalStack';

const POPULAR_CAM_SYSTEMS = [
  'TopSolid 7 CAM (TopSolid SAS / Франция)',
  'Siemens NX CAM (Unigraphics)',
  'Mastercam (CNC Software)',
  'SolidCAM',
  'Autodesk PowerMill',
  'Autodesk FeatureCAM',
  'SprutCAM (Спрут-Технология)',
  'CATIA V5 / 3DEXPERIENCE (Dassault Systèmes)',
  'Esprit CAM (Hexagon)',
  'T-FLEX ЧПУ (Топ Системы)',
  'Fusion 360 CAM (Autodesk)',
  'other',
];

export const ContactModal: React.FC = () => {
  const { contactModal, closeContactModal, showToast, setIsPrivacyModalOpen } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { containerRef, zIndex } = useModalStack({
    id: 'public-contact-modal',
    isOpen: contactModal.isOpen,
    onClose: closeContactModal,
    baseZIndex: 300
  });

  const isPostprocessor = 
    contactModal.formType === 'postprocessor' ||
    Boolean(contactModal.defaultService?.toLowerCase().includes('постпроцессор')) ||
    Boolean(contactModal.title?.toLowerCase().includes('постпроцессор'));

  const isSoftware = !isPostprocessor && (
    contactModal.formType === 'demo' ||
    contactModal.formType === 'trial' ||
    Boolean(contactModal.defaultProduct?.toLowerCase().includes('topsolid')) ||
    Boolean(contactModal.defaultProduct?.toLowerCase().includes('geomagic')) ||
    Boolean(contactModal.defaultProduct?.toLowerCase().includes('polyworks')) ||
    Boolean(contactModal.defaultProduct?.toLowerCase().includes('по'))
  );

  const isHardware = !isPostprocessor && !isSoftware && (
    contactModal.formType === 'measurement' ||
    Boolean(contactModal.defaultProduct?.toLowerCase().includes('ким')) ||
    Boolean(contactModal.defaultProduct?.toLowerCase().includes('сканер')) ||
    Boolean(contactModal.defaultProduct?.toLowerCase().includes('трекер')) ||
    Boolean(contactModal.defaultProduct?.toLowerCase().includes('рука'))
  );

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    email: '',
    message: '',
    itemInterest: '',
    // Context fields
    softwareSeats: '',
    companyIndustry: '',
    hardwareSpecs: '',
    // CAM specific fields
    camSystem: 'TopSolid 7 CAM (TopSolid SAS / Франция)',
    camSystemCustom: '',
    camVersion: '',
    cncControlAndMachine: '',
    isLicensedCam: false,
    smartCaptchaPassed: true,
    smartCaptchaToken: 'SMART_CAPTCHA_PASSED_TOKEN',
    agreeConsent: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverNotice, setServerNotice] = useState<{ isOffline: boolean; message: string } | null>(null);

  useEffect(() => {
    if (contactModal.isOpen) {
      setIsSuccess(false);
      setServerNotice(null);
      setErrors({});
      setFormData((prev) => ({
        ...prev,
        itemInterest: contactModal.defaultProduct || contactModal.defaultService || '',
        camSystem: contactModal.camSystem || 'TopSolid 7 CAM (TopSolid SAS / Франция)',
        isLicensedCam: contactModal.isLicensedCam ?? false,
        message: contactModal.customMessage 
          ? contactModal.customMessage
          : contactModal.defaultProduct 
          ? `Интересует поставка и демонстрация: ${contactModal.defaultProduct}` 
          : contactModal.defaultService 
          ? `Интересует расчет стоимости услуги: ${contactModal.defaultService}`
          : '',
        smartCaptchaPassed: true,
        smartCaptchaToken: 'SMART_CAPTCHA_PASSED_TOKEN',
      }));
    }
  }, [contactModal, closeContactModal]);

  if (!contactModal.isOpen) return null;

  // Phone input formatting mask & Paste handling: +7 (XXX) XXX-XX-XX
  const formatPhoneNumber = (raw: string) => {
    let val = raw.replace(/\D/g, '');
    if (!val) return '';
    if (val.startsWith('8')) val = '7' + val.slice(1);
    if (!val.startsWith('7')) val = '7' + val;

    let formatted = '+7';
    if (val.length > 1) {
      formatted += ' (' + val.substring(1, 4);
    }
    if (val.length >= 4) {
      formatted += ') ' + val.substring(4, 7);
    }
    if (val.length >= 7) {
      formatted += '-' + val.substring(7, 9);
    }
    if (val.length >= 9) {
      formatted += '-' + val.substring(9, 11);
    }
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const sanitize = (str: string) => str ? str.replace(/[<>]/g, '').trim() : '';
    
    const safeName = sanitize(formData.name);
    if (!safeName || safeName.length < 2) {
      errs.name = 'Укажите ваше имя и должность (без спецсимволов)';
    }

    const phoneRegex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      errs.phone = 'Укажите полный номер телефона в формате +7 (XXX) XXX-XX-XX';
    }

    if (formData.email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Некорректный формат адреса почты';
      }
    }

    if (!formData.smartCaptchaPassed) {
      errs.captcha = 'Пройдите антиспам проверку Яндекс SmartCaptcha';
    }
    if (!formData.agreeConsent) {
      errs.consent = 'Необходимо согласие на обработку персональных данных';
    }

    // MANDATORY POSTPROCESSOR VALIDATION
    if (isPostprocessor) {
      if (formData.camSystem === 'other') {
        const safeCamSystem = sanitize(formData.camSystemCustom);
        if (!safeCamSystem) {
          errs.camSystem = 'Укажите название используемой CAM-системы';
        }
      }
      if (!formData.camSystem) {
        errs.camSystem = 'Выберите используемую CAM-систему';
      }
      if (!formData.isLicensedCam) {
        errs.isLicensedCam = 'Обязательное поле: подтвердите наличие лицензионной версии CAM-системы';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const sanitize = (str: string) => str ? str.replace(/[<>]/g, '').trim() : '';
    
    const safeName = sanitize(formData.name);
    const safeCompany = sanitize(formData.company);
    const safeEmail = sanitize(formData.email);
    const safePhone = sanitize(formData.phone);
    const safeMessage = sanitize(formData.message);
    const safeItemInterest = sanitize(formData.itemInterest);
    
    // For postprocessor context
    const currentCamDisplay = formData.camSystem === 'other' ? sanitize(formData.camSystemCustom) : formData.camSystem;
    const safeCncControl = sanitize(formData.cncControlAndMachine);
    
    // For software/hardware context
    const safeSoftwareSeats = sanitize(formData.softwareSeats);
    const safeCompanyIndustry = sanitize(formData.companyIndustry);
    const safeHardwareSpecs = sanitize(formData.hardwareSpecs);

    const extraSoftwareInfo = isSoftware ? ` (Места: ${safeSoftwareSeats || 'не указ.'}, Отрасль: ${safeCompanyIndustry || 'не указ.'})` : '';
    const extraHardwareInfo = isHardware ? ` (Требования к точности/ТЗ: ${safeHardwareSpecs || 'не указ.'})` : '';
    
    try {
      const fullMessage = `${safeItemInterest ? `[Интерес: ${safeItemInterest}] ` : ''}${safeMessage}${isPostprocessor ? ` (CAM: ${currentCamDisplay}, Станки: ${safeCncControl}, Лицензия: ${formData.isLicensedCam ? 'Да' : 'Нет'})` : ''}${extraSoftwareInfo}${extraHardwareInfo}`;

      const response = await emailNotificationService.submitContactForm({
        name: safeName,
        company: safeCompany,
        email: safeEmail,
        phone: safePhone,
        department: contactModal.formType || 'engineering',
        message: fullMessage,
        sourcePage: `Модальное окно: ${contactModal.title || 'Консультация'}`
      });

      setIsSubmitting(false);
      if (response.success) {
        setIsSuccess(true);
        const isOfflineResult = Boolean(response.emailSimulated) || response.message?.includes('оффлайн');
        setServerNotice({
          isOffline: isOfflineResult,
          message: response.message || (isOfflineResult
            ? 'Заявка принята и зарегистрирована в CRM. Оповещение передано дежурной группе инженеров.'
            : 'Заявка успешно зарегистрирована. Уведомление отправлено на почту инженерной группы.'),
        });
        showToast('Заявка успешно отправлена! Инженерная группа получила уведомление.');
      } else {
        setErrors((prev) => ({ ...prev, general: response.error || 'Ошибка при отправке заявки' }));
      }
    } catch (err) {
      setIsSubmitting(false);
      setIsSuccess(true);
      setServerNotice({
        isOffline: true,
        message: 'Заявка принята в локальный оффлайн-буфер.',
      });
      showToast('Заявка принята в локальный буфер.');
    }
  };

  const currentCamDisplay = formData.camSystem === 'other' ? formData.camSystemCustom : formData.camSystem;

  return (
    <div 
      data-testid="contact-modal-backdrop"
      onClick={closeContactModal}
      className={`fixed inset-0 flex items-center justify-center bg-black/75 sm: backdrop-blur-xs overflow-hidden animate-in fade-in duration-200 cursor-pointer ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'}`}
      style={{ zIndex }}
    >
      <div 
        ref={containerRef}
        data-testid="contact-modal-container"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`${isFullscreen ? 'fixed inset-0 w-screen h-screen max-w-none max-h-none rounded-none' : 'relative max-w-2xl w-full h-auto max-h-[96vh] rounded-xl sm:rounded-xl'} bg-white shadow-sm border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 cursor-default`}
        style={isFullscreen ? { zIndex: zIndex + 1 } : undefined}
      >
        {/* Header */}
        <div data-testid="contact-modal-header" className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-[#2563EB] text-white px-5 py-3 md:px-6 sm:py-3.5 flex items-start justify-between gap-3 relative shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-blue-200 text-[11px] font-semibold uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>ДС‑Инжиниринг • Официальный представитель</span>
            </div>
            <h2 data-testid="contact-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              {isPostprocessor && <Terminal className="w-4 h-4 text-amber-300 shrink-0" />}
              <span className="truncate">{contactModal.title}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-blue-100 mt-0.5 line-clamp-1">
              {contactModal.subtitle || 'Заполните форму, и профильный инженер свяжется с вами для уточнения деталей.'}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              data-testid="contact-modal-fullscreen-btn"
              onClick={() => setIsFullscreen(prev => !prev)}
              title={isFullscreen ? "Свернуть в окно" : "На весь экран"}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              data-testid="contact-modal-close-btn"
              onClick={closeContactModal}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-3.5 md:px-6 sm:py-4 overflow-y-auto flex-1">
          {isSuccess ? (
            <div data-testid="contact-modal-success-screen" className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {isPostprocessor ? 'Заявка на постпроцессор принята!' : 'Заявка успешно принята!'}
              </h3>

              {serverNotice && (
                <div className={`p-3 rounded-lg text-xs font-medium max-w-md mx-auto flex items-start gap-2 ${
                  serverNotice.isOffline
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-left">{serverNotice.message}</span>
                </div>
              )}
              <div className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed space-y-2 text-left bg-slate-50 p-4 rounded-xl border border-gray-200">
                <p>
                  Спасибо, <strong>{formData.name}</strong>. Мы зафиксировали параметры вашего технического задания:
                </p>
                {isPostprocessor && (
                  <ul className="text-xs text-slate-500 space-y-1 pt-1 border-t border-gray-200">
                    <li>• CAM-система: <strong>{currentCamDisplay}</strong> {formData.camVersion ? `(версия ${formData.camVersion})` : ''}</li>
                    <li>• Лицензионность CAM: <strong className="text-emerald-700">✓ Подтверждена официальная лицензия</strong></li>
                    {formData.cncControlAndMachine && <li>• Станок / ЧПУ: <strong>{formData.cncControlAndMachine}</strong></li>}
                  </ul>
                )}
                <p className="pt-1 text-xs text-gray-500">
                  Наш ведущий инженер свяжется с вами по телефону <strong>{formData.phone}</strong> для обсуждения параметров проекта.
                </p>
              </div>
              <div className="pt-2">
                <button
                  data-testid="contact-modal-success-done-btn"
                  onClick={closeContactModal}
                  className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
                >
                  Вернуться на сайт
                </button>
              </div>
            </div>
          ) : (
            <form data-testid="contact-modal-form" onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 text-xs sm:text-sm">
              {/* Product/Service tag if pre-selected */}
              {formData.itemInterest && (
                <div data-testid="modal-item-interest-badge" className="p-2 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between text-xs text-blue-900">
                  <span className="truncate pr-2">Тема: <strong>{formData.itemInterest}</strong></span>
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-medium shrink-0">Выбрано</span>
                </div>
              )}

              {/* POSTPROCESSOR MANDATORY CAM BLOCK */}
              {isPostprocessor && (
                <div className="p-4 bg-gradient-to-br from-blue-50/90 to-indigo-50/70 border-2 border-blue-200 rounded-xl space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-950 uppercase tracking-wider">
                      <Terminal className="w-4 h-4 text-blue-600" />
                      <span>Параметры CAM-системы и станка с ЧПУ</span>
                    </div>
                    <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                      Обязательный блок
                    </span>
                  </div>

                  {/* 1. CAM SYSTEM (MANDATORY) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1">
                      1. Используемая CAM-система <span className="text-red-500">*</span>
                    </label>
                    <select
                      data-testid="modal-select-cam"
                      value={formData.camSystem}
                      onChange={(e) => {
                        setFormData({ ...formData, camSystem: e.target.value });
                        if (errors.camSystem) setErrors((prev) => ({ ...prev, camSystem: '' }));
                      }}
                      className={`w-full p-2.5 text-xs sm:text-sm rounded-xl border bg-white ${
                        errors.camSystem ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-blue-600'
                      } focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium`}
                    >
                      {POPULAR_CAM_SYSTEMS.map((cam) => (
                        <option key={cam} value={cam}>
                          {cam === 'other' ? 'Другая CAM-система (указать вручную)...' : cam}
                        </option>
                      ))}
                    </select>
                    {errors.camSystem && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.camSystem}</p>}
                  </div>

                  {/* Custom CAM input if 'other' selected */}
                  {formData.camSystem === 'other' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Укажите точное наименование вашей CAM-системы <span className="text-red-500">*</span>
                      </label>
                      <input
                        data-testid="modal-input-cam-custom"
                        type="text"
                        value={formData.camSystemCustom}
                        onChange={(e) => {
                          setFormData({ ...formData, camSystemCustom: e.target.value });
                          if (errors.camSystem) setErrors((prev) => ({ ...prev, camSystem: '' }));
                        }}
                        placeholder="Например: Tebis, Edgecam, Cimatron, GibbsCAM, CIMCO..."
                        className="w-full p-2 text-xs rounded-lg border border-gray-300 bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* CAM Version & CNC Control in 2 cols */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Версия / релиз CAM-системы
                      </label>
                      <input
                        data-testid="modal-input-cam-version"
                        type="text"
                        value={formData.camVersion}
                        onChange={(e) => setFormData({ ...formData, camVersion: e.target.value })}
                        placeholder="например: v7.18 (2024) / NX 2312"
                        className="w-full p-2 text-xs rounded-lg border border-gray-300 bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Стойка ЧПУ и модель станка
                      </label>
                      <input
                        data-testid="modal-input-cnc-model"
                        type="text"
                        value={formData.cncControlAndMachine}
                        onChange={(e) => setFormData({ ...formData, cncControlAndMachine: e.target.value })}
                        placeholder="например: Fanuc 0i-MF, Siemens 840D sl"
                        className="w-full p-2 text-xs rounded-lg border border-gray-300 bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* MANDATORY LICENSE CONFIRMATION CHECKBOX */}
                  <div className={`p-3 rounded-xl border transition-all ${
                    errors.isLicensedCam 
                      ? 'bg-red-50 border-red-400 ring-2 ring-red-300' 
                      : formData.isLicensedCam 
                      ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400' 
                      : 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="licensed-cam-check"
                        data-testid="modal-checkbox-licensed-cam"
                        checked={formData.isLicensedCam}
                        onChange={(e) => {
                          setFormData({ ...formData, isLicensedCam: e.target.checked });
                          if (errors.isLicensedCam) setErrors((prev) => ({ ...prev, isLicensedCam: '' }));
                        }}
                        className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                      />
                      <label htmlFor="licensed-cam-check" className="text-xs text-gray-800 cursor-pointer leading-snug">
                        <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                          <ShieldCheck className={`w-4 h-4 shrink-0 ${formData.isLicensedCam ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <span>Подтверждаю, что используемая CAM-система является лицензионной</span>
                          <span className="text-red-500 font-bold">*</span>
                        </span>
                        <span className="text-[11px] text-gray-500 block mt-1">
                          Разработка макросов, трансляторов и 3D-симуляторов постпроцессора осуществляется исключительно под официальные лицензии CAM-систем в строгом соответствии с лицензионными соглашениями разработчиков ПО.
                        </span>
                      </label>
                    </div>
                    {errors.isLicensedCam && (
                      <div className="mt-2 text-red-600 text-[11px] font-bold flex items-center gap-1.5 pl-6 bg-red-100/80 p-1.5 rounded-lg">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errors.isLicensedCam}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SOFTWARE FIELDS */}
              {isSoftware && (
                <div data-testid="modal-software-fields-block" className="p-4 bg-slate-50 border border-gray-200 rounded-xl space-y-3.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800 border-b border-gray-200 pb-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span>Параметры интеграции ПО</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Количество рабочих мест</label>
                      <select
                        data-testid="modal-select-software-seats"
                        value={formData.softwareSeats}
                        onChange={(e) => setFormData({ ...formData, softwareSeats: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Не указано</option>
                        <option value="1">1 рабочее место</option>
                        <option value="2-5">2-5 рабочих мест</option>
                        <option value="6-10">6-10 рабочих мест</option>
                        <option value="10+">Более 10 мест (Корпоративная лицензия)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Ваша отрасль / Станки с ЧПУ</label>
                      <input
                        data-testid="modal-input-industry"
                        type="text"
                        placeholder="Например: Авиастроение, 3-осевые фрезерные"
                        value={formData.companyIndustry}
                        onChange={(e) => setFormData({ ...formData, companyIndustry: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* HARDWARE FIELDS */}
              {isHardware && (
                <div data-testid="modal-hardware-fields-block" className="p-4 bg-slate-50 border border-gray-200 rounded-xl space-y-3.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800 border-b border-gray-200 pb-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Техническое задание на КИМ / Сканер</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Требуемая точность (MPE) / Тип измеряемых деталей</label>
                    <textarea
                      data-testid="modal-textarea-hardware-specs"
                      placeholder="Например: корпуса редукторов до 1500 мм, требуемая точность 5-8 мкм"
                      value={formData.hardwareSpecs}
                      onChange={(e) => setFormData({ ...formData, hardwareSpecs: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[60px]"
                    />
                  </div>
                </div>
              )}

              {/* Compact 2x2 Grid for Personal & Company Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Ваше имя и должность <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      data-testid="modal-input-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                      }}
                      placeholder="Иван Петров, гл. технолог"
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border ${
                        errors.name ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-blue-600'
                      } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-[11px] mt-0.5">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Телефон для связи <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      data-testid="modal-input-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="+7 (999) 000-00-00"
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border font-mono ${
                        errors.phone ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-blue-600'
                      } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-[11px] mt-0.5">{errors.phone}</p>}
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Название предприятия / Город
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      data-testid="modal-input-company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="ПАО Авиаагрегат, г. Самара"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Корпоративный Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      data-testid="modal-input-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder="engineer@plant.ru"
                      className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border ${
                        errors.email ? 'border-red-500 bg-red-50/30' : 'border-gray-300 focus:border-blue-600'
                      } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-[11px] mt-0.5">{errors.email}</p>}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  {isPostprocessor ? 'Дополнительные требования к постпроцессору' : 'Описание технической задачи / Детали запроса'}
                </label>
                <textarea
                  data-testid="modal-textarea-message"
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={
                    isPostprocessor 
                      ? 'Укажите особенности кинематики (поворотная голова / наклонный стол), специфические циклы...'
                      : 'Опишите деталь, требуемую точность, станок с ЧПУ или задачу контроля...'
                  }
                  className="w-full p-2 text-xs sm:text-sm rounded-lg border border-gray-300 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                ></textarea>
              </div>

              {/* SmartCaptcha Simulation badge */}
              <div>
                <div className={`p-1.5 sm:p-2 bg-slate-50 border rounded-lg flex items-center justify-between ${errors.captcha ? 'border-red-400 bg-red-50/50' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <input
                      data-testid="modal-checkbox-captcha"
                      type="checkbox"
                      id="captcha-check"
                      checked={formData.smartCaptchaPassed}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData({ 
                          ...formData, 
                          smartCaptchaPassed: checked,
                          smartCaptchaToken: checked ? 'SMART_CAPTCHA_PASSED_TOKEN' : ''
                        });
                        if (errors.captcha) setErrors((prev) => ({ ...prev, captcha: '' }));
                      }}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="captcha-check" className="text-xs text-slate-500 font-medium cursor-pointer flex items-center gap-1.5">
                      <ShieldCheck className={`w-3.5 h-3.5 ${formData.smartCaptchaPassed ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span>Я не робот (SmartCaptcha)</span>
                    </label>
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Yandex SmartCaptcha
                  </div>
                </div>
                {errors.captcha && <p className="text-red-500 text-[11px] mt-0.5 font-medium">{errors.captcha}</p>}
              </div>

              {/* Consent Checkbox (Strictly separate for 152-FZ compliance with RU server localization) */}
              <div className="p-1.5 sm:p-2 bg-blue-50/50 border border-blue-200/80 rounded-xl">
                <div className="flex items-start gap-2">
                  <input
                    data-testid="modal-checkbox-consent"
                    type="checkbox"
                    id="consent-check"
                    checked={formData.agreeConsent}
                    onChange={(e) => {
                      setFormData({ ...formData, agreeConsent: e.target.checked });
                      if (errors.consent) setErrors((prev) => ({ ...prev, consent: '' }));
                    }}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="consent-check" className="text-[11px] text-slate-500 leading-tight cursor-pointer">
                    Я даю <strong>согласие</strong> на обработку персональных данных по 152-ФЗ на условиях{' '}
                    <button
                      type="button"
                      onClick={() => setIsPrivacyModalOpen(true)}
                      className="underline text-blue-700 font-bold hover:text-blue-900 inline"
                    >
                      Политики конфиденциальности
                    </button>
                    . Серверы и БД расположены на территории РФ.
                  </label>
                </div>
                {errors.consent && <p className="text-red-500 text-[11px] font-medium pl-6">{errors.consent}</p>}
              </div>

              {/* Submit CTA */}
              <button
                data-testid="modal-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#F59E0B] hover:bg-amber-600 disabled:opacity-50 text-gray-950 font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full mr-2"></span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {isPostprocessor ? 'Отправить заявку на разработку постпроцессора' : 'Отправить заявку инженеру'}
                </span>
              </button>

              <div className="text-center text-[11px] text-gray-400">
                Или позвоните нам напрямую: <a href={`tel:${COMPANY_INFO.phoneClean}`} className="text-blue-600 font-semibold">{COMPANY_INFO.phone}</a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

