/**
 * Utility to convert numeric monetary amounts into Russian words.
 * Example: 18117000 -> "Восемнадцать миллионов сто семнадцать тысяч рублей 00 копеек"
 */

function countUnits(num: number, gender: 'm' | 'f'): string {
  const units = [
    ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'],
    ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
  ];
  return units[gender === 'f' ? 1 : 0][num] || '';
}

function countTeens(num: number): string {
  const teens = [
    'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать',
    'пятнадцать', 'шестнадцать', 'семнадцать', 'восемьнадцать', 'девятнадцать'
  ];
  return teens[num - 10] || '';
}

function countTens(num: number): string {
  const tens = [
    '', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят',
    'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'
  ];
  return tens[num] || '';
}

function countHundreds(num: number): string {
  const hundreds = [
    '', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот',
    'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'
  ];
  return hundreds[num] || '';
}

function declension(count: number, forms: [string, string, string]): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) {
    return forms[2];
  }
  if (mod10 === 1) {
    return forms[0];
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return forms[1];
  }
  return forms[2];
}

function triadToWords(triad: number, gender: 'm' | 'f'): string {
  if (triad === 0) return '';
  const h = Math.floor(triad / 100);
  const t = Math.floor((triad % 100) / 10);
  const u = triad % 10;

  const result: string[] = [];
  if (h > 0) result.push(countHundreds(h));

  if (t === 1) {
    result.push(countTeens(t * 10 + u));
  } else {
    if (t > 1) result.push(countTens(t));
    if (u > 0) result.push(countUnits(u, gender));
  }

  return result.filter(Boolean).join(' ');
}

export function numberToWordsRu(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Ноль рублей 00 копеек';

  const absolute = Math.abs(amount);
  const integerPart = Math.floor(absolute);
  const kopecks = Math.round((absolute - integerPart) * 100);

  if (integerPart === 0) {
    const kopecksStr = kopecks < 10 ? `0${kopecks}` : `${kopecks}`;
    return `Ноль рублей ${kopecksStr} копеек`;
  }

  const billions = Math.floor(integerPart / 1000000000) % 1000;
  const millions = Math.floor(integerPart / 1000000) % 1000;
  const thousands = Math.floor(integerPart / 1000) % 1000;
  const units = integerPart % 1000;

  const words: string[] = [];

  if (billions > 0) {
    const bWords = triadToWords(billions, 'm');
    const bDecl = declension(billions, ['миллиард', 'миллиарда', 'миллиардов']);
    words.push(`${bWords} ${bDecl}`);
  }

  if (millions > 0) {
    const mWords = triadToWords(millions, 'm');
    const mDecl = declension(millions, ['миллион', 'миллиона', 'миллионов']);
    words.push(`${mWords} ${mDecl}`);
  }

  if (thousands > 0) {
    const tWords = triadToWords(thousands, 'f');
    const tDecl = declension(thousands, ['тысяча', 'тысячи', 'тысяч']);
    words.push(`${tWords} ${tDecl}`);
  }

  if (units > 0) {
    const uWords = triadToWords(units, 'm');
    words.push(uWords);
  }

  const rublesDecl = declension(integerPart, ['рубль', 'рубля', 'рублей']);
  const kopecksStr = kopecks < 10 ? `0${kopecks}` : `${kopecks}`;
  const kopecksDecl = declension(kopecks, ['копейка', 'копейки', 'копеек']);

  const fullStr = `${words.join(' ')} ${rublesDecl} ${kopecksStr} ${kopecksDecl}`.trim();
  
  // Capitalize first letter
  return fullStr.charAt(0).toUpperCase() + fullStr.slice(1);
}
