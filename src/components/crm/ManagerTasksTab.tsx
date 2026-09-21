import React, { useState, useEffect } from 'react';
import { ManagerTasksCalendarView } from './ManagerTasksCalendarView';
import { TaskModal } from './TaskModal';
import { CalendarEventModal } from './CalendarEventModal';
import { apiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { UserTask, CalendarEvent, CrmCompany, CrmContact } from '../../types';

export const ManagerTasksTab: React.FC = () => {
  const { showToast } = useApp();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<UserTask | null>(null);
  const [initialTaskDate, setInitialTaskDate] = useState<string>();
  
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [initialEventDate, setInitialEventDate] = useState<string>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, eventsRes, compRes, contRes] = await Promise.all([
        apiService.getCrmTasks(),
        apiService.getCrmCalendarEvents(),
        apiService.getCrmCompanies(),
        apiService.getCrmContacts()
      ]);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (eventsRes.success) setEvents(eventsRes.data);
      if (compRes.success) setCompanies(compRes.data);
      if (contRes.success) setContacts(contRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTask = async (taskData: Partial<UserTask>) => {
    // Optimistic update for status or fields if task already exists
    if (taskData.id) {
      setTasks(prev => prev.map(t => t.id === taskData.id ? { ...t, ...taskData } as UserTask : t));
    }
    const res = await apiService.saveCrmTask(taskData);
    if (res.success) {
      showToast('Задача успешно сохранена');
      setIsTaskModalOpen(false);
      loadData();
    } else {
      showToast(res.message || 'Ошибка при сохранении задачи');
      loadData(); // revert
    }
  };

  const handleDeleteTask = async (id: string) => {
    const res = await apiService.deleteCrmTask(id);
    if (res.success) {
      showToast('Задача удалена');
      loadData();
    }
  };

  const handleToggleTaskStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    // quick optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
    const res = await apiService.saveCrmTask({ id, status: newStatus });
    if (!res.success) {
      loadData(); // revert
    }
  };

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    const res = await apiService.saveCrmCalendarEvent(eventData);
    if (res.success) {
      showToast('Событие сохранено');
      setIsEventModalOpen(false);
      loadData();
    } else {
      showToast('Ошибка при сохранении события');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const res = await apiService.deleteCrmCalendarEvent(id);
    if (res.success) {
      showToast('Событие удалено');
      loadData();
    }
  };

  const handleToggleTaskChecklist = async (taskId: string, itemId: string, completed: boolean) => {
    // quick optimistic update
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          checklist: t.checklist.map(c => c.id === itemId ? { ...c, completed } : c)
        };
      }
      return t;
    }));
    const res = await apiService.toggleCrmTaskChecklist(taskId, itemId, completed);
    if (!res.success) {
      loadData();
    }
  };

  return (
    <>
      <ManagerTasksCalendarView
        tasks={tasks}
        calendarEvents={events}
        companies={companies}
        contacts={contacts}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        onToggleTaskChecklist={handleToggleTaskChecklist}
        onSaveEvent={handleSaveEvent}
        onDeleteEvent={handleDeleteEvent}
        onOpenTaskModal={(task, date) => {
          setSelectedTask(task || null);
          setInitialTaskDate(date);
          setIsTaskModalOpen(true);
        }}
        onOpenEventModal={(event, date) => {
          setSelectedEvent(event || null);
          setInitialEventDate(date);
          setIsEventModalOpen(true);
        }}
      />
      
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          task={selectedTask}
          companies={companies}
          contacts={contacts}
          initialDate={initialTaskDate}
        />
      )}

      {isEventModalOpen && (
        <CalendarEventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSave={handleSaveEvent}
          event={selectedEvent}
          companies={companies}
          contacts={contacts}
          initialDate={initialEventDate}
        />
      )}
    </>
  );
};
