import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  KeyRound, 
  MessageSquare, 
  Mail, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  Search,
  BookOpen,
  ClipboardCheck,
  Sliders,
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';

interface ManualSection {
  id: string;
  title: string;
  category: 'rbac' | 'service' | 'contracts' | 'admin';
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  steps: { title: string; desc: string; badge?: string }[];
  importantNote?: string;
  tags: string[];
}

const STAFF_MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'rbac-guide',
    title: 'Регламент разграничения прав доступа и управления пользователями (RBAC)',
    category: 'rbac',
    icon: ShieldCheck,
    summary: 'Порядок назначения ролей сотрудникам и заказчикам, настройка прав на договоры, сервисные заявки и защиту 3D CAD-данных.',
    steps: [
      {
        title: '1. Роли пользователей в системе',
        desc: 'В системе действуют 4 уровня: «Заказчик (Client)» — изолированный доступ только к своим договорам и подаче заявок; «Менеджер (Manager)» — ведение CRM, сделок и клиентских заявок; «Главный администратор (Admin)» — управление пользователями, SMTP, логами; «Суперадминистратор» — полный системный доступ.',
        badge: 'Безопасность'
      },
      {
        title: '2. Разграничение доступа к реестру договоров',
        desc: 'Заказчикам строго запрещено создание и импорт договоров. Они могут просматривать только утвержденные договоры своей компании и выгружать отчеты. Создание, редактирование сумм и удаление договоров доступно только менеджерам с флагом `canManageContracts`.'
      },
      {
        title: '3. Защита интеллектуальной собственности (CAD/3D)',
        desc: 'Исходные 3D-модели (STEP, STL, облака точек КИМ) защищены от прямого скачивания клиентами. Заказчик может только просматривать интерактивную WebGL-модель и карту GD&T. Выгрузка оригиналов доступна только авторизованным специалистам.'
      }
    ],
    importantNote: 'Строго запрещено предоставлять гостям и сторонним контрагентам учетные записи с ролью Manager или Admin. Все новые контрагенты регистрируются с ролью «Заказчик (Client)».',
    tags: ['RBAC', 'Безопасность', 'Роли', 'Защита CAD', 'Договоры']
  },
  {
    id: 'service-guide',
    title: 'Регламент обработки сервисных заявок и обращений техподдержки',
    category: 'service',
    icon: MessageSquare,
    summary: 'Нормативы времени реакции (SLA), прикрепление файлов лицензий .v2c и регламент решения инцидентов по КИМ и САПР.',
    steps: [
      {
        title: '1. Прием и категоризация сервисного обращения',
        desc: 'Все обращения из Личного кабинета и формы сервиса поступают в реестр «Техподдержка». Время первого ответа дежурного инженера по регламенту не превышает 2 часов в рабочие дни.',
        badge: 'SLA: до 2 ч'
      },
      {
        title: '2. Подготовка и передача лицензий (.v2c / Dongle ID)',
        desc: 'При запросе на обновление лицензий PolyWorks или TopSolid инженер формирует файл обновления `.v2c` на основе присланного `.c2v` и прикрепляет его к карточке обращения с инструкцией по применению через HASP RUS.'
      },
      {
        title: '3. Организация выездного сервиса и поверок',
        desc: 'В случае необходимости калибровки стационарной КИМ или лазерного трекера инженер формирует сервисную заявку на выездной метрологический контроль и регистрирует номер поверки во ФГИС «АРШИН».'
      },
      {
        title: '4. Закрытие обращения',
        desc: 'Заявка переводится в статус «Решено» только после подтверждения заказчиком успешного запуска оборудования или активации программного обеспечения.'
      }
    ],
    importantNote: 'Вся переписка по обращению автоматически протоколируется и отправляется заказчику на контактный email.',
    tags: ['Техподдержка', 'Сервисные заявки', 'SLA', 'Поверки', 'Лицензии']
  },
  {
    id: 'contracts-guide',
    title: 'Ведение документооборота, спецификаций и метрологических отчетов',
    category: 'contracts',
    icon: Briefcase,
    summary: 'Стандарты прикрепления закрывающих документов, счетов-фактур, протоколов контроля GD&T и свидетельств об утверждении типа СИ.',
    steps: [
      {
        title: '1. Прикрепление закрывающих документов к договорам',
        desc: 'К каждому договору прикрепляются скан-копии подписанных спецификаций, счетов на аванс и закрывающих УПД. Заказчик видит их в реальном времени в своем личном кабинете.'
      },
      {
        title: '2. Публикация протоколов метрологического контроля',
        desc: 'Протоколы измерений деталей в формате PDF с цветовыми картами отклонений Geomagic Control X загружаются в реестр «Метрологические отчеты» с привязкой к номеру чертежа детали.'
      },
      {
        title: '3. Реестр свидетельств и сертификатов',
        desc: 'Свидетельства об утверждении типа СИ (КИМ Mitutoyo, Hexagon, оптические сканеры Shining 3D) актуализируются в реестре свидетельств для подтверждения легитимности измерений в РФ.'
      }
    ],
    tags: ['Документооборот', 'Спецификации', 'Метрология', 'GD&T', 'Сертификаты']
  },
  {
    id: 'admin-guide',
    title: 'Администрирование почтового шлюза SMTP и мониторинг безопасности',
    category: 'admin',
    icon: Mail,
    summary: 'Настройка корпоративного SMTP-сервера для отправки уведомлений, управление шаблонами писем и аудит журнала событий.',
    steps: [
      {
        title: '1. Конфигурация SMTP сервера',
        desc: 'В разделе «Настройки почты (SMTP)» задаются параметры подключения (сервер, порт 465/587, SSL/TLS, логин и пароль приложения). Перед сохранением обязательно выполняется тестовая отправка письма.'
      },
      {
        title: '2. Настройка каналов мгновенных уведомлений',
        desc: 'Оповещения о новых заявках на расчет стоимости и обращениях в техподдержку транслируются в Telegram-канал инженеров и дежурную почту support@ds-engineering.ru.'
      },
      {
        title: '3. Аудит журнала безопасности (Security Logs)',
        desc: 'Раздел «Журнал безопасности и логи» фиксирует все события авторизации, смену паролей, редактирование договоров и попытки несанкционированного доступа с фиксацией IP-адреса и времени.'
      }
    ],
    importantNote: 'При изменении паролей корпоративной почты не забывайте обновлять пароль приложения в панели SMTP.',
    tags: ['SMTP', 'Безопасность', 'Логи', 'Telegram', 'Аудит']
  }
];

export const StaffCabinetManualView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'rbac' | 'service' | 'contracts' | 'admin'>('all');
  const [expandedSectionId, setExpandedSectionId] = useState<string>('rbac-guide');

  const filteredSections = STAFF_MANUAL_SECTIONS.filter(section => {
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-700 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Служебный раздел</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-200 border border-blue-400/30 font-bold">
                  Для специалистов и администраторов
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Руководство по разделам кабинета и администрированию
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Служебные регламенты разграничения прав доступа (RBAC), обработки сервисных заявок, работы с реестрами договоров и конфигурации почтового шлюза SMTP.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по регламентам (RBAC, SLA, заявки, договоры, SMTP, CAD)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Все темы
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('rbac')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedCategory === 'rbac'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Права и RBAC
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('service')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedCategory === 'service'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Сервисные заявки
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('contracts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedCategory === 'contracts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Договоры и реестры
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedCategory === 'admin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Администрирование & SMTP
          </button>
        </div>
      </div>

      {/* Manual Cards */}
      <div className="space-y-4">
        {filteredSections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSectionId === section.id;

          return (
            <div 
              key={section.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => setExpandedSectionId(isExpanded ? '' : section.id)}
                className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {section.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {section.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      {section.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-semibold">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0 transition-transform ${
                  isExpanded ? 'rotate-90 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : ''
                }`}>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {section.steps.map((step, idx) => (
                      <div 
                        key={idx}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{step.title}</span>
                          </h4>
                          {step.badge && (
                            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[10px] font-black shrink-0">
                              {step.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                          {step.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {section.importantNote && (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Важно: </span>
                        <span>{section.importantNote}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
