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
    <div className="bg-white dark:bg-slate-900 rounded-lg border-2 border-slate-200 dark:border-slate-700 shadow-md p-4 w-full flex flex-col gap-3">
      {/* Header section optimized for narrow sidebar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <CheckSquare className="w-5 h-5 bg-blue-50 rounded-lg p-0.5" />
            <h3 className="text-sm font-bold text-gray-900 leading-tight">Мои задачи<br/>на сегодня</h3>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            title={expanded ? 'Свернуть список' : 'Показать задачи'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Badges block */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-800">
            {activeTodayTasks.length} к выполнению
          </span>
          {overdueTasks.length > 0 && (
            <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-red-100 text-red-700 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>{overdueTasks.length} просрочено</span>
            </span>
          )}
        </div>

        <p className="text-[11px] text-gray-500 leading-tight">
          Выполнено: {completedTodayTasks.length} из {todayTasks.length} • Дедлайны
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            onClick={() => onOpenTaskModal()}
            className="flex flex-col items-center justify-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer text-center"
          >
            <Plus className="w-4 h-4 mb-0.5" />
            <span>Новая</span>
          </button>
          <button
            onClick={onOpenFullModule}
            className="flex flex-col items-center justify-center py-2 bg-slate-50 hover:bg-gray-100 text-slate-500 border border-gray-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer text-center leading-tight px-1"
            title="Открыть модуль задач и интерактивный календарь"
          >
            <Calendar className="w-4 h-4 text-blue-600 mb-0.5" />
            <span>Календарь</span>
          </button>
        </div>
      </div>

      {/* Expanded list */}
      {expanded && (
        <div className="border-t border-gray-100 pt-3 space-y-2 animate-in fade-in duration-150">
          {todayTasks.length === 0 && overdueTasks.length === 0 ? (
            <div className="text-center py-4 text-[11px] text-gray-500 bg-slate-50 rounded-lg border border-gray-100">
              На сегодня запланированных задач нет.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Overdue first if any */}
              {overdueTasks.map(t => {
                const isDone = t.status === 'completed';
                return (
                  <div
                    key={`overdue-${t.id}`}
                    className="p-2.5 rounded-lg border border-red-200 bg-red-50/70 flex items-start gap-2.5 transition-all hover:bg-red-50"
                  >
                    <button
                      onClick={() => onToggleTaskStatus(t.id, t.status)}
                      className="mt-0.5 w-4 h-4 rounded-md border border-red-400 flex items-center justify-center bg-white text-red-600 hover:bg-red-100 transition-colors shrink-0"
                      title="Отметить выполненной"
                    >
                      {isDone && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenTaskModal(t)}>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-red-900 leading-tight">
                          {t.title}
                        </span>
                        <span className="text-[10px] font-bold text-red-700 w-fit">
                          Просрочено ({t.dueDate})
                        </span>
                      </div>
                      {t.targetTitle && (
                        <div className="text-[10px] text-red-800 flex items-center gap-1 mt-1 opacity-90 truncate">
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
                        ? 'bg-slate-50 border-gray-200 text-gray-500 opacity-70' 
                        : 'bg-white border-blue-100 hover:border-blue-300 shadow-sm'
                    }`}
                  >
                    <button
                      onClick={() => onToggleTaskStatus(t.id, t.status)}
                      className={`mt-0.5 w-4 h-4 shrink-0 rounded-md border flex items-center justify-center transition-colors ${
                        isDone 
                          ? 'bg-emerald-500 border-emerald-600 text-white' 
                          : 'border-gray-300 hover:border-blue-500 bg-white text-transparent'
                      }`}
                      title={isDone ? 'Вернуть в работу' : 'Отметить выполненной'}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onOpenTaskModal(t)}>
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs font-bold leading-tight ${isDone ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {t.title}
                        </span>
                        {t.priority === 'urgent' && !isDone && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-100 text-red-700 rounded-md w-fit uppercase tracking-wider">
                            Срочно
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-gray-500 mt-1.5">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-gray-400" />
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
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                          <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
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
