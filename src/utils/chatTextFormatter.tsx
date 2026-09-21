import React from 'react';

/**
 * Безопасное форматирование текста сообщений для чата «Онлайн-инженер» и CRM.
 * Полностью исключает отображение сырых markdown-символов (**, *, ###, __)
 * и преобразует смысловые акценты в аккуратную типографику (strong, em).
 */
export function formatChatMessage(text: string, isUser: boolean = false): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lIdx} className="h-1" />;
        }

        // Удаляем сырые markdown-заголовки (### Заголовок)
        const processedLine = trimmed.replace(/^#{1,6}\s+/, '');

        // Разбиваем строку на токены жирного, курсива и обычного текста
        const parts = processedLine.split(/(\*\*.*?\*\*|\*[^*]+\*|__.*?__)/g);

        return (
          <p key={lIdx} className="text-xs">
            {parts.map((part, pIdx) => {
              if (
                (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
                (part.startsWith('__') && part.endsWith('__') && part.length >= 4)
              ) {
                const inner = part.slice(2, -2);
                return (
                  <strong
                    key={pIdx}
                    className={isUser ? 'font-bold text-white' : 'font-semibold text-gray-950'}
                  >
                    {inner}
                  </strong>
                );
              }
              if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
                const inner = part.slice(1, -1);
                return (
                  <em key={pIdx} className="italic">
                    {inner}
                  </em>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}
