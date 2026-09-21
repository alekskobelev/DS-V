import { useState, useEffect, useCallback } from 'react';
import { FaqItem } from '../types';

/**
 * Канонический список вопросов и ответов, синхронизированный со структурированными данными
 * Schema.org FAQPage из <script type="application/ld+json"> в index.html.
 * Обеспечивает 100% соответствие между разметкой поисковых систем (Яндекс/Google) и пользовательским интерфейсом.
 */
export const CANONICAL_SCHEMA_FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-schema-01',
    category: 'software',
    categoryLabel: 'CAD/CAM и ПО',
    question: 'Какие возможности предоставляет CAD/CAM/PDM система TopSolid 7?',
    answer: 'TopSolid 7 — это интегрированная сквозная CAD/CAM/PDM система нового поколения, позволяющая проектировать технологическую оснастку, пресс-формы, штампы и разрабатывать управляющие программы для токарной, фрезерной (включая непрерывную 5-осевую) и токарно-фрезерной обработки на станках с ЧПУ с полной верификацией кинематики и контролем столкновений.',
    highlight: 'Сквозная ассоциативность: при изменении 3D-модели траектории инструмента в CAM пересчитываются автоматически без повторного перепрограммирования.',
    actionText: 'Подробнее о TopSolid 7',
    actionPage: 'software',
    actionTargetId: 'topsolid-7',
  },
  {
    id: 'faq-schema-02',
    category: 'software',
    categoryLabel: 'Метрология и ПО',
    question: 'Для каких задач применяется метрологическое программное обеспечение PolyWorks?',
    answer: 'PolyWorks|Inspector — универсальная программная платформа для трехмерного метрологического контроля геометрии деталей, сравнения фактических измерений с CAD-моделью (цветовая карта отклонений), контроля геометрических допусков GD&T по ГОСТ и ISO, а также автоматизации измерений на КИМ, измерительных руках и оптических трекерах.',
    highlight: 'Универсальное метрологическое ядро для всех типов портальных КИМ, мобильных рук PMT / Hexagon и лазерных 3D-трекеров.',
    actionText: 'Подробнее о PolyWorks|Inspector',
    actionPage: 'software',
    actionTargetId: 'polyworks-inspector',
  },
  {
    id: 'faq-schema-03',
    category: 'services',
    categoryLabel: '3D-сканирование и реверс',
    question: 'Какие услуги 3D-сканирования и реверс-инжиниринга выполняет «ДС-Инжиниринг»?',
    answer: 'Компания выполняет высокоточное лазерное и оптическое 3D-сканирование деталей с точностью до 0.02 мм, построение параметрических твердотельных CAD-моделей (STEP, IGES, Parasolid) по полигональным сеткам (обратный инжиниринг), контроль износа штамповой оснастки, а также выездной метрологический контроль на объекте заказчика.',
    highlight: 'Точность сканирования до 0.02 мм с предоставлением официального протокола контроля FAI и CAD-геометрии с деревом построения.',
    actionText: 'Рассчитать стоимость 3D-сканирования',
    actionPage: 'calculator',
  },
  {
    id: 'faq-schema-04',
    category: 'postprocessors',
    categoryLabel: 'Постпроцессоры ЧПУ',
    question: 'Разрабатывает ли «ДС-Инжиниринг» постпроцессоры для станков с ЧПУ?',
    answer: 'Да, наши специалисты разрабатывают, тестируют и внедряют индивидуальные постпроцессоры для стоек ЧПУ Fanuc, Heidenhain, Siemens Sinumerik, Haas и др., включая сложные многоосевые обрабатывающие центры, токарно-фрезерные комплексы и роботы-манипуляторы с симуляцией съема материала и защитой от аварийных ситуаций.',
    highlight: 'Полная кинематическая 3D-модель станка со столом, шпинделем и зажимной оснасткой для 100% защиты от столкновений.',
    actionText: 'Услуги разработки постпроцессоров',
    actionPage: 'services',
    actionTargetId: 'srv-postprocessor',
  },
  {
    id: 'faq-schema-05',
    category: 'hardware',
    categoryLabel: 'Метрология и КИМ',
    question: 'Какое координатно-измерительное и оптическое оборудование вы поставляете?',
    answer: '«ДС-Инжиниринг» осуществляет официальные поставки портативных измерительных рук (PMT Arm), ручных и стационарных лазерных 3D-сканеров Shining 3D (серии FreeScan, EinScan, AutoScan), оптических систем слежения, а также координатно-измерительных машин (КИМ) с пусконаладкой, калибровкой, обучением персонала и метрологическим сопровождением.',
    highlight: 'Официальные поставки с первичной поверкой по ГОСТ Р ИСО 10360 и внесением во ФГИС «АРШИН».',
    actionText: 'Каталог оборудования КИМ',
    actionPage: 'hardware',
  },
];

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
      question,
      answer,
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
