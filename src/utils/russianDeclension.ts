/**
 * Утилита алгоритмического склонения и форматирования ФИО и должностей на русском языке.
 * Поддерживает канонические падежи (именительный, родительный, дательный, творительный)
 * и форматы инициалов («Фамилия И.О.», «И.О. Фамилия», «Полное ФИО»).
 */

export interface DeclinedNameResult {
  source: string;
  gender: 'М' | 'Ж' | 'UNDEFINED';
  nominative: string;
  genitive: string;
  dative: string;
  ablative: string; // творительный
  surnameInitials: string; // Иванов И.И.
  initialsSurname: string; // И.И. Иванов
  genSurnameInitials?: string; // Иванова И.И.
  datSurnameInitials?: string; // Иванову И.И.
  surname: string;
  name: string;
  patronymic: string;
}

export interface DeclinedLeaderResult extends DeclinedNameResult {
  postNominative: string;
  postGenitive: string;
  postDative: string;
  representativeGenitive: string; // "в лице Генерального директора Иванова Ивана Ивановича"
  declinedPositionFio: string; // "Генеральному директору Иванову И.И."
  greeting: string; // "Уважаемый Иван Иванович!"
}

/**
 * Определение грамматического пола по окончанию отчества/имени/фамилии
 */
export function detectRussianGender(surname: string, name: string, patronymic: string): 'М' | 'Ж' | 'UNDEFINED' {
  const pLower = (patronymic || '').toLowerCase().trim();
  if (pLower.endsWith('ич') || pLower.endsWith('ыч')) return 'М';
  if (pLower.endsWith('на')) return 'Ж';

  const sLower = (surname || '').toLowerCase().trim();
  if (sLower.endsWith('ова') || sLower.endsWith('ева') || sLower.endsWith('ина') || sLower.endsWith('ая')) return 'Ж';
  if (sLower.endsWith('ов') || sLower.endsWith('ев') || sLower.endsWith('ин') || sLower.endsWith('ий') || sLower.endsWith('ый')) return 'М';

  const nLower = (name || '').toLowerCase().trim();
  if (['илья', 'никита', 'данила', 'лука', 'фома', 'юрий', 'андрей', 'сергей', 'алексей'].includes(nLower)) return 'М';
  if (nLower.endsWith('а') || nLower.endsWith('я')) return 'Ж';

  return 'UNDEFINED';
}

/**
 * Склонение русской фамилии
 */
export function declineSurname(surname: string, gender: 'М' | 'Ж' | 'UNDEFINED', targetCase: 'gen' | 'dat' | 'abl'): string {
  if (!surname) return '';
  const s = surname.trim();
  const lower = s.toLowerCase();

  // Несклоняемые фамилии (на -о, -е, -и, -у, -ю, -ых, -их)
  if (/(?:[оеиую]|ых|их)$/i.test(lower)) {
    return s;
  }

  if (gender === 'Ж') {
    if (lower.endsWith('ая')) {
      if (targetCase === 'gen' || targetCase === 'dat' || targetCase === 'abl') {
        return s.slice(0, -2) + (s.endsWith('АЯ') ? 'ОЙ' : 'ой');
      }
    }
    if (lower.endsWith('а')) {
      if (targetCase === 'gen' || targetCase === 'dat' || targetCase === 'abl') {
        return s.slice(0, -1) + (s.endsWith('А') ? 'ОЙ' : 'ой');
      }
    }
    // Женские фамилии на согласный не склоняются (напр. Анна Коваль)
    return s;
  }

  // Мужской род или по умолчанию
  if (lower.endsWith('ов') || lower.endsWith('ев') || lower.endsWith('ин') || lower.endsWith('ын')) {
    if (targetCase === 'gen') return s + (s === s.toUpperCase() ? 'А' : 'а');
    if (targetCase === 'dat') return s + (s === s.toUpperCase() ? 'У' : 'у');
    if (targetCase === 'abl') return s + (s === s.toUpperCase() ? 'ЫМ' : 'ым');
  }

  if (lower.endsWith('ий') || lower.endsWith('ый')) {
    const base = s.slice(0, -2);
    const isUpper = s === s.toUpperCase();
    if (targetCase === 'gen') return base + (isUpper ? 'ОГО' : 'ого');
    if (targetCase === 'dat') return base + (isUpper ? 'ОМУ' : 'ому');
    if (targetCase === 'abl') return base + (isUpper ? 'ИМ' : 'им');
  }

  if (lower.endsWith('ь')) {
    const base = s.slice(0, -1);
    if (targetCase === 'gen') return base + 'я';
    if (targetCase === 'dat') return base + 'ю';
    if (targetCase === 'abl') return base + 'ем';
  }

  if (/[бвгджзклмнпрстфхцчшщ]$/i.test(lower)) {
    if (targetCase === 'gen') return s + (s === s.toUpperCase() ? 'А' : 'а');
    if (targetCase === 'dat') return s + (s === s.toUpperCase() ? 'У' : 'у');
    if (targetCase === 'abl') return s + (s === s.toUpperCase() ? 'ОМ' : 'ом');
  }

  return s;
}

/**
 * Склонение русского имени
 */
export function declineFirstName(name: string, gender: 'М' | 'Ж' | 'UNDEFINED', targetCase: 'gen' | 'dat' | 'abl'): string {
  if (!name) return '';
  const n = name.trim();
  const lower = n.toLowerCase();

  if (gender === 'Ж') {
    if (lower.endsWith('ия')) {
      const base = n.slice(0, -2);
      if (targetCase === 'gen' || targetCase === 'dat') return base + 'ии';
      if (targetCase === 'abl') return base + 'ией';
    }
    if (lower.endsWith('а')) {
      const base = n.slice(0, -1);
      const isHissing = /[гкхжчшщ]$/i.test(base);
      if (targetCase === 'gen') return base + (isHissing ? 'и' : 'ы');
      if (targetCase === 'dat') return base + 'е';
      if (targetCase === 'abl') return base + 'ой';
    }
    if (lower.endsWith('я')) {
      const base = n.slice(0, -1);
      if (targetCase === 'gen') return base + 'и';
      if (targetCase === 'dat') return base + 'е';
      if (targetCase === 'abl') return base + 'ей';
    }
    if (lower.endsWith('ь')) {
      const base = n.slice(0, -1);
      if (targetCase === 'gen' || targetCase === 'dat') return base + 'и';
      if (targetCase === 'abl') return base + 'ью';
    }
    return n;
  }

  // Мужские имена
  if (lower === 'павел') {
    if (targetCase === 'gen') return 'Павла';
    if (targetCase === 'dat') return 'Павлу';
    if (targetCase === 'abl') return 'Павлом';
  }
  if (lower === 'лев') {
    if (targetCase === 'gen') return 'Льва';
    if (targetCase === 'dat') return 'Льву';
    if (targetCase === 'abl') return 'Львом';
  }
  if (lower === 'петр' || lower === 'пётр') {
    if (targetCase === 'gen') return 'Петра';
    if (targetCase === 'dat') return 'Петру';
    if (targetCase === 'abl') return 'Петром';
  }

  if (lower.endsWith('ий')) {
    const base = n.slice(0, -2);
    if (targetCase === 'gen') return base + 'ия';
    if (targetCase === 'dat') return base + 'ию';
    if (targetCase === 'abl') return base + 'ием';
  }
  if (lower.endsWith('й')) {
    const base = n.slice(0, -1);
    if (targetCase === 'gen') return base + 'я';
    if (targetCase === 'dat') return base + 'ю';
    if (targetCase === 'abl') return base + 'ем';
  }
  if (lower.endsWith('ь')) {
    const base = n.slice(0, -1);
    if (targetCase === 'gen') return base + 'я';
    if (targetCase === 'dat') return base + 'ю';
    if (targetCase === 'abl') return base + 'ем';
  }
  if (lower.endsWith('а')) {
    const base = n.slice(0, -1);
    if (targetCase === 'gen') return base + 'ы';
    if (targetCase === 'dat') return base + 'е';
    if (targetCase === 'abl') return base + 'ой';
  }
  if (lower.endsWith('я')) {
    const base = n.slice(0, -1);
    if (targetCase === 'gen') return base + 'и';
    if (targetCase === 'dat') return base + 'е';
    if (targetCase === 'abl') return base + 'ей';
  }
  if (/[бвгджзклмнпрстфхцчшщ]$/i.test(lower)) {
    if (targetCase === 'gen') return n + 'а';
    if (targetCase === 'dat') return n + 'у';
    if (targetCase === 'abl') return n + 'ом';
  }

  return n;
}

/**
 * Склонение русского отчества
 */
export function declinePatronymic(patronymic: string, gender: 'М' | 'Ж' | 'UNDEFINED', targetCase: 'gen' | 'dat' | 'abl'): string {
  if (!patronymic) return '';
  const p = patronymic.trim();
  const lower = p.toLowerCase();

  if (gender === 'Ж' || lower.endsWith('на')) {
    const base = p.slice(0, -1);
    if (targetCase === 'gen' || targetCase === 'dat') return base + 'ы';
    if (targetCase === 'abl') return base + 'ой';
    return p;
  }

  if (lower.endsWith('ич') || lower.endsWith('ыч')) {
    if (targetCase === 'gen') return p + 'а';
    if (targetCase === 'dat') return p + 'у';
    if (targetCase === 'abl') return p + 'ем';
  }

  return p;
}

/**
 * Склонение должности руководителя
 */
export function declineLeaderPosition(post: string, targetCase: 'gen' | 'dat' | 'abl' = 'gen'): string {
  if (!post) return 'Генерального директора';
  const clean = post.trim();
  const lower = clean.toLowerCase();

  // Распространенные должности
  if (lower.includes('генеральный директор') || lower.includes('гендиректор')) {
    if (targetCase === 'gen') return clean.replace(/генеральный\s+директор/i, 'Генерального директора').replace(/гендиректор/i, 'Гендиректора');
    if (targetCase === 'dat') return clean.replace(/генеральный\s+директор/i, 'Генеральному директору');
    if (targetCase === 'abl') return clean.replace(/генеральный\s+директор/i, 'Генеральным директором');
  }

  if (lower.includes('исполнительный директор')) {
    if (targetCase === 'gen') return clean.replace(/исполнительный\s+директор/i, 'Исполнительного директора');
    if (targetCase === 'dat') return clean.replace(/исполнительный\s+директор/i, 'Исполнительному директору');
    if (targetCase === 'abl') return clean.replace(/исполнительный\s+директор/i, 'Исполнительным директором');
  }

  if (lower.includes('управляющий директор')) {
    if (targetCase === 'gen') return clean.replace(/управляющий\s+директор/i, 'Управляющего директора');
    if (targetCase === 'dat') return clean.replace(/управляющий\s+директор/i, 'Управляющему директору');
    if (targetCase === 'abl') return clean.replace(/управляющий\s+директор/i, 'Управляющим директором');
  }

  if (lower.startsWith('директор')) {
    if (targetCase === 'gen') return clean.replace(/^директор/i, 'Директора');
    if (targetCase === 'dat') return clean.replace(/^директор/i, 'Директору');
    if (targetCase === 'abl') return clean.replace(/^директор/i, 'Директором');
  }

  if (lower.startsWith('президент')) {
    if (targetCase === 'gen') return clean.replace(/^президент/i, 'Президента');
    if (targetCase === 'dat') return clean.replace(/^президент/i, 'Президенту');
    if (targetCase === 'abl') return clean.replace(/^президент/i, 'Президентом');
  }

  if (lower.startsWith('главный инженер')) {
    if (targetCase === 'gen') return clean.replace(/^главный\s+инженер/i, 'Главного инженера');
    if (targetCase === 'dat') return clean.replace(/^главный\s+инженер/i, 'Главному инженеру');
    if (targetCase === 'abl') return clean.replace(/^главный\s+инженер/i, 'Главным инженером');
  }

  return clean;
}

/**
 * Комплексный парсинг и склонение ФИО
 */
export function parseAndDeclineFio(fullName: string): DeclinedNameResult {
  const clean = (fullName || '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);

  let surname = parts[0] || '';
  let name = parts[1] || '';
  let patronymic = parts[2] || '';

  const gender = detectRussianGender(surname, name, patronymic);

  const genSurname = declineSurname(surname, gender, 'gen');
  const genName = declineFirstName(name, gender, 'gen');
  const genPatronymic = declinePatronymic(patronymic, gender, 'gen');

  const datSurname = declineSurname(surname, gender, 'dat');
  const datName = declineFirstName(name, gender, 'dat');
  const datPatronymic = declinePatronymic(patronymic, gender, 'dat');

  const ablSurname = declineSurname(surname, gender, 'abl');
  const ablName = declineFirstName(name, gender, 'abl');
  const ablPatronymic = declinePatronymic(patronymic, gender, 'abl');

  const firstInit = name ? `${name[0].toUpperCase()}.` : '';
  const midInit = patronymic ? `${patronymic[0].toUpperCase()}.` : '';
  const initials = `${firstInit}${midInit}`.trim();

  const surnameInitials = initials ? `${surname} ${initials}` : surname;
  const initialsSurname = initials ? `${initials} ${surname}` : surname;
  const genSurnameInitials = initials ? `${genSurname} ${initials}` : genSurname;
  const datSurnameInitials = initials ? `${datSurname} ${initials}` : datSurname;

  return {
    source: clean,
    gender,
    nominative: clean,
    genitive: [genSurname, genName, genPatronymic].filter(Boolean).join(' '),
    dative: [datSurname, datName, datPatronymic].filter(Boolean).join(' '),
    ablative: [ablSurname, ablName, ablPatronymic].filter(Boolean).join(' '),
    surnameInitials,
    initialsSurname,
    genSurnameInitials,
    datSurnameInitials,
    surname,
    name,
    patronymic
  };
}

/**
 * Комплексное форматирование руководителя организации для договоров и КП
 */
export function formatRussianLeaderDetails(name: string, post: string = 'Генеральный директор'): DeclinedLeaderResult {
  const fio = parseAndDeclineFio(name);
  const postGen = declineLeaderPosition(post, 'gen');
  const postDat = declineLeaderPosition(post, 'dat');
  const postNom = post.trim() || 'Генеральный директор';

  const representativeGenitive = `в лице ${postGen} ${fio.genitive}`.trim();
  const declinedPositionFio = `${postDat} ${fio.datSurnameInitials || fio.dative}`.trim();
  const greeting = fio.name && fio.patronymic 
    ? `Уважаемый ${fio.name} ${fio.patronymic}!`
    : (fio.name ? `Уважаемый ${fio.name}!` : `Уважаемый руководитель!`);

  return {
    ...fio,
    postNominative: postNom,
    postGenitive: postGen,
    postDative: postDat,
    representativeGenitive,
    declinedPositionFio,
    greeting
  };
}
