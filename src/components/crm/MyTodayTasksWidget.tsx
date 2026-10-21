import React, { useState } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Plus, 
  ChevronRight, 
  Check, 
  Bell, 
  ExternalLink,
  ChevronDown,
  Building2,
  User
} from 'lucide-react';
import { UserTask } from '../../types';

interface MyTodayTasksWidgetProps {
  tasks: UserTask[];
  onToggleTaskStatus: (taskId: string, currentStatus: string) => Promise<void>;
  onOpenTaskModal: (task?: UserTask) => void;
  onOpenFullModule: () => void;
}

export const MyTodayTasksWidget: React.FC<MyTodayTasksWidgetProps> = ({
  tasks,
  onToggleTaskStatus,
  onOpenTaskModal,
  onOpenFullModule
}) => {
  const [expanded, setExpanded] = useState(true);

  // Filter tasks for today or overdue
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr);
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);

  const completedTodayTasks = todayTasks.filter(t => t.status === 'completed');
  const activeTodayTasks = todayTasks.filter(t => t.status !== 'completed');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-800 shadow-md p-5 w-full flex flex-col gap-3">
      {/* Header section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900 rounded-lg">
              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                Мои оперативные задачи на сегодня
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Персональный чек-лист звонков, аудитов и дедлайнов
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            title={expanded ? 'Свернуть список' : 'Показать задачи'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Badges block */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {activeTodayTasks.length} к выполнению
          </span>
          {overdueTasks.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{overdueTasks.length} просрочено</span>
            </span>
          )}
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Выполнено: {completedTodayTasks.length} из {todayTasks.length}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            type="button"
            onClick={() => onOpenTaskModal()}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer text-center"
          >
            <Plus className="w-4 h-4" />
            <span>Новая задача</span>
          </button>
          <button
            type="button"
            onClick={onOpenFullModule}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
            title="Открыть модуль задач и интерактивный календарь"
          >
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Календарь задач</span>
          </button>
        </div>
      </div>

      {/* Expanded list */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 animate-in fade-in duration-150">
          {todayTasks.length === 0 && overdueTasks.length === 0 ? (
            <div className="text-center py-5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800">
              На сегодня запланированных задач нет. Все дедлайны закрыты.
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1">
              {/* Overdue first if any */}
              {overdueTasks.map(t => {
                const isDone = t.status === 'completed';
                return (
                  <div
                    key={`overdue-${t.id}`}
                    className="p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 flex items-start gap-2.5 transition-all hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTaskStatus(t.id, t.status)}
                      className="mt-0.5 w-4 h-4 rounded-md border border-rose-400 flex items-center justify-center bg-white dark:bg-slate-900 text-rose-600 hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
                      title="Отметить выполненной"
                    >
                      {isDone && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenTaskModal(t)}>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-rose-900 dark:text-rose-200 leading-tight">
                          {t.title}
                        </span>
                        <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 w-fit">
                          Просрочено ({t.dueDate})
                        </span>
                      </div>
                      {t.targetTitle && (
                        <div className="text-[10px] text-rose-800 dark:text-rose-300 flex items-center gap-1 mt-1 opacity-90 truncate">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{t.targetTitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Today's normal tasks */}
              {todayTasks.map(t => {
                const isDone = t.status === 'completed';
                const completedSub = t.checklist?.filter(c => c.completed).length || 0;
                const totalSub = t.checklist?.length || 0;
                return (
                  <div
                    key={`today-${t.id}`}
                    className={`p-2.5 rounded-lg border flex items-start gap-2.5 transition-all ${
                      isDone 
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-70' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleTaskStatus(t.id, t.status)}
                      className={`mt-0.5 w-4 h-4 shrink-0 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                        isDone 
                          ? 'bg-emerald-500 border-emerald-600 text-white' 
                          : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-white dark:bg-slate-800 text-transparent'
                      }`}
                      title={isDone ? 'Вернуть в работу' : 'Отметить выполненной'}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenTaskModal(t)}>
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-bold leading-tight ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                          {t.title}
                        </span>
                        {t.priority === 'urgent' && !isDone && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-md w-fit uppercase tracking-wider">
                            Срочно
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {t.dueTime || '18:00'}
                        </span>
                        {totalSub > 0 && (
                          <span className="flex items-center gap-1 font-medium">
                            <CheckSquare className="w-3 h-3 text-blue-500" />
                            {completedSub}/{totalSub}
                          </span>
                        )}
                      </div>
                      {t.targetTitle && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 truncate">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{t.targetTitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
