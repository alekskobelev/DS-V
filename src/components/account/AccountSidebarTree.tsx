import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  PanelLeftClose, 
  PanelLeftOpen, 
  TrendingUp, 
  Folder, 
  GraduationCap, 
  Settings as SettingsIcon,
  PieChart,
  FileText,
  ClipboardCheck,
  Calendar,
  Users,
  Building2,
  Briefcase,
  Award,
  MessageSquare,
  KeyRound,
  BookOpen,
  HelpCircle,
  Mail,
  CheckSquare,
  Sparkles,
  Bell,
  Wrench,
  LayoutDashboard,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';

export interface NavSubItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  tooltip?: string;
}

export interface NavSection {
  id: 'docs' | 'knowledge' | 'admin';
  title: string;
  shortTitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  visible: boolean;
  items: NavSubItem[];
}

interface AccountSidebarTreeProps {
  activeModule: 'docs' | 'knowledge' | 'admin';
  activeSubTab: string;
  onSelectSubTab: (moduleId: 'docs' | 'knowledge' | 'admin', subTabId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  hasCrmAccess: boolean;
  isAdmin: boolean;
  canManageUsers: boolean;
  canManageContracts: boolean;
  canManageTickets: boolean;
  canManageLicenses: boolean;
  canViewCertificates?: boolean;
  canViewMetrologyReports?: boolean;
  contractsCount: number;
  ticketsCount: number;
  licensesCount: number;
  rfqsCount: number;
  dealsCount: number;
  proposalsCount: number;
  fleetCount?: number;
  onItemClickMobile?: () => void;
  onNavigateToCrm?: (tab?: string) => void;
}

export const AccountSidebarTree: React.FC<AccountSidebarTreeProps> = ({
  activeModule,
  activeSubTab,
  onSelectSubTab,
  isCollapsed,
  onToggleCollapse,
  hasCrmAccess,
  isAdmin,
  canManageUsers,
  canViewCertificates,
  canViewMetrologyReports,
  contractsCount,
  ticketsCount,
  licensesCount,
  rfqsCount,
  fleetCount,
  onItemClickMobile,
  onNavigateToCrm
}) => {
  // Manage open/close state for each accordion section
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    docs: true,
    knowledge: true,
    admin: true
  });

  // Track hover flyout for collapsed rail mode
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Build navigation structure dynamically based on user role & counts
  const sections: NavSection[] = [
    {
      id: 'docs',
      title: hasCrmAccess ? 'Служебные реестры и Сервис' : 'Личный кабинет заказчика',
      shortTitle: hasCrmAccess ? 'Реестры' : 'Кабинет',
      icon: Folder,
      iconColor: 'text-emerald-600',
      visible: true,
      items: [
        ...(!hasCrmAccess ? [
          {
            id: 'client-dashboard',
            label: 'Дашборд заказчика',
            icon: LayoutDashboard,
            badge: 'Status',
            badgeColor: 'bg-emerald-100 text-emerald-800'
          }
        ] : []),
        {
          id: 'contracts',
          label: 'Договоры и проекты',
          icon: Briefcase,
          badge: contractsCount > 0 ? contractsCount : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-800'
        },
        {
          id: 'licenses',
          label: 'Лицензии и ключи ПО',
          icon: KeyRound,
          badge: licensesCount > 0 ? licensesCount : undefined,
          badgeColor: 'bg-teal-100 text-teal-800'
        },
        {
          id: 'tickets',
          label: 'Заявки в техподдержку',
          icon: MessageSquare,
          badge: ticketsCount > 0 ? ticketsCount : undefined,
          badgeColor: 'bg-amber-100 text-amber-800'
        },
        ...(hasCrmAccess || canViewMetrologyReports ? [
          {
            id: 'metrology-reports',
            label: 'Метрологические отчеты',
            icon: ClipboardCheck
          }
        ] : []),
        ...(hasCrmAccess || canViewCertificates ? [
          {
            id: 'certificates',
            label: 'Свидетельства и сертификаты',
            icon: Award
          }
        ] : []),
        ...(!hasCrmAccess ? [
          {
            id: 'requests',
            label: 'Мои заявки и расчеты',
            icon: FileText,
            badge: rfqsCount > 0 ? rfqsCount : undefined,
            badgeColor: 'bg-blue-100 text-blue-800'
          }
        ] : [])
      ]
    },
    {
      id: 'knowledge',
      title: hasCrmAccess ? 'Служебные регламенты и инструкции' : 'Помощь и поддержка',
      shortTitle: hasCrmAccess ? 'Регламенты' : 'Справка',
      icon: BookOpen,
      iconColor: 'text-blue-600',
      visible: true,
      items: [
        ...(!hasCrmAccess ? [
          {
            id: 'guide',
            label: 'Руководство пользователя',
            icon: BookOpen
          },
          {
            id: 'faq',
            label: 'Вопросы и ответы (FAQ)',
            icon: HelpCircle
          }
        ] : [
          {
            id: 'staff-guide',
            label: 'Инструкции для специалистов',
            icon: BookOpen
          }
        ])
      ]
    },
    {
      id: 'admin',
      title: 'Администрирование системы',
      shortTitle: 'Админ',
      icon: SettingsIcon,
      iconColor: 'text-amber-500',
      visible: canManageUsers || isAdmin,
      items: [
        {
          id: 'users',
          label: 'Пользователи и права (RBAC)',
          icon: Users
        },
        {
          id: 'email',
          label: 'Настройки почты (SMTP)',
          icon: Mail
        },
        {
          id: 'logs',
          label: 'Журнал безопасности и логи',
          icon: ShieldAlert
        }
      ]
    }
  ];

  const visibleSections = sections.filter(s => s.visible);

  const handleItemSelect = (secId: 'docs' | 'knowledge' | 'admin', itemId: string) => {
    onSelectSubTab(secId, itemId);
    if (onItemClickMobile) {
      onItemClickMobile();
    }
  };

  // ----------------------------------------------------------------------
  // COLLAPSED RAIL MODE (68px Desktop Rail)
  // ----------------------------------------------------------------------
  if (isCollapsed) {
    return (
      <aside className="w-[68px] shrink-0 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md p-2.5 flex flex-col items-center gap-4 transition-all duration-300">
        {/* Uncollapse button */}
        <button
          onClick={onToggleCollapse}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
          title="Развернуть меню"
        >
          <PanelLeftOpen className="w-5 h-5" />
        </button>

        {hasCrmAccess && onNavigateToCrm && (
          <button
            type="button"
            onClick={() => onNavigateToCrm('funnels')}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer relative"
            title="Открыть единую рабочую CRM-систему"
          >
            <Briefcase className="w-5 h-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white ring-1 ring-amber-500 animate-pulse" />
          </button>
        )}

        <div className="w-8 h-px bg-slate-200 dark:bg-slate-700" />

        {/* Section Icons with Hover Flyout */}
        <div className="flex flex-col gap-3 w-full items-center">
          {visibleSections.map(sec => {
            const isSectionActive = activeModule === sec.id;
            const Icon = sec.icon;

            return (
              <div
                key={sec.id}
                className="relative group w-full flex justify-center"
                onMouseEnter={() => setHoveredSectionId(sec.id)}
                onMouseLeave={() => setHoveredSectionId(null)}
              >
                <button
                  onClick={() => {
                    // Activate first item of section
                    if (sec.items.length > 0) {
                      handleItemSelect(sec.id, sec.items[0].id);
                    }
                  }}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                    isSectionActive
                      ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-500'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 dark:border-slate-700'
                  }`}
                  title={sec.title}
                >
                  <Icon className="w-5 h-5" />
                  {/* Total section badge indicator */}
                  {sec.items.some(i => i.badge) && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
                  )}
                </button>

                {/* Flyout Submenu on Hover */}
                {hoveredSectionId === sec.id && (
                  <div className="absolute left-[54px] top-0 z-50 min-w-[240px] bg-white dark:bg-slate-900 rounded-xl shadow-sm border-2 border-slate-200 dark:border-slate-700 p-2.5 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-1.5 text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${sec.iconColor}`} />
                      <span>{sec.title}</span>
                    </div>

                    <div className="pt-1 space-y-1">
                      {sec.items.map(item => {
                        const ItemIcon = item.icon;
                        const isItemActive = isSectionActive && activeSubTab === item.id;

                        return (
                          <button
                            key={item.id}
                            onClick={() => handleItemSelect(sec.id, item.id)}
                            className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                              isItemActive
                                ? 'bg-blue-600 text-white shadow-xs font-bold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <ItemIcon className={`w-4 h-4 shrink-0 ${isItemActive ? 'text-white' : 'text-slate-500'}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  isItemActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mini Tasks indicator button */}
        {hasCrmAccess && (
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 w-full flex justify-center">
            <button
              onClick={() => onNavigateToCrm ? onNavigateToCrm('tasks') : handleItemSelect('docs', 'contracts')}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300"
              title="Открыть задачи и календарь в CRM"
            >
              <CheckSquare className="w-5 h-5" />
            </button>
          </div>
        )}
      </aside>
    );
  }

  // ----------------------------------------------------------------------
  // EXPANDED TREE ACCORDION MODE (305px Desktop / Mobile Drawer Full Width)
  // ----------------------------------------------------------------------
  return (
    <aside className="w-full lg:w-[305px] shrink-0 flex flex-col gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md p-4 sm:p-5 space-y-4">
        {/* Sidebar Header with Collapse Toggle */}
        <div className="flex items-center justify-between px-1 pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">Навигация</span>
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="Свернуть боковое меню в панель иконок"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Quick CRM Hub Launcher for Employees */}
        {hasCrmAccess && onNavigateToCrm && (
          <button
            type="button"
            onClick={() => onNavigateToCrm('funnels')}
            className="w-full p-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white text-left shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col gap-1.5 border border-blue-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-blue-100">
                Корпоративная CRM
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <div className="text-xs font-black leading-tight flex items-center gap-1.5 text-white">
              <Briefcase className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Единая среда CRM</span>
            </div>
            <div className="text-[10px] text-blue-100/90 leading-tight">
              Воронка сделок, контрагенты, ТКП, задачи и поверки ФГИС «АРШИН»
            </div>
          </button>
        )}

        {/* Tree Accordions */}
        <div className="space-y-3">
          {visibleSections.map(sec => {
            const isSectionActive = activeModule === sec.id;
            const isExpanded = expandedSections[sec.id] ?? true;
            const Icon = sec.icon;

            return (
              <div key={sec.id} className="rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                {/* Accordion Group Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer group ${
                    isSectionActive ? 'bg-blue-50/90 dark:bg-blue-950/50 font-bold border-b border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 border-b border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-xl ${isSectionActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 group-hover:border-blue-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-xs font-black truncate ${isSectionActive ? 'text-blue-950 dark:text-blue-200' : 'text-slate-900 dark:text-slate-100'}`}>
                      {sec.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-0' : '-rotate-90'
                      }`}
                    />
                  </div>
                </button>

                {/* Accordion Items List */}
                {isExpanded && (
                  <div className="p-2 space-y-1.5 bg-white dark:bg-slate-900">
                    {sec.items.map(item => {
                      const ItemIcon = item.icon;
                      const isItemActive = isSectionActive && activeSubTab === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleItemSelect(sec.id, item.id)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer group ${
                            isItemActive
                              ? 'bg-blue-600 text-white font-bold shadow-md ring-2 ring-blue-600'
                              : 'text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 border border-transparent hover:border-blue-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
                            <ItemIcon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isItemActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'
                              }`}
                            />
                            <span className="truncate" title={item.label}>{item.label}</span>
                          </div>

                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                                isItemActive
                                  ? 'bg-white/25 text-white'
                                  : item.badgeColor || 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
