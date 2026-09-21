import { COMPANY_INFO } from '../data/mockData';

export interface StaffMember {
  fullName: string;
  shortName: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  isDirector?: boolean;
}

export const STAFF_DIRECTORY: Record<string, StaffMember> = {
  nekrasov: {
    fullName: 'Некрасов Сергей Юрьевич',
    shortName: 'Некрасов С.Ю.',
    position: 'Генеральный директор',
    department: 'Руководство компании',
    phone: '+7 (846) 954-02-92',
    email: 'info@ds-enginering.ru',
    isDirector: true,
  },
  skobelev: {
    fullName: 'Скобелев Александр Сергеевич',
    shortName: 'Скобелев А.С.',
    position: 'Инженер по ПО, ЧПУ и CAD-моделированию',
    department: 'Отдел ПО, ЧПУ и CAD-моделирования',
    phone: '+7 (937) 984-61-51',
    email: 'a.skobelev@ds-enginering.ru',
  },
  yarish_ivan: {
    fullName: 'Ярыш Иван Владимирович',
    shortName: 'Ярыш И.В.',
    position: 'Инженер-метролог',
    department: 'Метрологический отдел',
    phone: '+7 (927) 748-46-58',
    email: 'yarish@ds-enginering.ru',
  },
  yarish_alex: {
    fullName: 'Ярыш Александр Владимирович',
    shortName: 'Ярыш А.В.',
    position: 'Инженер по подбору оборудования и ПО',
    department: 'Отдел подбора оборудования и ПО',
    phone: '+7 (927) 719-06-97',
    email: 'a.yarish@ds-enginering.ru',
  },
  morozov: {
    fullName: 'Морозов Владимир Георгиевич',
    shortName: 'Морозов В.Г.',
    position: 'Руководитель КТО',
    department: 'Технологический и конструкторский отдел',
    phone: '+7 (902) 371-20-16',
    email: 'morozov@delcam-samara.ru',
  },
  accounting: {
    fullName: 'Бухгалтерия «ДС‑Инжиниринг»',
    shortName: 'Бухгалтерия',
    position: 'Бухгалтерия',
    department: 'Бухгалтерия',
    phone: '+7 (846) 954-02-92',
    email: 'buhsamara@yandex.ru',
  },
};

/**
 * Получить структурированную информацию о сотруднике, его должности и подразделении
 * в строгом соответствии со структурой и контактами ООО «ДС-Инжиниринг».
 */
export function getStaffMemberInfo(query?: string): StaffMember {
  if (!query) {
    return STAFF_DIRECTORY.skobelev;
  }
  const q = query.toLowerCase().trim();

  if (q.includes('некрасов') || q.includes('генеральн') || q.includes('директор')) {
    return STAFF_DIRECTORY.nekrasov;
  }
  if (q.includes('скобелев')) {
    return STAFF_DIRECTORY.skobelev;
  }
  if (
    q.includes('ярыш иван') || 
    q.includes('ярыш и.') || 
    q.includes('ярыш и.в') || 
    (q.includes('ярыш') && !q.includes('алекс') && !q.includes('а.в') && !q.includes('а.'))
  ) {
    return STAFF_DIRECTORY.yarish_ivan;
  }
  if (
    q.includes('ярыш алекс') || 
    q.includes('ярыш а.') || 
    q.includes('ярыш а.в')
  ) {
    return STAFF_DIRECTORY.yarish_alex;
  }
  if (q.includes('морозов')) {
    return STAFF_DIRECTORY.morozov;
  }
  if (q.includes('бухгалтер') || q.includes('buh')) {
    return STAFF_DIRECTORY.accounting;
  }

  // Дефолтный fallback
  return {
    fullName: query,
    shortName: query,
    position: 'Специалист «ДС‑Инжиниринг»',
    department: 'Отдел ПО, ЧПУ и CAD-моделирования',
    phone: COMPANY_INFO.phone,
    email: COMPANY_INFO.email,
  };
}
