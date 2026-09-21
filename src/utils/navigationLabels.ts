import { PageId } from '../types';

export function getSoftwareCategoryLabel(cat: string): string {
  switch (cat.toLowerCase()) {
    case 'topsolid':
      return 'TopSolid 7 (CAD/CAM/PDM)';
    case 'polyworks':
      return 'PolyWorks|Inspector (Метрология & КИМ)';
    case 'geomagic':
      return 'HEXAGON Geomagic (Design X / Control X)';
    case 'shining3d':
    case 'shining3d-sw':
      return 'Shining 3D Software';
    case 'cad':
      return 'CAD-системы';
    case 'cam':
      return 'CAM-системы и ЧПУ';
    case 'pdm':
      return 'PDM-системы';
    case 'tooling':
      return 'Проектирование оснастки и пресс-форм';
    default:
      return cat;
  }
}

export function getHardwareCategoryLabel(cat: string): string {
  switch (cat.toLowerCase()) {
    case 'tech-laser':
    case 'scanners':
    case 'scanner':
      return 'Лазерные 3D-сканеры';
    case 'tech-optical':
      return 'Оптические 3D-сканеры';
    case 'tech-hybrid':
      return 'Гибридные 3D-сканеры';
    case 'tech-cmm':
    case 'cmm':
    case 'stationary_cmm':
      return 'Стационарные КИМ';
    case 'tech-mobile':
    case 'arms':
    case 'mobile_cmm':
      return 'Мобильные КИМ (Измерительные руки)';
    case 'tech-trackers':
    case 'trackers':
      return 'Лазерные трекеры';
    default:
      if (cat.toLowerCase().startsWith('brand-')) {
        const brand = cat.replace(/^brand-/i, '').toUpperCase();
        return `Оборудование ${brand}`;
      }
      return cat;
  }
}

export function getKnowledgeCategoryLabel(cat: string): string {
  switch (cat.toLowerCase()) {
    case 'software':
    case 'по':
    case 'программное обеспечение':
      return 'Программное обеспечение';
    case 'hardware':
    case 'оборудование':
    case 'метрологическое оборудование':
      return 'Метрологическое оборудование';
    case 'services':
    case 'услуги':
    case 'услуги и методики':
      return 'Инжиниринговые услуги';
    case 'postprocessors':
    case 'постпроцессоры':
    case 'разработка постпроцессоров':
      return 'Разработка постпроцессоров';
    case 'faq':
    case 'общие вопросы':
    case 'частые вопросы (faq)':
      return 'Частые вопросы (FAQ)';
    default:
      return cat;
  }
}

export function getPageTitle(page: PageId, isAdmin = false): string {
  switch (page) {
    case 'home':
      return 'Главная страница';
    case 'software':
      return 'Программное обеспечение';
    case 'hardware':
      return 'Измерительное оборудование';
    case 'services':
      return 'Инжиниринговые услуги';
    case 'knowledge':
      return 'База знаний и руководства';
    case 'news':
      return 'Новости и статьи';
    case 'about':
      return 'О компании «ДС‑Инжиниринг»';
    case 'contacts':
      return 'Контакты и филиалы';
    case 'account':
      return isAdmin ? 'Личный кабинет администратора' : 'Личный кабинет заказчика';
    case 'cms':
      return 'Панель управления (CMS)';
    case 'crm':
      return 'Система управления сделками (CRM)';
    case 'notfound':
      return 'Страница не найдена';
    default:
      return page;
  }
}

export function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 30) return 'только что';
  if (diffSec < 60) return `${diffSec} сек назад`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    if (diffMin === 1) return '1 минуту назад';
    if (diffMin >= 2 && diffMin <= 4) return `${diffMin} минуты назад`;
    return `${diffMin} минут назад`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    if (diffHours === 1) return '1 час назад';
    if (diffHours >= 2 && diffHours <= 4) return `${diffHours} часа назад`;
    return `${diffHours} часов назад`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'вчера';
  if (diffDays >= 2 && diffDays <= 4) return `${diffDays} дня назад`;
  return `${diffDays} дней назад`;
}
