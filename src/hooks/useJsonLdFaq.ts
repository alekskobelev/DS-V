import { useState, useEffect, useCallback } from 'react';
import { FaqItem } from '../types';
import { FAQ_ITEMS as KB_FAQ_ITEMS } from '../data/knowledgeBase';

/**
 * Канонический список вопросов и ответов, синхронизированный со структурированными данными
 * Schema.org FAQPage из <script type="application/ld+json"> в index.html.
 * Загружается из централизованного источника данных src/data/knowledgeBase.ts.
 */
export const CANONICAL_SCHEMA_FAQ_ITEMS: FaqItem[] = KB_FAQ_ITEMS;

/**
 * Вспомогательная функция сопоставления метаданных вопроса с разделами сайта
 */
function enrichParsedQuestion(question: string, answer: string, index: number): FaqItem {
  const qLower = question.toLowerCase();
  const aLower = answer.toLowerCase();

  // Проверяем существующие канонические элементы на точное совпадение
  const canonicalMatch = CANONICAL_SCHEMA_FAQ_ITEMS.find(
    (item) => item.question.trim().toLowerCase() === question.trim().toLowerCase()
  );

  if (canonicalMatch) {
    return {
      ...canonicalMatch,
      id: `faq-schema-${index + 1}`,
      question: canonicalMatch.question,
      answer: canonicalMatch.answer,
    };
  }

  // Автоматическое определение категории и целевых ссылок
  let category: FaqItem['category'] = 'software';
  let categoryLabel = 'CAD/CAM и ПО';
  let actionPage: FaqItem['actionPage'] = 'software';
  let actionText = 'Подробнее';
  let actionTargetId: string | undefined = undefined;
  let highlight: string | undefined = undefined;

  if (qLower.includes('topsolid') || aLower.includes('topsolid')) {
    category = 'software';
    categoryLabel = 'CAD/CAM и ПО';
    actionPage = 'software';
    actionTargetId = 'topsolid-7';
    actionText = 'Подробнее о TopSolid 7';
    highlight = 'Сквозная ассоциативность CAD/CAM/PDM систем.';
  } else if (qLower.includes('polyworks') || aLower.includes('polyworks')) {
    category = 'software';
    categoryLabel = 'Метрология и ПО';
    actionPage = 'software';
    actionTargetId = 'polyworks-inspector';
    actionText = 'Подробнее о PolyWorks';
    highlight = 'Универсальное метрологическое ПО для всех типов измерительных систем.';
  } else if (qLower.includes('постпроцессор') || aLower.includes('постпроцессор') || qLower.includes('чпу')) {
    category = 'postprocessors';
    categoryLabel = 'Постпроцессоры ЧПУ';
    actionPage = 'services';
    actionTargetId = 'srv-postprocessor';
    actionText = 'Заказать постпроцессор';
    highlight = '100% симуляция кинематики и защита от столкновений.';
  } else if (qLower.includes('сканирован') || qLower.includes('реверс') || aLower.includes('реверс')) {
    category = 'services';
    categoryLabel = '3D-сканирование и реверс';
    actionPage = 'calculator';
    actionText = 'Рассчитать стоимость';
    highlight = 'Высокоточное сканирование с выездом по всей России.';
  } else if (qLower.includes('ким') || qLower.includes('оборудован') || aLower.includes('pmt') || aLower.includes('shining')) {
    category = 'hardware';
    categoryLabel = 'Метрология и КИМ';
    actionPage = 'hardware';
    actionText = 'Каталог оборудования';
    highlight = 'Внесение в Госреестр СИ и ФГИС «АРШИН».';
  } else {
    category = 'training';
    categoryLabel = 'Инженерные консультации';
    actionPage = 'contacts';
    actionText = 'Задать вопрос инженеру';
  }

  return {
    id: `faq-schema-${index + 1}`,
    category,
    categoryLabel,
    question,
    answer,
    highlight,
    actionText,
    actionPage,
    actionTargetId,
  };
}

/**
 * Извлекает элементы FAQPage непосредственно из всех тегов <script type="application/ld+json"> в DOM
 */
export function extractFaqFromDocument(): { items: FaqItem[]; schemaId?: string; rawCount: number } {
  if (typeof document === 'undefined') {
    return { items: CANONICAL_SCHEMA_FAQ_ITEMS, rawCount: CANONICAL_SCHEMA_FAQ_ITEMS.length };
  }

  try {
    const scripts = document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]');
    const extractedQuestions: Array<{ question: string; answer: string }> = [];
    let foundSchemaId: string | undefined = undefined;

    scripts.forEach((script) => {
      try {
        const content = script.textContent?.trim();
        if (!content) return;
        const parsed = JSON.parse(content);

        // Функция обхода узлов графа
        const inspectNode = (node: any) => {
          if (!node || typeof node !== 'object') return;

          if (node['@type'] === 'FAQPage' && Array.isArray(node.mainEntity)) {
            if (node['@id']) foundSchemaId = node['@id'];
            node.mainEntity.forEach((entity: any) => {
              if (entity && entity['@type'] === 'Question') {
                const questionText = entity.name || entity.question || '';
                const answerText =
                  typeof entity.acceptedAnswer === 'string'
                    ? entity.acceptedAnswer
                    : entity.acceptedAnswer?.text || entity.acceptedAnswer?.name || '';
                if (questionText && answerText) {
                  extractedQuestions.push({
                    question: questionText.trim(),
                    answer: answerText.trim(),
                  });
                }
              }
            });
          }

          // Рекурсивный проход по @graph или массивам
          if (Array.isArray(node['@graph'])) {
            node['@graph'].forEach(inspectNode);
          }
          if (Array.isArray(node)) {
            node.forEach(inspectNode);
          }
        };

        inspectNode(parsed);
      } catch (err) {
        // Пропускаем невалидные скрипты
      }
    });

    if (extractedQuestions.length > 0) {
      const items = extractedQuestions.map((q, idx) => enrichParsedQuestion(q.question, q.answer, idx));
      return { items, schemaId: foundSchemaId, rawCount: items.length };
    }
  } catch (error) {
    console.warn('[useJsonLdFaq] Не удалось извлечь FAQ из DOM:', error);
  }

  return { items: CANONICAL_SCHEMA_FAQ_ITEMS, schemaId: 'https://ds-engineering.ru/#faq', rawCount: CANONICAL_SCHEMA_FAQ_ITEMS.length };
}

/**
 * Хук для динамического потребления данных FAQPage из Schema.org JSON-LD
 */
export const useJsonLdFaq = () => {
  const [faqData, setFaqData] = useState<{
    items: FaqItem[];
    schemaId?: string;
    rawCount: number;
    isSyncedWithDOM: boolean;
  }>(() => {
    const initial = extractFaqFromDocument();
    return {
      items: initial.items,
      schemaId: initial.schemaId,
      rawCount: initial.rawCount,
      isSyncedWithDOM: typeof document !== 'undefined' && initial.items.length > 0,
    };
  });

  const refreshFaq = useCallback(() => {
    const updated = extractFaqFromDocument();
    setFaqData({
      items: updated.items,
      schemaId: updated.schemaId,
      rawCount: updated.rawCount,
      isSyncedWithDOM: true,
    });
  }, []);

  useEffect(() => {
    refreshFaq();

    // Следим за возможными динамическими изменениями в <head>
    if (typeof document !== 'undefined' && window.MutationObserver) {
      const observer = new MutationObserver(() => {
        refreshFaq();
      });

      const head = document.head;
      if (head) {
        observer.observe(head, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }

      return () => {
        observer.disconnect();
      };
    }
  }, [refreshFaq]);

  return {
    faqItems: faqData.items,
    schemaId: faqData.schemaId || 'https://ds-engineering.ru/#faq',
    rawCount: faqData.rawCount,
    isSyncedWithDOM: faqData.isSyncedWithDOM,
    refreshFaq,
  };
};
