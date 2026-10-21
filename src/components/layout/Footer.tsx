import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, ChevronRight, ChevronDown, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageId, SYSTEM_PAGE_IDS } from '../../types';
import { DEFAULT_SITE_TEXTS } from '../../data/defaultSiteTexts';
import { DsLogo } from '../common/DsLogo';

export const Footer: React.FC = () => {
  const { navigateTo, openContactModal, companyInfo, customPages, setIsPrivacyModalOpen, siteTexts, isAdmin } = useApp();
  const footerTexts = siteTexts?.footer || DEFAULT_SITE_TEXTS.footer;
  const contactTexts = siteTexts?.contacts || DEFAULT_SITE_TEXTS.contacts;

  const [openMobileAccordions, setOpenMobileAccordions] = React.useState<Record<string, boolean>>({
    software: false,
    hardware: false,
    services: false,
  });

  const toggleAccordion = (section: string) => {
    setOpenMobileAccordions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNav = (page: PageId, detailId?: string) => {
    navigateTo(page, detailId);
  };

  const footerCustomPages = customPages.filter((p) => p.showInFooter && !SYSTEM_PAGE_IDS.has(p.id));

  return (
    <footer className="relative z-10 bg-[#1E3A8A] text-gray-200 border-t-2 border-blue-800/90 shadow-2xl mt-auto overflow-hidden">
      {/* Top Banner / Call to Action in Footer (Compact) */}
      <div className="border-b border-blue-800/80 bg-gradient-to-r from-blue-950 via-[#1E3A8A] to-blue-950 py-3.5 sm:py-4">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-center md:text-left">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {footerTexts.topBannerTitle}
            </h3>
            <p className="text-blue-200 text-xs mt-0.5 max-w-2xl hidden sm:block">
              {footerTexts.topBannerSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-center">
            <button
              onClick={() => openContactModal({ title: 'Запросить консультацию инженера' })}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-sm transition-all text-xs sm:text-sm text-center cursor-pointer"
            >
              Запросить консультацию
            </button>
            <a
              href={`tel:${(contactTexts.phoneMain || companyInfo.phone).replace(/\D/g, '')}`}
              className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{contactTexts.phoneMain || companyInfo.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3.5 sm:pt-4 pb-1.5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 lg:gap-4">
          
          {/* Col 1: About & Info (span 3) */}
          <div className="xl:col-span-3 space-y-4">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="shrink-0">
                <DsLogo size={46} />
              </div>
              <div className="min-w-0">
                <span className="font-black text-white tracking-tight whitespace-nowrap block text-[clamp(14px,4.5vw,18px)]">ДС‑ИНЖИНИРИНГ</span>
                <span className="block text-[10px] sm:text-xs text-blue-200 mt-1 leading-tight">Инжиниринговые услуги и измерительное оборудование</span>
              </div>
            </div>
            <p className="text-xs text-blue-200/90 leading-relaxed pr-2">
              {footerTexts.companySlogan}
            </p>
            <div className="pt-1 space-y-2 text-xs text-blue-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Официальный дилер TopSolid SAS, HEXAGON, PMT, Shining 3D, ScanLine</span>
              </div>
              <div className="flex items-center gap-2 text-blue-300">
                <span className="font-mono">ИНН: {companyInfo.inn}</span>
                <span>•</span>
                <span className="font-mono">ОГРН: {companyInfo.ogrn}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Software (span 2) */}
          <div className="xl:col-span-2">
            <h4 className="hidden md:block text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-blue-800/50 pb-2">
              Программное обеспечение
            </h4>
            <button
              type="button"
              onClick={() => toggleAccordion('software')}
              className="md:hidden w-full flex items-center justify-between py-2.5 text-xs font-bold text-white uppercase tracking-wider border-b border-blue-800/60 transition-colors hover:text-blue-100 cursor-pointer"
              aria-expanded={openMobileAccordions.software}
            >
              <span>Программное обеспечение</span>
              <ChevronDown className={`w-4 h-4 text-blue-300 transition-transform duration-200 ${openMobileAccordions.software ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
            <div className={`${openMobileAccordions.software ? 'block' : 'hidden'} md:block pt-3 md:pt-0`}>
              <ul className="space-y-2 text-xs text-blue-200">
                <li><button onClick={() => handleNav('software', 'topsolid-7')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>TopSolid 7 (CAD/CAM/PDM)</span></button></li>
                <li><button onClick={() => handleNav('software', 'polyworks-inspector')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>PolyWorks|Inspector™</span></button></li>
                <li><button onClick={() => handleNav('software', 'geomagic-design-x')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Geomagic Design X</span></button></li>
                <li><button onClick={() => handleNav('software', 'geomagic-control-x')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Geomagic Control X</span></button></li>
                <li><button onClick={() => handleNav('software', 'shining3d-freescan')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Shining 3D FreeScan</span></button></li>
                <li><button onClick={() => handleNav('software', 'shining3d-exmodel')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Shining 3D EXModel Pro</span></button></li>
              </ul>
              <button onClick={() => handleNav('software')} className="mt-4 text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1">
                Весь каталог ПО &rarr;
              </button>
            </div>
          </div>

          {/* Col 3: Hardware (span 2) */}
          <div className="xl:col-span-2">
            <h4 className="hidden md:block text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-blue-800/50 pb-2">
              Оборудование и КИМ
            </h4>
            <button
              type="button"
              onClick={() => toggleAccordion('hardware')}
              className="md:hidden w-full flex items-center justify-between py-2.5 text-xs font-bold text-white uppercase tracking-wider border-b border-blue-800/60 transition-colors hover:text-blue-100 cursor-pointer"
              aria-expanded={openMobileAccordions.hardware}
            >
              <span>Оборудование и КИМ</span>
              <ChevronDown className={`w-4 h-4 text-blue-300 transition-transform duration-200 ${openMobileAccordions.hardware ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
            <div className={`${openMobileAccordions.hardware ? 'block' : 'hidden'} md:block pt-3 md:pt-0`}>
              <ul className="space-y-2 text-xs text-blue-200">
                <li><button onClick={() => handleNav('hardware', 'hexagon-absolute-arm-7axis')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Мобильные КИМ Hexagon ARM</span></button></li>
                <li><button onClick={() => handleNav('hardware', 'freescan-combo')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>3D-сканеры Shining 3D FreeScan</span></button></li>
                <li><button onClick={() => handleNav('hardware', 'scanline-easyscan-hx2')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Лазерные и оптические 3D-сканеры ScanLine</span></button></li>
                <li><button onClick={() => handleNav('hardware', 'pmt-future-cmm')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Стационарные КИМ PMT & Mitutoyo</span></button></li>
                <li><button onClick={() => handleNav('hardware', 'leica-at960')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Лазерные трекеры Leica Tracker</span></button></li>
              </ul>
              <button onClick={() => handleNav('hardware')} className="mt-4 text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1">
                Весь каталог оборудования &rarr;
              </button>
            </div>
          </div>

          {/* Col 4: Services (span 2) */}
          <div className="xl:col-span-2">
            <h4 className="hidden md:block text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-blue-800/50 pb-2">
              Инжиниринговые услуги
            </h4>
            <button
              type="button"
              onClick={() => toggleAccordion('services')}
              className="md:hidden w-full flex items-center justify-between py-2.5 text-xs font-bold text-white uppercase tracking-wider border-b border-blue-800/60 transition-colors hover:text-blue-100 cursor-pointer"
              aria-expanded={openMobileAccordions.services}
            >
              <span>Инжиниринговые услуги</span>
              <ChevronDown className={`w-4 h-4 text-blue-300 transition-transform duration-200 ${openMobileAccordions.services ? 'rotate-180 text-amber-400' : ''}`} />
            </button>
            <div className={`${openMobileAccordions.services ? 'block' : 'hidden'} md:block pt-3 md:pt-0`}>
              <ul className="space-y-2 text-xs text-blue-200">
                <li><button onClick={() => handleNav('services', '3d-scanning')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>3D-сканирование и оцифровка</span></button></li>
                <li><button onClick={() => handleNav('services', 'reverse-engineering')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Реверс-инжиниринг деталей (CAD)</span></button></li>
                <li><button onClick={() => handleNav('services', 'parts-inspection')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Контроль геометрии и GD&T</span></button></li>
                <li><button onClick={() => handleNav('services', 'postprocessors-dev')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Разработка постпроцессоров ЧПУ</span></button></li>
                <li><button onClick={() => handleNav('services', 'cmm-maintenance')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Сервис и поверка КИМ</span></button></li>
                <li><button onClick={() => handleNav('services', 'tooling-design')} className="hover:text-white flex items-start gap-1.5 text-left"><ChevronRight className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" /><span>Проектирование оснастки</span></button></li>
                <li><button onClick={() => handleNav('glossary')} className="hover:text-white flex items-start gap-1.5 text-left text-amber-300 font-semibold"><ChevronRight className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" /><span>Технический глоссарий (GD&T, ЧПУ)</span></button></li>
              </ul>
              <button onClick={() => handleNav('services')} className="mt-4 text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1">
                Все инженерные услуги &rarr;
              </button>
            </div>
          </div>

          {/* Col 5: Contacts (span 3) */}
          <div className="xl:col-span-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-blue-800/50 pb-2">Офисы и метрологический зал</h4>
            
            <div className="space-y-3 text-xs text-blue-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block">Самара (Главный офис):</strong>
                  <span>ул. Свободы, 198</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-white block">Тольятти (Технопарк «Жигулевская долина»):</strong>
                  <span>Офис: корп. 2.3 • Метрологический зал: корп. 3.2</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${companyInfo.phoneClean}`} className="hover:text-white font-medium">
                  {companyInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-300 shrink-0" />
                <a href={`mailto:${companyInfo.email}`} className="hover:text-white">
                  {companyInfo.email}
                </a>
              </div>
              
              <div className="pt-2">
                <a
                  href={companyInfo.vkUrl || 'https://vk.ru/ds_engineering'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#0077FF] hover:bg-[#0066CC] text-white rounded-lg text-xs font-bold transition-all border border-blue-400/30 shadow-xs hover:shadow-md max-w-full"
                >
                  <span className="w-4 h-4 rounded-xs bg-white text-[#0077FF] font-extrabold text-[9px] flex items-center justify-center shrink-0">VK</span>
                  <span className="truncate">ВКонтакте: {companyInfo.vkName || 'vk.ru/ds_engineering'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            </div>

            {/* Custom Pages in footer */}
            {footerCustomPages.length > 0 && (
              <div className="mt-4 pt-3 border-t border-blue-800/80">
                <h5 className="text-[11px] font-semibold text-white uppercase mb-2">
                  Дополнительные разделы
                </h5>
                <ul className="space-y-1.5 text-xs text-blue-200">
                  {footerCustomPages.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => handleNav(p.id as any)}
                        className="hover:text-white flex items-center gap-1 text-left"
                      >
                        <ChevronRight className="w-3 h-3 text-blue-400 shrink-0" />
                        <span>{p.menuTitle || p.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Legal & Compliance Disclosure Block (152-ФЗ, 242-ФЗ, 168-ФЗ, ЕСИА .RU) - Ultra-Compact & Elegant */}
        <div className="mt-2.5 pt-2 pb-1.5 border-t border-blue-900/70 bg-blue-950/30 rounded-lg p-2 sm:p-2.5 text-[10.5px] text-blue-200/90 leading-snug">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 text-left">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5 text-[11px] sm:text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Защита данных (152-ФЗ / 242-ФЗ)</span>
              </div>
              <p className="text-[10px] text-blue-200/80 leading-tight">
                Базы данных физически размещены в РФ. 
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="ml-1 text-[10px] text-emerald-300 hover:text-emerald-200 underline underline-offset-2 font-semibold cursor-pointer"
                >
                  Политика конфиденциальности
                </button>
              </p>
            </div>

            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5 text-[11px] sm:text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Идентификация через ЕСИА</span>
              </div>
              <p className="text-[10px] text-blue-200/80 leading-tight">
                Администратор домена <code>ds-enginering.ru</code> верифицирован через ЕСИА («Госуслуги»).
              </p>
            </div>

            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5 text-[11px] sm:text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Госреестр СИ (168-ФЗ)</span>
              </div>
              <p className="text-[10px] text-blue-200/80 leading-tight">
                Поверка в системе <a href="https://fgis.gost.ru/fundmetrology/registry/4" target="_blank" rel="noreferrer" className="text-amber-300 underline font-semibold">ФГИС «АРШИН» Росстандарта</a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Lower Bottom Bar - Ultra-Compact */}
      <div className="w-full border-t border-blue-900/80 bg-[#0c1a40] py-2 sm:py-2.5 pb-10 sm:pb-12 xl:pb-2.5">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center">
          <p className="text-[11px] sm:text-xs font-medium text-blue-200/90 tracking-wide">
            {(footerTexts.copyrightText || `© 1995 — 2026 ${companyInfo.legalName}`)
              .replace(/\.?\s*Все\s+права\s+защищены\.?/gi, '')
              .trim()}
          </p>
        </div>
      </div>
    </footer>
  );
};
