/**
 * Утилиты форматирования имени и инициалов пользователя
 */

/**
 * Форматирует полное имя в формат «Фамилия И.О.» или «Фамилия И.»
 * Примеры:
 * - "Скобелев Александр Сергеевич" -> "Скобелев А.С."
 * - "Некрасов Сергей Юрьевич" -> "Некрасов С.Ю."
 * - "Иванов Иван" -> "Иванов И."
 * - "Администратор" -> "Администратор"
 */
export function formatUserInitials(fullName?: string | null): string {
  if (!fullName || !fullName.trim()) return 'Личный кабинет';
  const clean = fullName.trim();
  const parts = clean.split(/\s+/);
  
  if (parts.length === 1) {
    return parts[0];
  }
  
  const lastName = parts[0];
  const firstInitial = parts[1] && parts[1][0] ? `${parts[1][0].toUpperCase()}.` : '';
  const middleInitial = parts[2] && parts[2][0] ? `${parts[2][0].toUpperCase()}.` : '';
  
  return `${lastName} ${firstInitial}${middleInitial}`.trim();
}

/**
 * Возвращает 2-буквенные инициалы для аватара (например, «АС» или «СЮ»)
 */
export function getUserAvatarLetters(fullName?: string | null): string {
  if (!fullName || !fullName.trim()) return 'ДС';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return ((parts[0][0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}
