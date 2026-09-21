import { HorizontalScrollContainer } from '../common/HorizontalScrollContainer';
import React, { useState, useMemo } from 'react';


import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Building2, 
  User, 
  Briefcase, 
  Phone, 
  Users, 
  Eye, 
  Wrench, 
  Trash2,
  MonitorPlay,
  GraduationCap, 
  Edit3, 
  Layers, 
  Tag,
  ListOrdered,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import { 
  UserTask, 
  CalendarEvent, 
  CrmCompany, 
  CrmContact, 
  TaskStatus, 
  TaskPriority, 
  CalendarEventType 
} from '../../types';

interface ManagerTasksCalendarViewProps {
  tasks: UserTask[];
  calendarEvents: CalendarEvent[];
  companies: CrmCompany[];
  contacts: CrmContact[];
  onSaveTask: (taskData: Partial<UserTask>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onToggleTaskChecklist: (taskId: string, itemId: string, completed: boolean) => Promise<void>;
  onSaveEvent: (eventData: Partial<CalendarEvent>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  onOpenTaskModal: (task?: UserTask, initialDate?: string) => void;
  onOpenEventModal: (event?: CalendarEvent, initialDate?: string) => void;
}

export const ManagerTasksCalendarView: React.FC<ManagerTasksCalendarViewProps> = ({
  tasks,
  calendarEvents,
  companies,
  contacts,
  onSaveTask,
  onDeleteTask,
  onToggleTaskChecklist,
  onSaveEvent,
  onDeleteEvent,
  onOpenTaskModal,
  onOpenEventModal,
}) => {
  // Main view mode: 'tasks' | 'calendar'
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'today' | 'overdue' | 'in_progress' | 'completed' | 'personal'>('all');
  const [tasksDisplayMode, setTasksDisplayMode] = useState<'kanban' | 'list'>('kanban');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires setting data to drag
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedTaskId) return;
    
    // Find the task
    const task = tasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== columnId) {
      // Cast columnId to TaskStatus
      await handleQuickStatusChange(draggedTaskId, columnId as 'new' | 'in_progress' | 'postponed' | 'completed');
    }
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar controls
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 3)); // 3 September 2026

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toTimeString().substring(0, 5);

  // Overdue count
  const overdueCount = useMemo(() => {
    return tasks.filter(t => {
      if (t.status === 'completed') return false;
      if (t.dueDate < todayStr) return true;
      if (t.dueDate === todayStr && t.dueTime && t.dueTime < nowTime) return true;
      return false;
    }).length;
  }, [tasks, todayStr, nowTime]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchTarget = t.targetTitle?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTarget) return false;
      }

      // Tab filter
      if (taskFilter === 'today') {
        return t.dueDate === todayStr;
      }
      if (taskFilter === 'overdue') {
        if (t.status === 'completed') return false;
        return t.dueDate < todayStr || (t.dueDate === todayStr && t.dueTime && t.dueTime < nowTime);
      }
      if (taskFilter === 'in_progress') {
        return t.status === 'in_progress';
      }
      if (taskFilter === 'completed') {
        return t.status === 'completed';
      }
      if (taskFilter === 'personal') {
        return t.targetType === 'personal';
      }
      return true;
    });
  }, [tasks, taskFilter, searchQuery, todayStr, nowTime]);

  // Tasks grouped for Kanban
  const kanbanColumns = useMemo(() => {
    return {
      new: filteredTasks.filter(t => t.status === 'new'),
      in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
      postponed: filteredTasks.filter(t => t.status === 'postponed'),
      completed: filteredTasks.filter(t => t.status === 'completed'),
    };
  }, [filteredTasks]);

  // Quick toggle task status
  const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await onSaveTask({ id: taskId, status: newStatus });
  };

  // Calendar navigation helpers
  const handlePrevPeriod = () => {
    const d = new Date(currentDate);
    if (calendarViewMode === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (calendarViewMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(d);
  };

  const handleNextPeriod = () => {
    const d = new Date(currentDate);
    if (calendarViewMode === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (calendarViewMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 3));
  };

  // Month grid calculations
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Russian week: Monday is 0, Sunday is 6
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days: Array<{ date: Date; isCurrentMonth: boolean; dateStr: string }> = [];

    // Prev month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateStr: d.toISOString().split('T')[0],
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        dateStr: d.toISOString().split('T')[0],
      });
    }

    // Next month days to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateStr: d.toISOString().split('T')[0],
      });
    }

    return days;
  }, [currentDate]);

  // Event color helper
  const getEventBadgeClass = (type: CalendarEventType) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'demo': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'presentation': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'training': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'other': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'maintenance': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventIcon = (type: CalendarEventType) => {
    switch (type) {
      case 'call': return Phone;
      case 'meeting': return Users;
      case 'demo': return Eye;
      case 'presentation': return MonitorPlay;
      case 'training': return GraduationCap;
      case 'other': return Edit3;
      case 'maintenance': return Wrench;
      default: return Calendar;
    }
  };

  const monthNamesRu = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  return (
    <div id="crm-tasks-calendar-container" className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Модуль личных задач менеджера и Интерактивный Календарь
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Самоконтроль инженера, дедлайны, звонки, встречи, демонстрации 3D-сканеров и регламентное ТО
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onOpenTaskModal()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Новая задача</span>
            </button>

            <button
              onClick={() => onOpenEventModal()}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Событие в календарь</span>
            </button>
          </div>
        </div>

        {/* Overdue alert strip if overdueCount > 0 */}
        {overdueCount > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-2 text-xs text-red-800">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 animate-bounce" />
              <span>Внимание! У вас есть {overdueCount} просроченных задач с горящими сроками. Рекомендуется пересмотреть приоритеты или связаться с заказчиками.</span>
            </div>
            <button
              onClick={() => {
                setActiveTab('tasks');
                setTaskFilter('overdue');
              }}
              className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
            >
              Показать просроченные
            </button>
          </div>
        )}

        {/* View mode switcher */}
        <div className="mt-6 flex items-center justify-between border-b border-gray-200 pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Личные задачи и цели ({tasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-gray-100 text-slate-500 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Интерактивный календарь CRM ({calendarEvents.length})</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по задачам и событиям..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:border-blue-500 outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. TASKS TAB VIEW */}
      {/* ======================================================== */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Subfilter chips & display mode */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'Все задачи' },
                { id: 'today', label: 'На сегодня' },
                { id: 'overdue', label: `Просроченные (${overdueCount})`, isAlert: overdueCount > 0 },
                { id: 'in_progress', label: 'В работе' },
                { id: 'completed', label: 'Выполненные' },
                { id: 'personal', label: 'Личные цели' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setTaskFilter(f.id as any)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    taskFilter === f.id
                      ? f.isAlert 
                        ? 'bg-red-600 text-white shadow-xs' 
                        : 'bg-blue-600 text-white shadow-xs'
                      : f.isAlert
                        ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        : 'bg-white text-slate-500 border border-gray-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setTasksDisplayMode('kanban')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  tasksDisplayMode === 'kanban' ? 'bg-white text-gray-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Канбан</span>
              </button>
              <button
                onClick={() => setTasksDisplayMode('list')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  tasksDisplayMode === 'list' ? 'bg-white text-gray-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Список</span>
              </button>
            </div>
          </div>

          {/* KANBAN BOARD */}
          {tasksDisplayMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { id: 'new', label: 'Новые задачи', count: kanbanColumns.new.length, color: 'blue' },
                { id: 'in_progress', label: 'В работе', count: kanbanColumns.in_progress.length, color: 'amber' },
                { id: 'postponed', label: 'Отложенные', count: kanbanColumns.postponed.length, color: 'gray' },
                { id: 'completed', label: 'Выполнено', count: kanbanColumns.completed.length, color: 'emerald' },
              ].map(col => {
                const colTasks = kanbanColumns[col.id as keyof typeof kanbanColumns];
                return (
                  <div 
                    key={col.id} 
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={`border rounded-lg p-3.5 flex flex-col min-h-[450px] transition-colors ${
                      dragOverColumn === col.id ? 'bg-blue-50 border-blue-300 shadow-inner' : 'bg-slate-50/80 border-slate-200'
                    }`}
                  >
                    {/* Col header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          col.id === 'new' ? 'bg-blue-500' :
                          col.id === 'in_progress' ? 'bg-amber-500' :
                          col.id === 'postponed' ? 'bg-gray-400' : 'bg-emerald-500'
                        }`} />
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{col.label}</h3>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-slate-500">
                        {col.count}
                      </span>
                    </div>

                    {/* Task cards list */}
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {colTasks.length === 0 ? (
                        <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-[11px] text-gray-400">
                          Нет задач
                        </div>
                      ) : (
                        colTasks.map(task => {
                          const isOverdue = task.status !== 'completed' && (
                            task.dueDate < todayStr || 
                            (task.dueDate === todayStr && task.dueTime && task.dueTime < nowTime)
                          );
                          const totalCheck = task.checklist?.length || 0;
                          const doneCheck = task.checklist?.filter(c => c.completed).length || 0;

                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              onDragEnd={handleDragEnd}
                              className={`bg-white rounded-lg p-3.5 border transition-all hover:shadow-md cursor-grab active:cursor-grabbing ${
                                draggedTaskId === task.id ? 'opacity-40 scale-95' : 'opacity-100'
                              } ${
                                isOverdue 
                                  ? 'border-red-300 bg-red-50/20' 
                                  : 'border-gray-200'
                              }`}
                            >
                              {/* Top chips */}
                              <div className="flex items-center justify-between gap-1.5 mb-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {task.priority === 'urgent' && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md">
                                      Срочно
                                    </span>
                                  )}
                                  {task.priority === 'medium' && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                                      Средний
                                    </span>
                                  )}
                                  {isOverdue && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-600 text-white rounded-md flex items-center gap-1">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      Просрочено
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => onOpenTaskModal(task)}
                                    className="text-gray-400 hover:text-blue-600 p-1 rounded transition-colors"
                                    title="Редактировать задачу"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Удалить задачу «${task.title}»?`)) {
                                        onDeleteTask(task.id);
                                      }
                                    }}
                                    className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                                    title="Удалить задачу"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Title */}
                              <h4 
                                onClick={() => onOpenTaskModal(task)}
                                className="text-xs font-bold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2"
                              >
                                {task.title}
                              </h4>

                              {/* Description snippet */}
                              {task.description && (
                                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {/* Target context */}
                              {task.targetTitle && (
                                <div className="mt-2 text-[11px] font-medium text-slate-500 bg-slate-50 border border-gray-100 px-2 py-1 rounded-lg flex items-center gap-1 truncate">
                                  {task.targetType === 'company' && <Building2 className="w-3 h-3 text-blue-500 shrink-0" />}
                                  {task.targetType === 'contact' && <User className="w-3 h-3 text-emerald-500 shrink-0" />}
                                  {task.targetType === 'deal' && <Briefcase className="w-3 h-3 text-purple-500 shrink-0" />}
                                  <span className="truncate">{task.targetTitle}</span>
                                </div>
                              )}

                              {/* Checklist mini-progress & toggle */}
                              {totalCheck > 0 && (
                                <div className="mt-2.5 pt-2 border-t border-gray-100">
                                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                                    <span>Чек-лист</span>
                                    <span className="font-bold">{doneCheck} из {totalCheck}</span>
                                  </div>
                                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-2">
                                    <div 
                                      className="bg-blue-600 h-full rounded-full transition-all"
                                      style={{ width: `${(doneCheck / totalCheck) * 100}%` }}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    {task.checklist.slice(0, 3).map(chk => (
                                      <label key={chk.id} className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={chk.completed}
                                          onChange={() => onToggleTaskChecklist(task.id, chk.id, !chk.completed)}
                                          className="w-3.5 h-3.5 rounded text-blue-600"
                                        />
                                        <span className={`truncate ${chk.completed ? 'line-through text-gray-400' : ''}`}>
                                          {chk.text}
                                        </span>
                                      </label>
                                    ))}
                                    {totalCheck > 3 && (
                                      <span 
                                        onClick={() => onOpenTaskModal(task)}
                                        className="text-[10px] text-blue-600 font-semibold cursor-pointer block hover:underline"
                                      >
                                        + еще {totalCheck - 3} подзадач
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Footer row: Date, time, quick move */}
                              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                                <span className={`flex items-center gap-1 font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                  <Clock className="w-3 h-3" />
                                  {task.dueDate} {task.dueTime}
                                </span>

                                <select
                                  value={task.status}
                                  onChange={(e) => handleQuickStatusChange(task.id, e.target.value as TaskStatus)}
                                  className="text-[10px] font-bold bg-slate-50 border border-gray-200 rounded-md px-1.5 py-0.5 outline-hidden"
                                >
                                  <option value="new">Новая</option>
                                  <option value="in_progress">В работе</option>
                                  <option value="postponed">Отложена</option>
                                  <option value="completed">Выполнена</option>
                                </select>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {tasksDisplayMode === 'list' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
              <HorizontalScrollContainer>
                <table className="min-w-[800px] w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-3 w-8">#</th>
                    <th className="p-3">Задача / Цель</th>
                    <th className="p-3">Контекст (Предприятие / Сделка)</th>
                    <th className="p-3">Срок и время</th>
                    <th className="p-3">Приоритет</th>
                    <th className="p-3">Чек-лист</th>
                    <th className="p-3">Статус</th>
                    <th className="p-3 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-400">
                        Задач по выбранным фильтрам не найдено.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
                      const isOverdue = task.status !== 'completed' && (
                        task.dueDate < todayStr || 
                        (task.dueDate === todayStr && task.dueTime && task.dueTime < nowTime)
                      );
                      const doneCheck = task.checklist?.filter(c => c.completed).length || 0;
                      const totalCheck = task.checklist?.length || 0;

                      return (
                        <tr 
                          key={task.id} 
                          className={`hover:bg-blue-50/30 transition-colors ${
                            isOverdue ? 'bg-red-50/30' : ''
                          }`}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              onChange={() => handleQuickStatusChange(
                                task.id, 
                                task.status === 'completed' ? 'in_progress' : 'completed'
                              )}
                              className="w-4 h-4 rounded text-blue-600 border-gray-300"
                            />
                          </td>
                          <td className="p-3">
                            <span 
                              onClick={() => onOpenTaskModal(task)}
                              className={`font-bold hover:text-blue-600 cursor-pointer ${
                                task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{task.description}</p>
                            )}
                          </td>
                          <td className="p-3">
                            {task.targetTitle ? (
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-500 bg-gray-100 px-2 py-0.5 rounded-lg text-[11px]">
                                <Building2 className="w-3 h-3 text-blue-500" />
                                {task.targetTitle}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">Личная цель</span>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <div className="flex items-center gap-1 font-semibold">
                              <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-600' : 'text-gray-400'}`} />
                              <span className={isOverdue ? 'text-red-600 font-bold' : ''}>
                                {task.dueDate} {task.dueTime}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            {task.priority === 'urgent' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700">
                                Срочный
                              </span>
                            )}
                            {task.priority === 'medium' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                                Средний
                              </span>
                            )}
                            {task.priority === 'low' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Плановый
                              </span>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {totalCheck > 0 ? (
                              <span className="text-[11px] font-semibold text-slate-500">
                                {doneCheck} / {totalCheck}
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="p-3">
                            <select
                              value={task.status}
                              onChange={(e) => handleQuickStatusChange(task.id, e.target.value as TaskStatus)}
                              className="text-xs font-semibold bg-slate-50 border border-gray-200 rounded-lg px-2 py-1 outline-hidden"
                            >
                              <option value="new">Новая</option>
                              <option value="in_progress">В работе</option>
                              <option value="postponed">Отложена</option>
                              <option value="completed">Выполнена</option>
                            </select>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onOpenTaskModal(task)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                                title="Редактировать"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Удалить задачу «${task.title}»?`)) {
                                    onDeleteTask(task.id);
                                  }
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                                title="Удалить"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              </HorizontalScrollContainer>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CALENDAR TAB VIEW */}
      {/* ======================================================== */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-4">
          {/* Calendar top controls */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900">
                {monthNamesRu[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={handlePrevPeriod}
                  className="p-1.5 text-slate-500 hover:text-gray-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  title="Предыдущий месяц"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleToday}
                  className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-gray-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
                >
                  Сегодня
                </button>
                <button
                  onClick={handleNextPeriod}
                  className="p-1.5 text-slate-500 hover:text-gray-900 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  title="Следующий месяц"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Event Legend */}
            <div className="flex items-center gap-3 flex-wrap text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Звонок</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Встреча</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Демонстрация</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Презентация</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Обучение</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span>Прочее</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>ТО КИМ/Станков</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Дедлайн задачи</span>
              </span>
            </div>
          </div>

          {/* Calendar Month Grid */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <HorizontalScrollContainer>
            <div className="min-w-[1000px]">
            {/* Days of week header */}
            <div className="grid grid-cols-7 bg-slate-50 border-b border-gray-200 text-center text-xs font-bold text-slate-500 py-2.5">
              <span>Пн</span>
              <span>Вт</span>
              <span>Ср</span>
              <span>Чт</span>
              <span>Пт</span>
              <span className="text-red-500">Сб</span>
              <span className="text-red-500">Вс</span>
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-200 bg-gray-100">
              {monthDays.map((d, idx) => {
                const isToday = d.dateStr === todayStr;
                const cellEvents = calendarEvents.filter(e => e.startDateTime.startsWith(d.dateStr));
                const cellTasks = tasks.filter(t => t.dueDate === d.dateStr);

                return (
                  <div
                    key={idx}
                    className={`min-h-[110px] p-2 bg-white flex flex-col justify-between transition-colors group relative ${
                      !d.isCurrentMonth ? 'bg-slate-50/60 text-gray-400' : ''
                    } ${isToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/20' : ''}`}
                  >
                    {/* Top: day number + add button */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold ${
                        isToday 
                          ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center' 
                          : d.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {d.date.getDate()}
                      </span>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          onClick={() => onOpenEventModal(undefined, d.dateStr)}
                          className="p-0.5 text-purple-600 hover:bg-purple-50 rounded"
                          title="Добавить событие на этот день"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Events list in this cell */}
                    <div className="space-y-1 overflow-hidden flex-1">
                      {/* Calendar Events */}
                      {cellEvents.map(event => {
                        const Icon = getEventIcon(event.type);
                        const timeStr = event.startDateTime.substring(11, 16);

                        return (
                          <div
                            key={event.id}
                            onClick={() => onOpenEventModal(event)}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border truncate cursor-pointer transition-transform hover:scale-102 flex items-center gap-1 ${getEventBadgeClass(event.type)}`}
                            title={`${event.title} (${timeStr})${event.type === 'other' && event.customType ? ` [${event.customType}]` : ''}`}
                          >
                            <Icon className="w-2.5 h-2.5 shrink-0" />
                            <span className="font-normal opacity-80">{timeStr}</span>
                            <span className="truncate">{event.title}</span>
                          </div>
                        );
                      })}

                      {/* User Tasks Due Today */}
                      {cellTasks.map(task => {
                        const isDone = task.status === 'completed';
                        return (
                          <div
                            key={task.id}
                            onClick={() => onOpenTaskModal(task)}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border truncate cursor-pointer transition-transform hover:scale-102 flex items-center gap-1 ${
                              isDone 
                                ? 'bg-gray-100 text-gray-500 border-gray-200 line-through' 
                                : task.priority === 'urgent'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                            title={`Задача: ${task.title}`}
                          >
                            <CheckSquare className="w-2.5 h-2.5 shrink-0 text-blue-600" />
                            <span className="truncate">{task.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
            </HorizontalScrollContainer>
          </div>
        </div>
      )}
    </div>
  );
};
