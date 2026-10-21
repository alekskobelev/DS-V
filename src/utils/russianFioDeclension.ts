/**
 * Russian FIO and Job Position Declension & Formatting Engine
 * Supports:
 * - Dative (Кому?), Genitive (Кого?), Ablative (Кем?)
 * - Full name (Именительный / Дательный)
 * - Initials: "А.В. Затворницкий", "Затворницкий А.В."
 * - Formal Greetings: "Уважаемый Андрей Владимирович!", "Уважаемая Раиса!"
 * - Customer Signature Blocks (Приложение №1 ТЗ, Спецификация, ТКП)
 * ООО «ДС-Инжиниринг»
 */

export interface ParsedFio {
  surname: string;
  name: string;
  patronymic: string;
  gender: 'male' | 'female';
  // Formats
  fullNameNominative: string; // Затворницкий Андрей Владимирович
  fullNameDative: string;     // Затворницкому Андрею Владимировичу
  fullNameGenitive: string;   // Затворницкого Андрея Владимировича
  fullNameAblative: string;   // Затворницким Андреем Владимировичем
  // Initials
  initialsSurnameNominative: string; // А.В. Затворницкий
  surnameInitialsNominative: string; // Затворницкий А.В.
  initialsSurnameDative: string;     // А.В. Затворницкому
  surnameInitialsDative: string;     // Затворницкому А.В.
  initialsSurnameGenitive: string;   // А.В. Затворницкого
  surnameInitialsGenitive: string;   // Затворницкого А.В.
  initialsSurnameAblative: string;   // А.В. Затворницким
  surnameInitialsAblative: string;   // Затворницким А.В.
  shortName: string;                 // Андрей Владимирович / Раиса
  greeting: string;                  // Уважаемый Андрей Владимирович! / Уважаемая Раиса!
}

/**
 * Determine gender from patronymic, first name or surname
 */
export function detectRussianGender(surname: string, name: string, patronymic: string): 'male' | 'female' {
  const p = patronymic.toLowerCase().trim();
  if (/(овна|евна|ична|инична)$/.test(p)) return 'female';
  if (/(ович|евич|ич)$/.test(p)) return 'male';

  const n = name.toLowerCase().trim();
  if (/(а|я|ия)$/.test(n) && !['илья', 'никита', 'данила', 'лука', 'фома', 'кузьма'].includes(n)) {
    return 'female';
  }

  const s = surname.toLowerCase().trim();
  if (/(ова|ева|ина|ына|ская|цкая|ая)$/.test(s)) return 'female';

  return 'male';
}

/**
 * Declines a single Russian surname into cases
 */
export function declineSurname(surname: string, gender: 'male' | 'female'): {
  nominative: string;
  dative: string;
  genitive: string;
  ablative: string;
} {
  const s = surname.trim();
  if (!s) return { nominative: '', dative: '', genitive: '', ablative: '' };

  const lower = s.toLowerCase();

  // Non-declining endings (-о, -е, -и, -у, -ю, -ы, -их, -ых, -ко, e.g. Шевченко, Седых)
  if (/(о|е|и|у|ю|ы|ко|их|ых)$/i.test(s)) {
    return { nominative: s, dative: s, genitive: s, ablative: s };
  }

  if (gender === 'female') {
    // -ова, -ева, -ина, -ына -> -овой, -евой, -иной, -ыной
    if (/(ова|ева|ина|ына)$/i.test(s)) {
      const base = s.slice(0, -1);
      return {
        nominative: s,
        dative: base + 'ой',
        genitive: base + 'ой',
        ablative: base + 'ой'
      };
    }
    // -ская, -цкая, -ая, -яя -> -ской, -цкой, -ой, -ей
    if (/(ская|цкая)$/i.test(s)) {
      const base = s.slice(0, -2);
      return {
        nominative: s,
        dative: base + 'ой',
        genitive: base + 'ой',
        ablative: base + 'ой'
      };
    }
    if (/ая$/i.test(s)) {
      const base = s.slice(0, -2);
      return {
        nominative: s,
        dative: base + 'ой',
        genitive: base + 'ой',
        ablative: base + 'ой'
      };
    }
    // Female surnames ending in consonant do not decline (e.g. Анна Шмидт)
    return { nominative: s, dative: s, genitive: s, ablative: s };
  }

  // MALE
  // -ский, -цкий, -ий, -ый, -ой
  if (/(ский|цкий)$/i.test(s)) {
    const base = s.slice(0, -2);
    return {
      nominative: s,
      dative: base + 'ому',
      genitive: base + 'ого',
      ablative: base + 'им'
    };
  }
  if (/ый$/i.test(s)) {
    const base = s.slice(0, -2);
    return {
      nominative: s,
      dative: base + 'ому',
      genitive: base + 'ого',
      ablative: base + 'ым'
    };
  }
  if (/ой$/i.test(s)) {
    const base = s.slice(0, -2);
    return {
      nominative: s,
      dative: base + 'ому',
      genitive: base + 'ого',
      ablative: base + 'ым'
    };
  }

  // -ов, -ев, -ин, -ын
  if (/(ов|ев|ин|ын)$/i.test(s)) {
    return {
      nominative: s,
      dative: s + 'у',
      genitive: s + 'а',
      ablative: s + 'ым'
    };
  }

  // Surnames ending in soft sign -ь (e.g. Коваль, Бондарь)
  if (/ь$/i.test(s)) {
    const base = s.slice(0, -1);
    return {
      nominative: s,
      dative: base + 'ю',
      genitive: base + 'я',
      ablative: base + 'ем'
    };
  }

  // Surnames ending in hard consonant (e.g. Ярыш -> Ярышу, Кот -> Коту, Блок -> Блоку)
  if (/[бвгджзклмнпрстфхцчшщ]$/i.test(s)) {
    return {
      nominative: s,
      dative: s + 'у',
      genitive: s + 'а',
      ablative: s + 'ом'
    };
  }

  return { nominative: s, dative: s, genitive: s, ablative: s };
}

/**
 * Declines a Russian first name
 */
export function declineFirstName(name: string, gender: 'male' | 'female'): {
  nominative: string;
  dative: string;
  genitive: string;
  ablative: string;
} {
  const n = name.trim();
  if (!n) return { nominative: '', dative: '', genitive: '', ablative: '' };

  const lower = n.toLowerCase();

  // Exceptions
  if (lower === 'лев') {
    return { nominative: n, dative: 'Льву', genitive: 'Льва', ablative: 'Львом' };
  }
  if (lower === 'павел') {
    return { nominative: n, dative: 'Павлу', genitive: 'Павла', ablative: 'Павлом' };
  }
  if (lower === 'петр' || lower === 'пётр') {
    return { nominative: n, dative: 'Петру', genitive: 'Петра', ablative: 'Петром' };
  }

  if (gender === 'female') {
    // -ия -> -ии
    if (/ия$/i.test(n)) {
      const base = n.slice(0, -1);
      return { nominative: n, dative: base + 'и', genitive: base + 'и', ablative: base + 'ей' };
    }
    // -а -> -е
    if (/а$/i.test(n)) {
      const base = n.slice(0, -1);
      return { nominative: n, dative: base + 'е', genitive: base + 'ы', ablative: base + 'ой' };
    }
    // -я -> -е
    if (/я$/i.test(n)) {
      const base = n.slice(0, -1);
      return { nominative: n, dative: base + 'е', genitive: base + 'и', ablative: base + 'ей' };
    }
    // -ь (e.g. Любовь)
    if (/ь$/i.test(n)) {
      const base = n.slice(0, -1);
      return { nominative: n, dative: base + 'и', genitive: base + 'и', ablative: base + 'ью' };
    }
    return { nominative: n, dative: n, genitive: n, ablative: n };
  }

  // MALE
  // -ий (e.g. Дмитрий, Василий, Юрий, Григорий)
  if (/ий$/i.test(n)) {
    const base = n.slice(0, -2);
    return { nominative: n, dative: base + 'ию', genitive: base + 'ия', ablative: base + 'ием' };
  }
  // -ей (e.g. Андрей, Сергей, Алексей, Матвей, Тимофей)
  if (/ей$/i.test(n)) {
    const base = n.slice(0, -1);
    return { nominative: n, dative: base + 'ю', genitive: base + 'я', ablative: base + 'ем' };
  }
  // -ай, -ой (e.g. Николай)
  if (/(ай|ой)$/i.test(n)) {
    const base = n.slice(0, -1);
    return { nominative: n, dative: base + 'ю', genitive: base + 'я', ablative: base + 'ем' };
  }
  // -а, -я (e.g. Илья, Никита, Лука)
  if (/я$/i.test(n)) {
    const base = n.slice(0, -1);
    return { nominative: n, dative: base + 'е', genitive: base + 'и', ablative: base + 'ей' };
  }
  if (/а$/i.test(n)) {
    const base = n.slice(0, -1);
    return { nominative: n, dative: base + 'е', genitive: base + 'ы', ablative: base + 'ой' };
  }
  // -ь (e.g. Игорь)
  if (/ь$/i.test(n)) {
    const base = n.slice(0, -1);
    return { nominative: n, dative: base + 'ю', genitive: base + 'я', ablative: base + 'ем' };
  }
  // Standard hard consonant (e.g. Иван -> Ивану, Александр -> Александру, Михаил -> Михаилу)
  if (/[бвгджзклмнпрстфхцчшщ]$/i.test(n)) {
    return { nominative: n, dative: n + 'у', genitive: n + 'а', ablative: n + 'ом' };
  }

  return { nominative: n, dative: n, genitive: n, ablative: n };
}

/**
 * Declines a Russian patronymic (Отчество)
 */
export function declinePatronymic(patronymic: string, gender: 'male' | 'female'): {
  nominative: string;
  dative: string;
  genitive: string;
  ablative: string;
} {
  const p = patronymic.trim();
  if (!p) return { nominative: '', dative: '', genitive: '', ablative: '' };

  if (gender === 'female') {
    // -овна, -евна, -ична, -инична -> -овне, -евне, -ичне, -иничне
    if (/(а)$/i.test(p)) {
      const base = p.slice(0, -1);
      return { nominative: p, dative: base + 'е', genitive: base + 'ы', ablative: base + 'ой' };
    }
  } else {
    // -ович, -евич, -ич -> -овичу, -евичу, -ичу
    return { nominative: p, dative: p + 'у', genitive: p + 'а', ablative: p + 'ем' };
  }

  return { nominative: p, dative: p, genitive: p, ablative: p };
}

/**
 * Declines job titles and executive positions to Dative ("Кому?")
 */
export function declinePositionToDative(position?: string): string {
  if (!position || !position.trim()) return 'Руководителю';

  const clean = position.trim();
  const lower = clean.toLowerCase();

  // Known dictionary mappings
  const directMap: Record<string, string> = {
    'генеральный директор': 'Генеральному директору',
    'директор': 'директору',
    'исполнительный директор': 'Исполнительному директору',
    'технический директор': 'Техническому директору',
    'коммерческий директор': 'Коммерческому директору',
    'управляющий директор': 'Управляющему директору',
    'главный инженер': 'Главному инженеру',
    'главный метролог': 'Главному метрологу',
    'главный технолог': 'Главному технологу',
    'главному инженеру': 'Главному инженеру',
    'начальник отк': 'Начальнику ОТК',
    'начальник лаборатории': 'Начальнику лаборатории',
    'ведущий инженер': 'Ведущему инженеру',
    'инженер-метролог': 'Инженеру-метрологу',
    'руководитель предприятия': 'Руководителю предприятия',
    'руководитель': 'Руководителю',
    'индивидуальный предприниматель': 'Индивидуальному предпринимателю'
  };

  if (directMap[lower]) {
    return directMap[lower];
  }

  // Replace common leading role words
  let result = clean;
  result = result.replace(/^Генеральный директор\b/i, 'Генеральному директору');
  result = result.replace(/^Директор\b/i, 'Директору');
  result = result.replace(/^директору\b/i, 'директору');
  result = result.replace(/^директор\b/i, 'директору');
  result = result.replace(/^Исполнительный директор\b/i, 'Исполнительному директору');
  result = result.replace(/^Технический директор\b/i, 'Техническому директору');
  result = result.replace(/^Коммерческий директор\b/i, 'Коммерческому директору');
  result = result.replace(/^Управляющий директор\b/i, 'Управляющему директору');
  result = result.replace(/^Главный инженер\b/i, 'Главному инженеру');
  result = result.replace(/^Главный метролог\b/i, 'Главному метрологу');
  result = result.replace(/^Главный технолог\b/i, 'Главному технологу');
  result = result.replace(/^Начальник\b/i, 'Начальнику');
  result = result.replace(/^Ведущий инженер\b/i, 'Ведущему инженеру');
  result = result.replace(/^Руководитель\b/i, 'Руководителю');
  result = result.replace(/^Индивидуальный предприниматель\b/i, 'Индивидуальному предпринимателю');

  return result;
}

/**
 * Declines job titles and executive positions to Genitive ("Кого? Чего?")
 */
export function declinePositionToGenitive(position?: string): string {
  if (!position || !position.trim()) return 'Руководителя предприятия';

  const clean = position.trim();
  const lower = clean.toLowerCase();

  const directMap: Record<string, string> = {
    'генеральный директор': 'Генерального директора',
    'директор': 'директора',
    'исполнительный директор': 'Исполнительного директора',
    'технический директор': 'Технического директора',
    'коммерческий директор': 'Коммерческого директора',
    'управляющий директор': 'Управляющего директора',
    'главный инженер': 'Главного инженера',
    'главный метролог': 'Главного метролога',
    'главный технолог': 'Главного технолога',
    'начальник отк': 'Начальника ОТК',
    'начальник лаборатории': 'Начальника лаборатории',
    'ведущий инженер': 'Ведущего инженера',
    'инженер-метролог': 'Инженера-метролога',
    'руководитель предприятия': 'Руководителя предприятия',
    'руководитель': 'Руководителя',
    'индивидуальный предприниматель': 'Индивидуального предпринимателя',
    'президент': 'Президента'
  };

  if (directMap[lower]) {
    return directMap[lower];
  }

  let result = clean;
  result = result.replace(/^Генеральный директор\b/i, 'Генерального директора');
  result = result.replace(/^Директор\b/i, 'Директора');
  result = result.replace(/^Президент\b/i, 'Президента');
  result = result.replace(/^Исполнительный директор\b/i, 'Исполнительного директора');
  result = result.replace(/^Технический директор\b/i, 'Технического директора');
  result = result.replace(/^Коммерческий директор\b/i, 'Коммерческого директора');
  result = result.replace(/^Управляющий директор\b/i, 'Управляющего директора');
  result = result.replace(/^Главный инженер\b/i, 'Главного инженера');
  result = result.replace(/^Главный метролог\b/i, 'Главного метролога');
  result = result.replace(/^Главный технолог\b/i, 'Главного технолога');
  result = result.replace(/^Начальник\b/i, 'Начальника');
  result = result.replace(/^Ведущий инженер\b/i, 'Ведущего инженера');
  result = result.replace(/^Руководитель\b/i, 'Руководителя');
  result = result.replace(/^Индивидуальный предприниматель\b/i, 'Индивидуального предпринимателя');

  return result;
}

/**
 * Universal position decliner
 */
export function declinePosition(position?: string, grammarCase?: 'nominative' | 'dative' | 'genitive' | string): string {
  if (!position) return '';
  if (grammarCase === 'dative') return declinePositionToDative(position);
  if (grammarCase === 'genitive') return declinePositionToGenitive(position);
  return position;
}

/**
 * Main parser and decliner for full Russian FIO string
 * Handles input forms:
 * - "Затворницкий Андрей Владимирович"
 * - "Кузнецова Раиса"
 * - "Андрей Владимирович Затворницкий"
 * - "Некрасов С.Ю."
 */
export function parseAndDeclineFio(rawInput?: string): ParsedFio {
  const clean = (rawInput || '')
    .replace(/\(.*?\)/g, '')
    .replace(/\b(ИП|ООО|АО|ПАО|ЗАО|Ген(еральный)?\.?\s*дир(ектор)?\.?|директору|начальнику|инженеру)\b/gi, '')
    .trim();

  if (!clean) {
    return {
      surname: '',
      name: '',
      patronymic: '',
      gender: 'male',
      fullNameNominative: '',
      fullNameDative: '',
      fullNameGenitive: '',
      fullNameAblative: '',
      initialsSurnameNominative: '',
      surnameInitialsNominative: '',
      initialsSurnameDative: '',
      surnameInitialsDative: '',
      initialsSurnameGenitive: '',
      surnameInitialsGenitive: '',
      initialsSurnameAblative: '',
      surnameInitialsAblative: '',
      shortName: '',
      greeting: 'Уважаемый Заказчик!'
    };
  }

  // Check if input is already formatted as "Некрасов С.Ю." or "С.Ю. Некрасов"
  const initialsMatch = clean.match(/^([А-ЯЁ][а-яё]+)\s+([А-ЯЁ])\.\s*([А-ЯЁ])\.$/);
  if (initialsMatch) {
    const s = initialsMatch[1];
    const i1 = initialsMatch[2];
    const i2 = initialsMatch[3];
    const gender = /(ова|ева|ина|ская|ая)$/i.test(s) ? 'female' : 'male';
    const sDec = declineSurname(s, gender);
    return {
      surname: s,
      name: i1 + '.',
      patronymic: i2 + '.',
      gender,
      fullNameNominative: `${s} ${i1}.${i2}.`,
      fullNameDative: `${sDec.dative} ${i1}.${i2}.`,
      fullNameGenitive: `${sDec.genitive} ${i1}.${i2}.`,
      fullNameAblative: `${sDec.ablative} ${i1}.${i2}.`,
      initialsSurnameNominative: `${i1}.${i2}. ${s}`,
      surnameInitialsNominative: `${s} ${i1}.${i2}.`,
      initialsSurnameDative: `${i1}.${i2}. ${sDec.dative}`,
      surnameInitialsDative: `${sDec.dative} ${i1}.${i2}.`,
      initialsSurnameGenitive: `${i1}.${i2}. ${sDec.genitive}`,
      surnameInitialsGenitive: `${sDec.genitive} ${i1}.${i2}.`,
      initialsSurnameAblative: `${i1}.${i2}. ${sDec.ablative}`,
      surnameInitialsAblative: `${sDec.ablative} ${i1}.${i2}.`,
      shortName: s,
      greeting: gender === 'female' ? 'Уважаемая коллега!' : 'Уважаемый коллега!'
    };
  }

  const parts = clean.split(/\s+/).filter(Boolean);
  let surname = '';
  let name = '';
  let patronymic = '';

  if (parts.length >= 3) {
    // Check if middle part is patronymic or last part is patronymic
    if (/(ич|ович|евич|на|овна|евна|ична|инична)$/i.test(parts[2])) {
      surname = parts[0];
      name = parts[1];
      patronymic = parts[2];
    } else if (/(ич|ович|евич|на|овна|евна|ична|инична)$/i.test(parts[1])) {
      name = parts[0];
      patronymic = parts[1];
      surname = parts[2];
    } else {
      surname = parts[0];
      name = parts[1];
      patronymic = parts[2];
    }
  } else if (parts.length === 2) {
    // Check if second part has patronymic ending
    if (/(ич|ович|евич|на|овна|евна|ична|инична)$/i.test(parts[1])) {
      name = parts[0];
      patronymic = parts[1];
      surname = '';
    } else {
      // Typically: "Кузнецова Раиса" or "Андрей Затворницкий"
      if (/(ов|ев|ин|ын|ский|цкий|ова|ева|ина|ская|ая)$/i.test(parts[0])) {
        surname = parts[0];
        name = parts[1];
      } else {
        name = parts[0];
        surname = parts[1];
      }
    }
  } else if (parts.length === 1) {
    name = parts[0];
  }

  const gender = detectRussianGender(surname, name, patronymic);
  const sDec = declineSurname(surname, gender);
  const nDec = declineFirstName(name, gender);
  const pDec = declinePatronymic(patronymic, gender);

  const fullNom = [sDec.nominative, nDec.nominative, pDec.nominative].filter(Boolean).join(' ');
  const fullDat = [sDec.dative, nDec.dative, pDec.dative].filter(Boolean).join(' ');
  const fullGen = [sDec.genitive, nDec.genitive, pDec.genitive].filter(Boolean).join(' ');
  const fullAbl = [sDec.ablative, nDec.ablative, pDec.ablative].filter(Boolean).join(' ');

  const i1 = name ? `${name.charAt(0).toUpperCase()}.` : '';
  const i2 = patronymic ? `${patronymic.charAt(0).toUpperCase()}.` : '';
  const initials = `${i1}${i2}`;

  const initialsSurnameNom = initials ? `${initials} ${sDec.nominative}` : sDec.nominative;
  const surnameInitialsNom = initials ? `${sDec.nominative} ${initials}` : sDec.nominative;
  const initialsSurnameDat = initials ? `${initials} ${sDec.dative}` : sDec.dative;
  const surnameInitialsDat = initials ? `${sDec.dative} ${initials}` : sDec.dative;
  const initialsSurnameGen = initials ? `${initials} ${sDec.genitive}` : sDec.genitive;
  const surnameInitialsGen = initials ? `${sDec.genitive} ${initials}` : sDec.genitive;
  const initialsSurnameAbl = initials ? `${initials} ${sDec.ablative}` : sDec.ablative;
  const surnameInitialsAbl = initials ? `${sDec.ablative} ${initials}` : sDec.ablative;

  const shortName = [name, patronymic].filter(Boolean).join(' ') || name || surname;
  const salut = gender === 'female' ? 'Уважаемая' : 'Уважаемый';
  const greeting = shortName ? `${salut} ${shortName}!` : 'Уважаемый Заказчик!';

  return {
    surname,
    name,
    patronymic,
    gender,
    fullNameNominative: fullNom,
    fullNameDative: fullDat,
    fullNameGenitive: fullGen,
    fullNameAblative: fullAbl,
    initialsSurnameNominative: initialsSurnameNom,
    surnameInitialsNominative: surnameInitialsNom,
    initialsSurnameDative: initialsSurnameDat,
    surnameInitialsDative: surnameInitialsDat,
    initialsSurnameGenitive: initialsSurnameGen,
    surnameInitialsGenitive: surnameInitialsGen,
    initialsSurnameAblative: initialsSurnameAbl,
    surnameInitialsAblative: surnameInitialsAbl,
    shortName,
    greeting
  };
}
